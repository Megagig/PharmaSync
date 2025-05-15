import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Sale from '../models/sale.model';
import Customer from '../models/customer.model';
import Product from '../models/product.model';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all sales with pagination and filtering
 * @route   GET /api/sales
 * @access  Private
 */
export const getAllSales = asyncHandler(
  async (req: Request, res: Response) => {
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

    res.status(200).json({
      status: 'success',
      data: sales,
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
 * @desc    Get sale by ID
 * @route   GET /api/sales/:id
 * @access  Private
 */
export const getSaleById = asyncHandler(
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

    res.status(200).json({
      status: 'success',
      data: sale,
    });
  }
);

/**
 * @desc    Create new sale
 * @route   POST /api/sales
 * @access  Private
 */
export const createSale = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      customer,
      saleDate,
      items,
      discount,
      tax,
      paymentMethod,
      notes,
      location,
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
      const { product, quantity, unitPrice, discount = 0, batchNumber, expiryDate, notes } = item;

      // Verify product exists
      const productDoc = await Product.findById(product);
      if (!productDoc) {
        throw new AppError(`Product with ID ${product} not found`, 404);
      }

      // Find inventory item with matching batch number
      const inventoryItem = productDoc.inventory.find(
        (inv) => inv.batchNumber === batchNumber
      );

      if (!inventoryItem) {
        throw new AppError(`Inventory item with batch number ${batchNumber} not found`, 404);
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

      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice - discount;
      subtotal += itemSubtotal;

      // Add to processed items
      processedItems.push({
        product,
        quantity,
        unitPrice,
        discount,
        subtotal: itemSubtotal,
        batchNumber,
        expiryDate,
        notes,
      });
    }

    // Calculate total
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const total = subtotal - discountAmount + taxAmount;

    // Create sale record
    const sale = await Sale.create({
      customer,
      saleDate: saleDate || new Date(),
      items: processedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: PaymentStatus.PAID, // Default to paid
      notes,
      location,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      data: sale,
    });
  }
);

/**
 * @desc    Update sale
 * @route   PATCH /api/sales/:id
 * @access  Private
 */
export const updateSale = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, paymentStatus, paymentMethod, discount, tax, notes, receiptGenerated } = req.body;

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
  }
);

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

    // Format receipt data
    const receiptData = {
      saleNumber: sale.saleNumber,
      date: sale.saleDate,
      customer: {
        name: `${(sale.customer as any).firstName} ${(sale.customer as any).lastName}`,
        id: (sale.customer as any).customerNumber,
      },
      soldBy: `${(sale.createdBy as any).firstName} ${(sale.createdBy as any).lastName}`,
      location: (sale.location as any).name,
      items: sale.items.map((item: any) => ({
        product: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
    };

    res.status(200).json({
      status: 'success',
      data: receiptData,
    });
  }
);
