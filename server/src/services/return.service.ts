import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import { redisClient } from '../config/redis';
import PosTransaction from '../models/posTransaction.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import { PosTransactionType, ReturnReason } from '../interfaces/posTransaction.interface';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import * as loyaltyService from './loyalty.service';
import logger from '../utils/logger';
import { toObjectId } from '../utils/idConverter';
import { sendEmail } from './email.service';

/**
 * Process a full return of a transaction
 */
export const processFullReturn = async ({
  originalTransactionId,
  returnReason,
  returnReasonDetails,
  paymentMethods,
  notes,
  userId,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get original transaction
    const originalTransaction = await PosTransaction.findById(originalTransactionId)
      .populate('items.product')
      .session(session);

    if (!originalTransaction) {
      throw new AppError(`Original transaction not found: ${originalTransactionId}`, 404);
    }

    // Check if transaction can be returned
    if (originalTransaction.transactionType !== PosTransactionType.SALE) {
      throw new AppError('Only sales can be returned', 400);
    }

    if (originalTransaction.status !== SaleStatus.COMPLETED) {
      throw new AppError('Only completed transactions can be returned', 400);
    }

    // Check if transaction has already been returned
    const existingReturn = await PosTransaction.findOne({
      originalSale: originalTransactionId,
      transactionType: { $in: [PosTransactionType.RETURN, PosTransactionType.REFUND] },
      status: SaleStatus.COMPLETED,
    }).session(session);

    if (existingReturn) {
      throw new AppError('This transaction has already been returned', 400);
    }

    // Get active POS session
    const posSession = await mongoose.model('PosSession').findOne({
      status: 'open',
      cashier: userId,
    }).session(session);

    if (!posSession) {
      throw new AppError('No active POS session found', 400);
    }

    // Create return transaction
    const returnTransaction = new PosTransaction({
      customer: originalTransaction.customer,
      transactionType: PosTransactionType.RETURN,
      posSession: posSession._id,
      register: posSession.register,
      cashier: userId,
      items: originalTransaction.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      })),
      subtotal: originalTransaction.subtotal,
      discount: originalTransaction.discount,
      tax: originalTransaction.tax,
      total: originalTransaction.total,
      paymentMethods: paymentMethods || [],
      paymentStatus: PaymentStatus.REFUNDED,
      paymentMethod: 'multiple',
      notes,
      location: originalTransaction.location,
      status: SaleStatus.COMPLETED,
      saleDate: new Date(),
      createdBy: userId,
      returnReason,
      returnReasonDetails,
      originalSale: originalTransaction._id,
    });

    // Update inventory - add items back to stock
    for (const item of originalTransaction.items) {
      const product = await Product.findById(item.product._id).session(session);
      
      if (!product) {
        throw new AppError(`Product not found: ${item.product._id}`, 404);
      }
      
      // Update specific batch if provided
      if (item.batchNumber) {
        const batchIndex = product.inventory.findIndex(
          inv => inv.batchNumber === item.batchNumber
        );
        
        if (batchIndex >= 0) {
          product.inventory[batchIndex].quantity += item.quantity;
        } else {
          // If batch doesn't exist anymore, create a new inventory entry
          product.inventory.push({
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate || new Date(),
            quantity: item.quantity,
            location: 'returned',
            costPrice: item.unitPrice,
          });
        }
      }
      
      // Update total stock
      product.totalStock += item.quantity;
      await product.save({ session });

      // Clear product cache
      if (redisClient.isOpen) {
        await redisClient.del(`product:${product._id}:stock`);
      }
    }

    // Handle loyalty points if applicable
    if (originalTransaction.loyaltyPointsEarned > 0) {
      // Get customer
      const customer = await Customer.findById(originalTransaction.customer).session(session);
      
      if (customer) {
        try {
          // Reverse loyalty points earned from original transaction
          const loyaltyResult = await loyaltyService.redeemLoyaltyPoints(
            customer._id.toString(),
            originalTransaction.loyaltyPointsEarned,
            userId,
            returnTransaction._id.toString()
          );
          
          returnTransaction.loyaltyPointsReturned = originalTransaction.loyaltyPointsEarned;
        } catch (error) {
          logger.error('Error reversing loyalty points:', error);
          // Continue with return even if loyalty points can't be reversed
        }
      }
    }

    // Save return transaction
    await returnTransaction.save({ session });

    // Update POS session expected closing balance
    const cashPayment = paymentMethods.find(method => method.method === 'cash');
    if (cashPayment) {
      posSession.expectedClosingBalance -= cashPayment.amount;
      await posSession.save({ session });
    }

    // Send email notification if customer has email
    if (originalTransaction.customer) {
      const customer = await Customer.findById(originalTransaction.customer).session(session);
      
      if (customer?.email) {
        try {
          await sendReturnConfirmationEmail(returnTransaction, customer, originalTransaction);
        } catch (emailError) {
          logger.error('Error sending return confirmation email:', emailError);
          // Continue with return even if email fails
        }
      }
    }

    await session.commitTransaction();
    return returnTransaction;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in processFullReturn:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Process a partial return of a transaction
 */
