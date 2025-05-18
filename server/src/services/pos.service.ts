import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import { redisClient } from '../config/redis';
import Sale from '../models/sale.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import PosTransaction from '../models/posTransaction.model';
import PosSession from '../models/posSession.model';
import Prescription from '../models/prescription.model';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import { sendEmail } from './email.service';
import logger from '../utils/logger';
import { toObjectId } from '../utils/idConverter';

interface SaleItem {
  product: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  batchNumber?: string;
  expiryDate?: Date;
}

interface CreateSaleParams {
  items: SaleItem[];
  customer?: string;
  paymentMethod: string;
  notes?: string;
  userId: string;
  location: string;
  prescription?: string;
  doctor?: string;
  emailReceipt?: boolean;
  refillReminder?: boolean;
  refillReminderDate?: Date;
}

/**
 * Create a new sale with proper transaction handling
 */
export const createSale = async ({
  items,
  customer,
  paymentMethod,
  notes,
  userId,
  location,
  prescription,
  doctor,
  emailReceipt = false,
  refillReminder = false,
  refillReminderDate,
}: CreateSaleParams) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate items and check stock
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new AppError(`Product not found: ${item.product}`, 404);
        }

        if (product.totalStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${product.name}. Available: ${product.totalStock}`,
            400
          );
        }

        // Find the specific batch if provided, otherwise use the first available batch
        let batchNumber = item.batchNumber;
        let expiryDate = item.expiryDate;

        if (!batchNumber && product.inventory && product.inventory.length > 0) {
          // Sort inventory by expiry date (earliest first)
          const sortedInventory = [...product.inventory].sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );

          // Find first batch with sufficient quantity
          const batch = sortedInventory.find(inv => inv.quantity >= item.quantity);
          if (batch) {
            batchNumber = batch.batchNumber;
            expiryDate = batch.expiryDate;
          } else {
            // If no single batch has enough, we'll need to handle partial quantities
            // For now, just use the first batch and show a warning
            if (sortedInventory[0]) {
              batchNumber = sortedInventory[0].batchNumber;
              expiryDate = sortedInventory[0].expiryDate;
              logger.warn(`Insufficient quantity in a single batch for ${product.name}. Using first available batch.`);
            }
          }
        }

        if (!batchNumber) {
          throw new AppError(`No batch available for product ${product.name}`, 400);
        }

        return {
          ...item,
          product,
          batchNumber,
          expiryDate,
          subtotal: item.quantity * item.unitPrice,
          finalPrice:
            item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
        };
      })
    );

    // Validate customer if provided
    let customerDoc;
    if (customer) {
      customerDoc = await Customer.findById(customer).session(session);
      if (!customerDoc) {
        throw new AppError(`Customer not found: ${customer}`, 404);
      }
    }

    // Validate prescription if provided
    let prescriptionDoc;
    if (prescription) {
      prescriptionDoc = await Prescription.findById(prescription).session(session);
      if (!prescriptionDoc) {
        throw new AppError(`Prescription not found: ${prescription}`, 404);
      }
    }

    // Validate doctor if provided
    let doctorDoc;
    if (doctor) {
      doctorDoc = await Customer.findById(doctor).session(session);
      if (!doctorDoc) {
        throw new AppError(`Doctor not found: ${doctor}`, 404);
      }
    }

    // Calculate totals
    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const totalDiscount = validatedItems.reduce(
      (sum, item) => sum + (item.subtotal - item.finalPrice),
      0
    );
    const total = subtotal - totalDiscount;

    // Create sale
    const sale = await Sale.create(
      [
        {
          items: validatedItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal,
            finalPrice: item.finalPrice,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
          })),
          customer: customerDoc?._id,
          subtotal,
          totalDiscount,
          total,
          paymentMethod,
          notes,
          status: SaleStatus.COMPLETED,
          createdBy: userId,
          saleDate: new Date(),
          location: toObjectId(location),
          prescription: prescriptionDoc?._id,
          doctor: doctorDoc?._id,
          emailReceipt,
          refillReminder,
          refillReminderDate,
        },
      ],
      { session }
    );

    // Update product stock
    await Promise.all(
      validatedItems.map(async (item) => {
        const product = item.product;

        // Update specific batch if provided
        if (item.batchNumber) {
          const batchIndex = product.inventory.findIndex(
            inv => inv.batchNumber === item.batchNumber
          );

          if (batchIndex >= 0) {
            product.inventory[batchIndex].quantity -= item.quantity;
          }
        }

        // Update total stock
        product.totalStock -= item.quantity;
        await product.save({ session });

        // Clear product cache
        if (redisClient.isOpen) {
          await redisClient.del(`product:${product._id}:stock`);
        }
      })
    );

    // Update customer purchase history if applicable
    if (customerDoc) {
      customerDoc.totalPurchases = (customerDoc.totalPurchases || 0) + total;
      customerDoc.lastPurchaseDate = new Date();
      await customerDoc.save({ session });

      // Clear customer cache
      if (redisClient.isOpen) {
        await redisClient.del(`customer:${customerDoc._id}`);
      }
    }

    // Update prescription status if applicable
    if (prescriptionDoc) {
      prescriptionDoc.dispensed = true;
      prescriptionDoc.dispensedDate = new Date();
      prescriptionDoc.dispensedBy = toObjectId(userId);
      await prescriptionDoc.save({ session });
    }

    // Send email receipt if requested
    if (emailReceipt && customerDoc?.email) {
      try {
        // We'll implement this in the email service later
        // This is just a placeholder to show the integration
        const emailSent = await sendReceiptEmail(sale[0], customerDoc);
        if (emailSent) {
          sale[0].emailSent = true;
          await sale[0].save({ session });
        }
      } catch (emailError) {
        // Log error but don't fail the transaction
        logger.error('Error sending receipt email:', emailError);
      }
    }

    await session.commitTransaction();
    return sale[0];
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in createSale:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Void a sale with proper transaction handling
 */
export const voidSale = async (
  saleId: string,
  userId: string,
  reason: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    if (sale.status === SaleStatus.VOIDED) {
      throw new AppError('Sale is already voided', 400);
    }

    // Restore product stock
    await Promise.all(
      sale.items.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new AppError(`Product not found: ${item.product}`, 404);
        }

        product.totalStock += item.quantity;
        await product.save({ session });

        // Clear product cache
        if (redisClient.isOpen) {
          await redisClient.del(`product:${product._id}:stock`);
        }
      })
    );

    // Update customer purchase history if applicable
    if (sale.customer) {
      const customer = await Customer.findById(sale.customer).session(session);
      if (customer) {
        customer.totalPurchases = (customer.totalPurchases || 0) - sale.total;
        await customer.save({ session });

        // Clear customer cache
        if (redisClient.isOpen) {
          await redisClient.del(`customer:${customer._id}`);
        }
      }
    }

    // Update sale status
    sale.status = SaleStatus.VOIDED;
    sale.voidedBy = toObjectId(userId);
    sale.voidedAt = new Date();
    sale.voidReason = reason;
    await sale.save({ session });

    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in voidSale:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get sale by ID with caching
 */
export const getSaleById = async (saleId: string) => {
  try {
    // Try to get from cache
    if (redisClient.isOpen) {
      const cachedSale = await redisClient.get(`sale:${saleId}`);
      if (cachedSale) {
        return JSON.parse(cachedSale.toString());
      }
    }

    const sale = await Sale.findById(saleId)
      .populate('items.product', 'name sku')
      .populate('customer', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('voidedBy', 'firstName lastName');

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Cache the result
    if (redisClient.isOpen) {
      await redisClient.setEx(`sale:${saleId}`, 300, JSON.stringify(sale)); // Cache for 5 minutes
    }

    return sale;
  } catch (error) {
    logger.error('Error in getSaleById:', error);
    throw error;
  }
};

/**
 * Send receipt email to customer
 */
const sendReceiptEmail = async (sale: any, customer: any) => {
  try {
    const subject = `Your Receipt from PharmaSync - Order #${sale.saleNumber}`;

    // Generate receipt HTML
    const receiptHtml = `
      <h2>Receipt for Order #${sale.saleNumber}</h2>
      <p>Date: ${new Date(sale.saleDate).toLocaleDateString()}</p>
      <p>Customer: ${customer.firstName} ${customer.lastName}</p>
      <hr>
      <h3>Items</h3>
      <table border="1" cellpadding="5" cellspacing="0" width="100%">
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Discount</th>
          <th>Total</th>
        </tr>
        ${sale.items.map(item => `
          <tr>
            <td>${item.product.name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>${item.discount ? item.discount + '%' : '0%'}</td>
            <td>$${item.finalPrice.toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <p><strong>Subtotal:</strong> $${sale.subtotal.toFixed(2)}</p>
      <p><strong>Discount:</strong> $${sale.totalDiscount.toFixed(2)}</p>
      <p><strong>Total:</strong> $${sale.total.toFixed(2)}</p>
      <hr>
      <p>Thank you for your purchase!</p>
      ${sale.refillReminder ? `<p>Your refill reminder is scheduled for ${new Date(sale.refillReminderDate).toLocaleDateString()}</p>` : ''}
    `;

    // Send email
    return await sendEmail({
      to: customer.email,
      subject,
      text: `Your receipt for order #${sale.saleNumber}`,
      html: receiptHtml,
    });
  } catch (error) {
    logger.error('Error generating receipt email:', error);
    return false;
  }
};

