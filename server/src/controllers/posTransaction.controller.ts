import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import PosTransaction from '../models/posTransaction.model';
import PosSession from '../models/posSession.model';
import Customer from '../models/customer.model';
import Product from '../models/product.model';
import Location from '../models/location.model';
import Prescription from '../models/prescription.model';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import { PaymentStatus } from '../interfaces/sale.interface';
import { MovementType } from '../interfaces/inventoryMovement.interface';
import { AppError } from '../utils/error';
import { toObjectId } from '../utils/idConverter';
import InventoryMovement from '../models/inventoryMovement.model';
import * as posService from '../services/pos.service';

/**
 * @desc    Get all POS transactions
 * @route   GET /api/pos/transactions
 * @access  Private
 */
export const getAllPosTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by transaction type
    if (req.query.type) {
      filter.transactionType = req.query.type;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Filter by customer
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }

    // Filter by location
    if (req.query.location) {
      filter.location = req.query.location;
    }

    // Filter by session
    if (req.query.session) {
      filter.posSession = req.query.session;
    }

    // Filter by cashier
    if (req.query.cashier) {
      filter.cashier = req.query.cashier;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.saleDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Search by sale number
    if (req.query.search) {
      filter.saleNumber = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    // Get total count
    const total = await PosTransaction.countDocuments(filter);

    // Get transactions with pagination
    const transactions = await PosTransaction.find(filter)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('location', 'name')
      .populate('cashier', 'firstName lastName')
      .populate('posSession', 'sessionNumber')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: transactions,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get POS transaction by ID
 * @route   GET /api/pos/transactions/:id
 * @access  Private
 */
export const getPosTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await PosTransaction.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('location', 'name')
      .populate('cashier', 'firstName lastName')
      .populate('posSession', 'sessionNumber')
      .populate('items.product', 'name sku barcode')
      .populate('originalSale', 'saleNumber saleDate total')
      .populate('prescription', 'prescriptionNumber issueDate')
      .populate('doctor', 'firstName lastName');

    if (!transaction) {
      throw new AppError('POS transaction not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: transaction,
    });
  }
);

/**
 * @desc    Create new POS transaction
 * @route   POST /api/pos/transactions
 * @access  Private
 */
export const createPosTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      customer,
      transactionType,
      location,
      register,
      posSession,
      items,
      subtotal,
      discount,
      tax,
      total,
      notes,
      paymentMethods,
      returnReason,
      originalSale,
      prescription,
      doctor,
      barcodeScanned,
      emailReceipt,
      refillReminder,
      refillReminderDate,
      loyaltyPointsRedeemed,
    } = req.body;

    // Validate required fields
    if (!transactionType || !location || !posSession || !register) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Items are required', 400);
    }

    // Validate payment methods
    if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
      throw new AppError('At least one payment method is required', 400);
    }

    try {
      // Use the service to create the transaction
      const transaction = await posService.createPosTransaction({
        customer,
        transactionType,
        location,
        register,
        posSession,
        items,
        discount,
        tax,
        paymentMethods,
        notes,
        returnReason,
        originalSale,
        prescription,
        doctor,
        barcodeScanned,
        emailReceipt,
        refillReminder,
        refillReminderDate,
        loyaltyPointsRedeemed,
        userId: req.user._id,
      });

      // Update inventory for transaction
      await updateInventoryForTransaction(transaction);

      res.status(201).json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Error creating transaction', 500);
    }
  }
);

/**
 * @desc    Generate receipt for POS transaction
 * @route   GET /api/pos/transactions/:id/receipt
 * @access  Private
 */
export const generatePosReceipt = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await PosTransaction.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber email phone')
      .populate('location', 'name address')
      .populate('cashier', 'firstName lastName')
      .populate('items.product', 'name sku')
      .populate('prescription', 'prescriptionNumber issueDate')
      .populate('doctor', 'firstName lastName');

    if (!transaction) {
      throw new AppError('POS transaction not found', 404);
    }

    // Mark receipt as generated
    transaction.receiptGenerated = true;
    await transaction.save();

    // Get the populated data safely with type checking
    const customerData = transaction.customer as any;
    const locationData = transaction.location as any;
    const cashierData = transaction.cashier as any;

    // Format receipt data
    const receiptData = {
      transactionNumber: transaction.saleNumber,
      date: transaction.saleDate,
      customer: {
        name: `${customerData.firstName} ${customerData.lastName}`,
        id: customerData.customerNumber,
        email: customerData.email,
        phone: customerData.phone,
      },
      cashier: `${cashierData.firstName} ${cashierData.lastName}`,
      location: locationData.name,
      address: locationData.address,
      items: transaction.items.map((item: any) => {
        const productData = item.product as any;
        return {
          product: productData.name,
          sku: productData.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          subtotal: item.subtotal,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : null,
        };
      }),
      subtotal: transaction.subtotal,
      discount: transaction.discount,
      tax: transaction.tax,
      total: transaction.total,
      paymentMethods: transaction.paymentMethods,
      changeDue: transaction.changeDue,
      transactionType: transaction.transactionType,
      notes: transaction.notes,
      prescription: transaction.prescription ? {
        number: (transaction.prescription as any).prescriptionNumber || 'N/A',
        date: (transaction.prescription as any).issueDate || new Date(),
      } : null,
      doctor: transaction.doctor ? {
        name: `${(transaction.doctor as any).firstName || 'Dr.'} ${(transaction.doctor as any).lastName || 'Unknown'}`,
      } : null,
      barcodeScanned: transaction.barcodeScanned,
      emailReceipt: transaction.emailReceipt,
      emailSent: transaction.emailSent,
      refillReminder: transaction.refillReminder,
      refillReminderDate: transaction.refillReminderDate,
    };

    res.status(200).json({
      status: 'success',
      data: receiptData,
    });
  }
);

/**
 * Helper function to update inventory after a transaction
 */
const updateInventoryForTransaction = async (transaction: any) => {
  const { items, location, transactionType, _id } = transaction;

  // Determine movement type based on transaction type
  let movementType = MovementType.SALE;
  if (transactionType === PosTransactionType.RETURN) {
    movementType = MovementType.RETURN;
  }

  // Create inventory movement items
  const movementItems = items.map((item: any) => ({
    product: item.product,
    batchNumber: item.batchNumber,
    quantity: item.quantity,
    costPrice: 0, // This will be filled in by the inventory movement controller
    sellingPrice: item.unitPrice,
    expiryDate: item.expiryDate,
  }));

  // Create inventory movement
  const movementData = {
    referenceNumber: transaction.saleNumber,
    type: movementType,
    date: transaction.saleDate,
    sourceLocation:
      transactionType === PosTransactionType.SALE ? location : null,
    destinationLocation:
      transactionType === PosTransactionType.RETURN ? location : null,
    items: movementItems,
    notes: `POS ${transactionType} - ${transaction.saleNumber}`,
    createdBy: transaction.createdBy,
  };

  // Create inventory movement directly using the model
  try {
    // Create the inventory movement document
    await InventoryMovement.create({
      referenceNumber: movementData.referenceNumber,
      type: movementData.type,
      date: movementData.date,
      sourceLocation: movementData.sourceLocation,
      destinationLocation: movementData.destinationLocation,
      items: movementData.items,
      notes: movementData.notes,
      createdBy: toObjectId(transaction.createdBy.toString()),
      status: 'pending',
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};
