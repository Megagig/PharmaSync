import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Sale from '../models/sale.model';
import Customer from '../models/customer.model';
import Product from '../models/product.model';
import CreditTransaction from '../models/creditTransaction.model';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import { CreditTransactionType } from '../interfaces/credit.interface';
import { AppError } from '../utils/error';
import { generateRandomString } from '../utils/helpers';

/**
 * @desc    Get all sales with pagination and filtering
 * @route   GET /api/sales
 * @access  Private
 */
export const getAllSales = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  // Filter by customer
  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  // Filter by location
  if (req.query.location) {
    filter.location = req.query.location;
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
  const total = await Sale.countDocuments(filter);

  // Get sales with pagination
  const sales = await Sale.find(filter)
    .populate('customer', 'firstName lastName customerNumber')
    .populate('location', 'name')
    .populate('createdBy', 'firstName lastName')
    .sort({ saleDate: -1 })
    .skip(skip)
    .limit(limit);

  // Convert to plain objects to avoid Mongoose virtuals issues
  const plainSales = sales.map(sale => sale.toObject({ virtuals: false }));

  res.status(200).json({
    status: 'success',
    data: plainSales,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get sale by ID
 * @route   GET /api/sales/:id
 * @access  Private
 */
export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
  const sale = await Sale.findById(req.params.id)
    .populate('customer', 'firstName lastName customerNumber')
    .populate('location', 'name')
    .populate('createdBy', 'firstName lastName')
    .populate({
      path: 'items.product',
      select: 'name sku barcode',
    });

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  // Convert to plain object to avoid Mongoose virtuals issues
  const saleObj = sale.toObject({ virtuals: false });

  res.status(200).json({
    status: 'success',
    data: saleObj,
  });
});

/**
 * @desc    Create new sale
 * @route   POST /api/sales
 * @access  Private
 */
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const {
    customer,
    saleDate,
    items,
    discount,
    tax,
    paymentMethod,
    notes,
    location,
    saleNumber, // Extract saleNumber from request body
  } = req.body;

  // Verify customer exists
  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    throw new AppError('Customer not found', 404);
  }

  // Process each item
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const {
      product,
      quantity,
      unitPrice,
      discount = 0,
      batchNumber,
      expiryDate,
      notes,
    } = item;

    // Verify product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      throw new AppError(`Product with ID ${product} not found`, 404);
    }

    // Handle inventory management based on whether batch number is provided
    let inventoryItem;

    if (batchNumber) {
      // If batch number is provided, find the specific inventory item
      inventoryItem = productDoc.inventory.find(
        (inv) => inv.batchNumber === batchNumber
      );

      if (!inventoryItem) {
        throw new AppError(
          `Inventory item with batch number ${batchNumber} not found`,
          404
        );
      }
    } else {
      // If no batch number is provided, use the first available inventory item with sufficient stock
      inventoryItem = productDoc.inventory.find(inv => inv.quantity >= quantity);

      if (!inventoryItem) {
        throw new AppError(
          `No inventory items with sufficient stock found for product ${productDoc.name}`,
          404
        );
      }
    }

    // Check if enough stock is available
    if (inventoryItem.quantity < quantity) {
      throw new AppError(
        `Insufficient stock for product ${productDoc.name}. Available: ${inventoryItem.quantity}, Requested: ${quantity}`,
        400
      );
    }

    // Update inventory quantity
    inventoryItem.quantity -= quantity;

    // Calculate total stock from inventory
    const totalStock = productDoc.inventory.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await productDoc.save();

    // Calculate item subtotal and finalPrice
    const itemSubtotal = quantity * unitPrice;
    const itemFinalPrice = itemSubtotal - discount;
    subtotal += itemFinalPrice;

    // Add to processed items
    processedItems.push({
      product,
      quantity,
      unitPrice,
      discount,
      subtotal: itemSubtotal,
      finalPrice: itemFinalPrice, // Add finalPrice field
      batchNumber: batchNumber || inventoryItem.batchNumber, // Use the selected inventory item's batch number if none provided
      expiryDate: expiryDate || inventoryItem.expiryDate, // Use the selected inventory item's expiry date if none provided
      notes,
    });
  }

  // Calculate total
  const discountAmount = discount || 0;
  const taxAmount = tax || 0;
  const total = subtotal - discountAmount + taxAmount;

  // Determine payment status based on payment method
  let paymentStatus = PaymentStatus.PAID;

  // If payment method is credit, check credit limit
  if (paymentMethod === 'credit') {
    // Check if customer has enough credit
    const availableCredit =
      (customerExists.creditLimit || 0) - customerExists.currentBalance;

    if (total > availableCredit) {
      throw new AppError(
        `Insufficient credit. Available: ${availableCredit}, Required: ${total}`,
        400
      );
    }

    paymentStatus = PaymentStatus.UNPAID;
  }

  // Generate a sale number if not provided
  const generatedSaleNumber = saleNumber || (() => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `SALE-${dateStr}-${generateRandomString(5).toUpperCase()}`;
  })();

  // Create sale record
  const sale = await Sale.create({
    customer,
    saleNumber: generatedSaleNumber, // Explicitly set the sale number
    saleDate: saleDate || new Date(),
    items: processedItems,
    subtotal,
    totalDiscount: discountAmount, // Set totalDiscount field
    discount: discountAmount,
    tax: taxAmount,
    total,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus,
    notes,
    location,
    createdBy: req.user.id, // From auth middleware
  });

  // If payment method is credit, create credit transaction
  if (paymentMethod === 'credit') {
    // Update customer balance
    customerExists.currentBalance += total;
    await customerExists.save();

    // Create credit transaction
    await CreditTransaction.create({
      customer,
      transactionType: CreditTransactionType.SALE_ON_CREDIT,
      amount: total,
      balance: customerExists.currentBalance,
      description: `Sale on credit: ${sale.saleNumber}`,
      reference: sale.saleNumber,
      sale: sale._id,
      createdBy: req.user.id,
    });
  }

  res.status(201).json({
    status: 'success',
    data: sale,
  });
});