/**
 * Create a POS transaction with multiple payment methods
 */
export const createPosTransaction = async ({
  customer,
  transactionType,
  posSession,
  register,
  items,
  discount = 0,
  tax = 0,
  paymentMethods,
  notes,
  location,
  returnReason,
  originalSale,
  prescription,
  doctor,
  barcodeScanned = false,
  emailReceipt = false,
  refillReminder = false,
  refillReminderDate,
  userId,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate POS session
    const posSessionDoc = await PosSession.findById(posSession).session(session);
    if (!posSessionDoc) {
      throw new AppError('POS session not found', 404);
    }

    if (posSessionDoc.status !== 'open') {
      throw new AppError('POS session is not open', 400);
    }

    // Validate items and check stock
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new AppError(`Product not found: ${item.product}`, 404);
        }

        if (transactionType === PosTransactionType.SALE && product.totalStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${product.name}. Available: ${product.totalStock}`,
            400
          );
        }

        // Find the specific batch if provided, otherwise use the first available batch
        let batchNumber = item.batchNumber;
        let expiryDate = item.expiryDate;

        if (!batchNumber && product.inventory && product.inventory.length > 0) {
          // Sort inventory by expiry date (earliest first)
          const sortedInventory = [...product.inventory].sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );

          // Find first batch with sufficient quantity
          const batch = sortedInventory.find(inv => inv.quantity >= item.quantity);
          if (batch) {
            batchNumber = batch.batchNumber;
            expiryDate = batch.expiryDate;
          } else {
            // If no single batch has enough, we'll need to handle partial quantities
            // For now, just use the first batch and show a warning
            if (sortedInventory[0]) {
              batchNumber = sortedInventory[0].batchNumber;
              expiryDate = sortedInventory[0].expiryDate;
              logger.warn(`Insufficient quantity in a single batch for ${product.name}. Using first available batch.`);
            }
          }
        }

        if (transactionType === PosTransactionType.SALE && !batchNumber) {
          throw new AppError(`No batch available for product ${product.name}`, 400);
        }

        return {
          ...item,
          product,
          batchNumber,
          expiryDate,
          subtotal: item.quantity * item.unitPrice,
        };
      })
    );

    // Validate customer if provided
    let customerDoc;
    if (customer) {
      customerDoc = await Customer.findById(customer).session(session);
      if (!customerDoc) {
        throw new AppError(`Customer not found: ${customer}`, 404);
      }
    }

    // Validate prescription if provided
    let prescriptionDoc;
    if (prescription) {
      prescriptionDoc = await Prescription.findById(prescription).session(session);
      if (!prescriptionDoc) {
        throw new AppError(`Prescription not found: ${prescription}`, 404);
      }
    }

    // Validate doctor if provided
    let doctorDoc;
    if (doctor) {
      doctorDoc = await Customer.findById(doctor).session(session);
      if (!doctorDoc) {
        throw new AppError(`Doctor not found: ${doctor}`, 404);
      }
    }

    // Calculate totals
    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const total = subtotal - discount + tax;

    // Validate payment methods
    const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
    let paymentStatus;

    if (totalPaid < total) {
      paymentStatus = PaymentStatus.PARTIAL;
    } else if (totalPaid === total) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.OVERPAID;
    }

    // Create transaction
    const transaction = await PosTransaction.create(
      [
        {
          customer: customerDoc?._id,
          transactionType,
          posSession: posSessionDoc._id,
          register,
          cashier: userId,
          items: validatedItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: item.subtotal,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
          })),
          subtotal,
          discount,
          tax,
          total,
          paymentMethods,
          paymentStatus,
          paymentMethod: paymentMethods.length > 1 ? 'multiple' : paymentMethods[0]?.method || 'cash',
          notes,
          location: toObjectId(location),
          status: SaleStatus.COMPLETED,
          saleDate: new Date(),
          createdBy: userId,
          returnReason,
          originalSale: originalSale ? toObjectId(originalSale) : undefined,
          prescription: prescriptionDoc?._id,
          doctor: doctorDoc?._id,
          barcodeScanned,
          emailReceipt,
          refillReminder,
          refillReminderDate,
        },
      ],
      { session }
    );

    // Update product stock based on transaction type
    if (transactionType === PosTransactionType.SALE) {
      // Decrease stock for sales
      await Promise.all(
        validatedItems.map(async (item) => {
          const product = item.product;

          // Update specific batch if provided
          if (item.batchNumber) {
            const batchIndex = product.inventory.findIndex(
              inv => inv.batchNumber === item.batchNumber
            );

            if (batchIndex >= 0) {
              product.inventory[batchIndex].quantity -= item.quantity;
            }
          }

          // Update total stock
          product.totalStock -= item.quantity;
          await product.save({ session });

          // Clear product cache
          if (redisClient.isOpen) {
            await redisClient.del(`product:${product._id}:stock`);
          }
        })
      );
    } else if (transactionType === PosTransactionType.RETURN) {
      // Increase stock for returns
      await Promise.all(
        validatedItems.map(async (item) => {
          const product = item.product;

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
        })
      );
    }

    // Update customer purchase history if applicable
    if (customerDoc) {
      if (transactionType === PosTransactionType.SALE) {
        customerDoc.totalPurchases = (customerDoc.totalPurchases || 0) + total;
      } else if (transactionType === PosTransactionType.RETURN) {
        customerDoc.totalPurchases = Math.max(0, (customerDoc.totalPurchases || 0) - total);
      }

      customerDoc.lastPurchaseDate = new Date();
      await customerDoc.save({ session });

      // Clear customer cache
      if (redisClient.isOpen) {
        await redisClient.del(`customer:${customerDoc._id}`);
      }
    }

    // Update prescription status if applicable
    if (prescriptionDoc && transactionType === PosTransactionType.SALE) {
      prescriptionDoc.dispensed = true;
      prescriptionDoc.dispensedDate = new Date();
      prescriptionDoc.dispensedBy = toObjectId(userId);
      await prescriptionDoc.save({ session });
    }

    // Update POS session expected closing balance
    const cashPayment = paymentMethods.find(method => method.method === 'cash');
    if (cashPayment) {
      if (transactionType === PosTransactionType.SALE) {
        posSessionDoc.expectedClosingBalance += cashPayment.amount;
      } else if (transactionType === PosTransactionType.RETURN) {
        posSessionDoc.expectedClosingBalance -= cashPayment.amount;
      }
      await posSessionDoc.save({ session });
    }

    // Send email receipt if requested
    if (emailReceipt && customerDoc?.email) {
      try {
        const emailSent = await sendReceiptEmail(transaction[0], customerDoc);
        if (emailSent) {
          transaction[0].emailSent = true;
          await transaction[0].save({ session });
        }
      } catch (emailError) {
        // Log error but don't fail the transaction
        logger.error('Error sending receipt email:', emailError);
      }
    }

    await session.commitTransaction();
    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error in createPosTransaction:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const getSales = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate,
  customer,
  status,
  minAmount,
  maxAmount,
}: {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  customer?: string;
  status?: SaleStatus;
  minAmount?: number;
  maxAmount?: number;
}) => {
  try {
    const query: any = {};

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = startDate;
      if (endDate) query.saleDate.$lte = endDate;
    }

    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (minAmount || maxAmount) {
      query.total = {};
      if (minAmount) query.total.$gte = minAmount;
      if (maxAmount) query.total.$lte = maxAmount;
    }

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('items.product', 'name sku')
        .populate('customer', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(query),
    ]);

    return {
      sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getSales:', error);
    throw error;
  }
};
