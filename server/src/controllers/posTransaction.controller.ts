import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import PosTransaction from '../models/posTransaction.model';
import PosSession from '../models/posSession.model';
import Customer from '../models/customer.model';
import Product from '../models/product.model';
import Location from '../models/location.model';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import { PaymentStatus } from '../interfaces/sale.interface';
import { MovementType } from '../interfaces/inventoryMovement.interface';
import { createInventoryMovement } from './inventoryMovement.controller';
import { AppError } from '../utils/error';

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
      .populate('originalSale', 'saleNumber saleDate total');

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
      posSession,
      register,
      items,
      discount,
      tax,
      paymentMethods,
      notes,
      location,
      returnReason,
      originalSale,
      giftCardIssued,
      giftCardAmount,
      giftCardNumber,
      storeCreditIssued,
      storeCreditAmount,
    } = req.body;

    // Verify customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      throw new AppError('Customer not found', 404);
    }

    // Verify location exists
    const locationExists = await Location.findById(location);
    if (!locationExists) {
      throw new AppError('Location not found', 404);
    }

    // Verify session exists and is open
    const sessionExists = await PosSession.findById(posSession);
    if (!sessionExists) {
      throw new AppError('POS session not found', 404);
    }

    if (sessionExists.status !== 'open') {
      throw new AppError('POS session is not open', 400);
    }

    // Process each item
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new AppError(`Product not found: ${item.product}`, 404);
      }

      // Check if product has sufficient stock
      const batchItem = product.inventory.find(
        (inv) => inv.batchNumber === item.batchNumber
      );

      if (!batchItem) {
        throw new AppError(
          `Batch ${item.batchNumber} not found for product ${product.name}`,
          404
        );
      }

      if (batchItem.quantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${batchItem.quantity}, Requested: ${item.quantity}`,
          400
        );
      }

      const itemSubtotal =
        item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += itemSubtotal;

      processedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate || batchItem.expiryDate,
        notes: item.notes,
      });
    }

    // Calculate discount and tax
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const total = subtotal - discountAmount + taxAmount;

    // Validate payment methods
    const totalPaid = paymentMethods.reduce(
      (sum: number, method: any) => sum + method.amount,
      0
    );

    // Determine payment status
    let paymentStatus = PaymentStatus.PAID;
    if (totalPaid < total) {
      paymentStatus = PaymentStatus.UNPAID;
    } else if (totalPaid > 0 && totalPaid < total) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    // Create transaction record
    const transaction = await PosTransaction.create({
      customer,
      transactionType,
      posSession,
      register,
      items: processedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethods,
      paymentStatus,
      paymentMethod:
        paymentMethods.length > 1 ? 'multiple' : paymentMethods[0].method,
      notes,
      location,
      cashier: req.user.id, // From auth middleware
      createdBy: req.user.id,
      returnReason,
      originalSale,
      giftCardIssued,
      giftCardAmount,
      giftCardNumber,
      storeCreditIssued,
      storeCreditAmount,
    });

    // Update session with this transaction
    await PosSession.findByIdAndUpdate(posSession, {
      $push: { transactions: transaction._id },
      $inc: {
        expectedClosingBalance: totalPaid - (transaction.changeDue || 0),
      },
    });

    // Update inventory
    await updateInventoryForTransaction(transaction);

    res.status(201).json({
      status: 'success',
      data: transaction,
    });
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
      .populate('items.product', 'name sku');

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

  // Call the inventory movement controller directly with the data
  // This avoids TypeScript errors with the Response return type
  try {
    const req = {
      body: movementData,
      user: { _id: transaction.createdBy }, // Changed from id to _id to match the controller
    } as Request;

    const res = {
      status: (code: number) => ({
        json: (data: any) => {
          // Just a mock implementation that doesn't return anything
          return;
        },
      }),
    } as unknown as Response;

    // Create a mock next function to satisfy the Express middleware signature
    const next = (err?: any) => {
      if (err) throw err;
    };

    await createInventoryMovement(req, res, next);
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};