export const processPartialReturn = async ({
  originalTransactionId,
  returnItems,
  returnReason,
  returnReasonDetails,
  paymentMethods,
  notes,
  userId,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get original transaction
    const originalTransaction = await PosTransaction.findById(originalTransactionId)
      .populate('items.product')
      .session(session);

    if (!originalTransaction) {
      throw new AppError(`Original transaction not found: ${originalTransactionId}`, 404);
    }

    // Check if transaction can be returned
    if (originalTransaction.transactionType !== PosTransactionType.SALE) {
      throw new AppError('Only sales can be returned', 400);
    }

    if (originalTransaction.status !== SaleStatus.COMPLETED) {
      throw new AppError('Only completed transactions can be returned', 400);
    }

    // Validate return items
    if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
      throw new AppError('No items to return', 400);
    }

    // Map of original item IDs to quantities being returned
    const returnItemMap = new Map();
    returnItems.forEach(item => {
      returnItemMap.set(item.originalItemId.toString(), item.quantity);
    });

    // Validate that all return items exist in original transaction
    // and that return quantities don't exceed original quantities
    const itemsToReturn = [];
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    for (const originalItem of originalTransaction.items) {
      const originalItemId = originalItem._id.toString();
      const returnQuantity = returnItemMap.get(originalItemId) || 0;
      
      if (returnQuantity > 0) {
        if (returnQuantity > originalItem.quantity) {
          throw new AppError(
            `Return quantity (${returnQuantity}) exceeds original quantity (${originalItem.quantity}) for item ${originalItemId}`,
            400
          );
        }
        
        // Calculate proportional values
        const proportion = returnQuantity / originalItem.quantity;
        const itemSubtotal = originalItem.subtotal * proportion;
        const itemDiscount = (originalItem.discount || 0) * proportion;
        
        itemsToReturn.push({
          product: originalItem.product._id,
          quantity: returnQuantity,
          unitPrice: originalItem.unitPrice,
          discount: itemDiscount,
          subtotal: itemSubtotal,
          batchNumber: originalItem.batchNumber,
          expiryDate: originalItem.expiryDate,
          originalItemId: originalItem._id,
        });
        
        subtotal += itemSubtotal;
        discount += itemDiscount;
      }
    }

    // Calculate proportional tax
    tax = (originalTransaction.tax || 0) * (subtotal / originalTransaction.subtotal);
    
    // Calculate total
    const total = subtotal - discount + tax;

    // Get active POS session
    const posSession = await mongoose.model('PosSession').findOne({
      status: 'open',
      cashier: userId,
    }).session(session);

    if (!posSession) {
      throw new AppError('No active POS session found', 400);
    }

    // Create partial return transaction
    const returnTransaction = new PosTransaction({
      customer: originalTransaction.customer,
      transactionType: PosTransactionType.PARTIAL_RETURN,
      posSession: posSession._id,
      register: posSession.register,
      cashier: userId,
      items: itemsToReturn,
      subtotal,
      discount,
      tax,
      total,
      paymentMethods: paymentMethods || [],
      paymentStatus: PaymentStatus.REFUNDED,
      paymentMethod: 'multiple',
      notes,
      location: originalTransaction.location,
      status: SaleStatus.COMPLETED,
      saleDate: new Date(),
      createdBy: userId,
      returnReason,
      returnReasonDetails,
      originalSale: originalTransaction._id,
      returnedItems: itemsToReturn.map(item => item.originalItemId),
    });

    // Update inventory - add returned items back to stock
    for (const item of itemsToReturn) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        throw new AppError(`Product not found: ${item.product}`, 404);
      }
      
      // Update specific batch if provided
      if (item.batchNumber) {
        const batchIndex = product.inventory.findIndex(
          inv => inv.batchNumber === item.batchNumber
        );
        
        if (batchIndex >= 0) {
          product.inventory[batchIndex].quantity += item.quantity;
        } else {
          // If batch doesn't exist anymore, create a new inventory entry
          product.inventory.push({
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate || new Date(),
            quantity: item.quantity,
            location: 'returned',
            costPrice: item.unitPrice,
          });
        }
      }
      
      // Update total stock
      product.totalStock += item.quantity;
      await product.save({ session });

      // Clear product cache
      if (redisClient.isOpen) {
        await redisClient.del(`product:${product._id}:stock`);
      }
    }

    // Handle loyalty points if applicable
    if (originalTransaction.loyaltyPointsEarned > 0) {
      // Get customer
      const customer = await Customer.findById(originalTransaction.customer).session(session);
      
      if (customer) {
        try {
          // Calculate proportional loyalty points to return
          const loyaltyPointsToReturn = Math.floor(
            originalTransaction.loyaltyPointsEarned * (total / originalTransaction.total)
          );
          
          if (loyaltyPointsToReturn > 0) {
            // Reverse proportional loyalty points
            const loyaltyResult = await loyaltyService.redeemLoyaltyPoints(
              customer._id.toString(),
              loyaltyPointsToReturn,
              userId,
              returnTransaction._id.toString()
            );
            
            returnTransaction.loyaltyPointsReturned = loyaltyPointsToReturn;
          }
        } catch (error) {
          logger.error('Error reversing loyalty points:', error);
          // Continue with return even if loyalty points can't be reversed
        }
      }
    }

    // Save return transaction
    await returnTransaction.save({ session });

    // Update POS session expected closing balance
    const cashPayment = paymentMethods.find(method => method.method === 'cash');
    if (cashPayment) {
      posSession.expectedClosingBalance -= cashPayment.amount;
      await posSession.save({ session });
    }

    // Send email notification if customer has email
    if (originalTransaction.customer) {
      const customer = await Customer.findById(originalTransaction.customer).session(session);
      
      if (customer?.email) {
        try {
          await sendReturnConfirmationEmail(returnTransaction, customer, originalTransaction);
        } catch (emailError) {
          logger.error('Error sending return confirmation email:', emailError);
          // Continue with return even if email fails
        }
      }
    }

    await session.commitTransaction();
    return returnTransaction;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in processPartialReturn:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Send return confirmation email
 */