/**
 * @desc    Update sale
 * @route   PATCH /api/sales/:id
 * @access  Private
 */
export const updateSale = asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    paymentStatus,
    paymentMethod,
    discount,
    tax,
    notes,
    receiptGenerated,
  } = req.body;

  const sale = await Sale.findById(req.params.id);

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  // Update fields
  if (status) sale.status = status;
  if (paymentStatus) sale.paymentStatus = paymentStatus;
  if (paymentMethod) sale.paymentMethod = paymentMethod;

  if (discount !== undefined) {
    sale.discount = discount;
    sale.total = sale.subtotal - discount + sale.tax;
  }

  if (tax !== undefined) {
    sale.tax = tax;
    sale.total = sale.subtotal - sale.discount + tax;
  }

  if (notes) sale.notes = notes;
  if (receiptGenerated !== undefined) sale.receiptGenerated = receiptGenerated;

  await sale.save();

  res.status(200).json({
    status: 'success',
    data: sale,
  });
});

/**
 * @desc    Generate receipt for sale
 * @route   POST /api/sales/:id/receipt
 * @access  Private
 */
export const generateReceipt = asyncHandler(
  async (req: Request, res: Response) => {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('location', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'items.product',
        select: 'name sku barcode',
      });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Mark receipt as generated
    sale.receiptGenerated = true;
    await sale.save();

    // Convert to plain object to avoid Mongoose virtuals issues
    const saleObj = sale.toObject({ virtuals: false });

    // Type assertions for populated fields
    const customer = saleObj.customer as { firstName?: string; lastName?: string; customerNumber?: string } || {};
    const createdBy = saleObj.createdBy as { firstName?: string; lastName?: string } || {};
    const location = saleObj.location as { name?: string } || {};

    // Format receipt data with defensive checks
    const receiptData = {
      saleNumber: saleObj.saleNumber || '',
      date: saleObj.saleDate || new Date(),
      customer: {
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        id: customer.customerNumber || '',
      },
      soldBy: `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim(),
      location: location.name || '',
      items: Array.isArray(saleObj.items) ? saleObj.items.map((item: any) => ({
        product: item.product?.name || 'Unknown Product',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        subtotal: item.subtotal || 0,
      })) : [],
      subtotal: saleObj.subtotal || 0,
      discount: saleObj.discount || 0,
      tax: saleObj.tax || 0,
      total: saleObj.total || 0,
      paymentMethod: saleObj.paymentMethod || 'cash',
    };

    res.status(200).json({
      status: 'success',
      data: receiptData,
    });
  }
);