const sendReturnConfirmationEmail = async (returnTransaction, customer, originalTransaction) => {
  try {
    const subject = `Return Confirmation - ${returnTransaction.saleNumber}`;
    
    // Generate return confirmation HTML
    const returnHtml = `
      <h2>Return Confirmation</h2>
      <p>Date: ${new Date(returnTransaction.saleDate).toLocaleDateString()}</p>
      <p>Customer: ${customer.firstName} ${customer.lastName}</p>
      <p>Return Number: ${returnTransaction.saleNumber}</p>
      <p>Original Sale: ${originalTransaction.saleNumber} (${new Date(originalTransaction.saleDate).toLocaleDateString()})</p>
      <hr>
      <h3>Returned Items</h3>
      <table border="1" cellpadding="5" cellspacing="0" width="100%">
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
        ${returnTransaction.items.map(item => `
          <tr>
            <td>${item.product.name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <p><strong>Subtotal:</strong> $${returnTransaction.subtotal.toFixed(2)}</p>
      <p><strong>Tax:</strong> $${returnTransaction.tax.toFixed(2)}</p>
      <p><strong>Total Refund:</strong> $${returnTransaction.total.toFixed(2)}</p>
      <hr>
      <p>Return Reason: ${returnTransaction.returnReason}</p>
      ${returnTransaction.returnReasonDetails ? `<p>Details: ${returnTransaction.returnReasonDetails}</p>` : ''}
      <p>Thank you for your business!</p>
    `;
    
    // Send email
    return await sendEmail({
      to: customer.email,
      subject,
      text: `Return confirmation for ${returnTransaction.saleNumber}`,
      html: returnHtml,
    });
  } catch (error) {
    logger.error('Error generating return confirmation email:', error);
    return false;
  }
};

/**
 * Get returnable transactions for a customer
 */
export const getReturnableTransactions = async (customerId, days = 30) => {
  try {
    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    // Find eligible transactions
    const transactions = await PosTransaction.find({
      customer: customerId,
      transactionType: PosTransactionType.SALE,
      status: SaleStatus.COMPLETED,
      saleDate: { $gte: dateThreshold },
    })
      .populate('items.product', 'name sku barcode')
      .sort({ saleDate: -1 });
    
    // Filter out transactions that have already been fully returned
    const returnedTransactionIds = await PosTransaction.distinct('originalSale', {
      transactionType: PosTransactionType.RETURN,
      status: SaleStatus.COMPLETED,
    });
    
    const returnedTransactionIdSet = new Set(
      returnedTransactionIds.map(id => id.toString())
    );
    
    // Get partial returns to check for remaining returnable items
    const partialReturns = await PosTransaction.find({
      transactionType: PosTransactionType.PARTIAL_RETURN,
      status: SaleStatus.COMPLETED,
    }).select('originalSale returnedItems');
    
    // Map of original transaction ID to returned item IDs
    const partialReturnMap = new Map();
    partialReturns.forEach(partialReturn => {
      const originalId = partialReturn.originalSale.toString();
      const returnedItems = partialReturn.returnedItems || [];
      
      if (!partialReturnMap.has(originalId)) {
        partialReturnMap.set(originalId, new Set());
      }
      
      returnedItems.forEach(itemId => {
        partialReturnMap.get(originalId).add(itemId.toString());
      });
    });
    
    // Filter and process transactions
    const returnableTransactions = transactions
      .filter(transaction => !returnedTransactionIdSet.has(transaction._id.toString()))
      .map(transaction => {
        const transactionId = transaction._id.toString();
        const returnedItemIds = partialReturnMap.get(transactionId) || new Set();
        
        // Filter out items that have already been returned
        const returnableItems = transaction.items.filter(
          item => !returnedItemIds.has(item._id.toString())
        );
        
        // Only include transaction if it has returnable items
        if (returnableItems.length === 0) {
          return null;
        }
        
        return {
          ...transaction.toObject(),
          items: returnableItems,
          hasPartialReturns: returnedItemIds.size > 0,
        };
      })
      .filter(Boolean); // Remove null entries
    
    return returnableTransactions;
  } catch (error) {
    logger.error('Error in getReturnableTransactions:', error);
    throw error;
  }
};
