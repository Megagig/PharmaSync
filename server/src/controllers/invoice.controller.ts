import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Invoice from '../models/invoice.model';
import Customer from '../models/customer.model';
import Supplier from '../models/supplier.model';
import Product from '../models/product.model';
import Sale from '../models/sale.model';
import PurchaseOrder from '../models/purchaseOrder.model';
import { InvoiceStatus, InvoiceType } from '../interfaces/invoice.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all invoices with pagination and filtering
 * @route   GET /api/invoices
 * @access  Private
 */
export const getAllInvoices = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by customer
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }

    // Filter by supplier
    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.invoiceDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Search by invoice number
    if (req.query.search) {
      filter.invoiceNumber = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    // Get total count
    const total = await Invoice.countDocuments(filter);

    // Get invoices with pagination
    const invoices = await Invoice.find(filter)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('supplier', 'name supplierCode')
      .populate('createdBy', 'firstName lastName')
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: invoices,
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
 * @desc    Get invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
export const getInvoiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('supplier', 'name supplierCode contactPerson')
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'items.product',
        select: 'name sku barcode',
      })
      .populate('sale', 'saleNumber saleDate')
      .populate('purchaseOrder', 'orderNumber orderDate');

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  }
);

/**
 * @desc    Create new invoice
 * @route   POST /api/invoices
 * @access  Private
 */
export const createInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      invoiceDate,
      dueDate,
      customer,
      supplier,
      type,
      items,
      discount,
      tax,
      notes,
      termsAndConditions,
      sale,
      purchaseOrder,
    } = req.body;

    // Verify customer or supplier exists based on invoice type
    if (type === InvoiceType.SALES) {
      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        throw new AppError('Customer not found', 404);
      }
    } else if (type === InvoiceType.PURCHASE) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        throw new AppError('Supplier not found', 404);
      }
    }

    // Process each item
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const {
        product,
        description,
        quantity,
        unitPrice,
        discount = 0,
        tax = 0,
      } = item;

      // Verify product exists
      const productExists = await Product.findById(product);
      if (!productExists) {
        throw new AppError(`Product with ID ${product} not found`, 404);
      }

      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice - discount + tax;
      subtotal += itemSubtotal;

      // Add to processed items
      processedItems.push({
        product,
        description,
        quantity,
        unitPrice,
        discount,
        tax,
        subtotal: itemSubtotal,
      });
    }

    // Calculate total
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const total = subtotal - discountAmount + taxAmount;

    // Create invoice record
    const invoice = await Invoice.create({
      invoiceNumber: '', // Will be generated by pre-save hook
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
      customer: type === InvoiceType.SALES ? customer : undefined,
      supplier: type === InvoiceType.PURCHASE ? supplier : undefined,
      type,
      status: InvoiceStatus.DRAFT,
      items: processedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      amountPaid: 0,
      balance: total,
      notes,
      termsAndConditions,
      createdBy: req.user.id, // From auth middleware
      sale: sale || undefined,
      purchaseOrder: purchaseOrder || undefined,
    });

    // If created from sale, update sale with invoice reference
    if (sale) {
      await Sale.findByIdAndUpdate(sale, { invoice: invoice._id });
    }

    // If created from purchase order, update purchase order with invoice reference
    if (purchaseOrder) {
      await PurchaseOrder.findByIdAndUpdate(purchaseOrder, {
        invoice: invoice._id,
      });
    }

    res.status(201).json({
      status: 'success',
      data: invoice,
    });
  }
);

/**
 * @desc    Update invoice
 * @route   PATCH /api/invoices/:id
 * @access  Private
 */
export const updateInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      invoiceDate,
      dueDate,
      status,
      items,
      discount,
      tax,
      amountPaid,
      notes,
      termsAndConditions,
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Update basic fields
    if (invoiceDate) invoice.invoiceDate = new Date(invoiceDate);
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (status) invoice.status = status;
    if (notes) invoice.notes = notes;
    if (termsAndConditions) invoice.termsAndConditions = termsAndConditions;

    // Update items if provided
    if (items && items.length > 0) {
      // Process each item
      const processedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const {
          product,
          description,
          quantity,
          unitPrice,
          discount = 0,
          tax = 0,
        } = item;

        // Verify product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
          throw new AppError(`Product with ID ${product} not found`, 404);
        }

        // Calculate item subtotal
        const itemSubtotal = quantity * unitPrice - discount + tax;
        subtotal += itemSubtotal;

        // Add to processed items
        processedItems.push({
          product,
          description,
          quantity,
          unitPrice,
          discount,
          tax,
          subtotal: itemSubtotal,
        });
      }

      // Clear existing items and add new ones
      invoice.items.splice(0, invoice.items.length); // Clear the array while preserving the DocumentArray
      processedItems.forEach((item) => {
        invoice.items.push(item);
      });
      invoice.subtotal = subtotal;
    }

    // Update discount and tax
    if (discount !== undefined) {
      invoice.discount = discount;
    }

    if (tax !== undefined) {
      invoice.tax = tax;
    }

    // Recalculate total
    invoice.total = invoice.subtotal - invoice.discount + invoice.tax;

    // Update amount paid and balance
    if (amountPaid !== undefined) {
      invoice.amountPaid = amountPaid;
      invoice.balance = invoice.total - amountPaid;

      // Update status based on payment
      if (invoice.balance <= 0) {
        invoice.status = InvoiceStatus.PAID;
      } else if (invoice.amountPaid > 0) {
        invoice.status = InvoiceStatus.PARTIAL;
      }
    }

    await invoice.save();

    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  }
);

/**
 * @desc    Process purchase invoice and update inventory
 * @route   POST /api/invoices/:id/process
 * @access  Private
 */
export const processInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const { batchNumbers, expiryDates, location } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Only purchase invoices can be processed to update inventory
    if (invoice.type !== InvoiceType.PURCHASE) {
      throw new AppError('Only purchase invoices can be processed', 400);
    }

    // Check if invoice is already processed
    if (invoice.status === InvoiceStatus.PAID) {
      throw new AppError('Invoice is already processed', 400);
    }

    // Validate batch numbers and expiry dates
    if (!batchNumbers || !expiryDates || !location) {
      throw new AppError(
        'Batch numbers, expiry dates, and location are required',
        400
      );
    }

    if (
      !Array.isArray(batchNumbers) ||
      !Array.isArray(expiryDates) ||
      batchNumbers.length !== invoice.items.length ||
      expiryDates.length !== invoice.items.length
    ) {
      throw new AppError(
        'Batch numbers and expiry dates must be provided for each item',
        400
      );
    }

    // Process each item and update inventory
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const batchNumber = batchNumbers[i];
      const expiryDate = new Date(expiryDates[i]);

      // Get product
      const product = await Product.findById(item.product);
      if (!product) {
        throw new AppError(`Product with ID ${item.product} not found`, 404);
      }

      // Check if batch already exists
      const existingBatchIndex = product.inventory.findIndex(
        (inv) => inv.batchNumber === batchNumber && inv.location === location
      );

      if (existingBatchIndex >= 0) {
        // Update existing batch
        product.inventory[existingBatchIndex].quantity += item.quantity;
      } else {
        // Add new batch
        product.inventory.push({
          batchNumber,
          expiryDate,
          quantity: item.quantity,
          location,
          costPrice: item.unitPrice,
        });
      }

      await product.save();
    }

    // Update invoice status
    invoice.status = InvoiceStatus.PAID;
    invoice.amountPaid = invoice.total;
    invoice.balance = 0;
    await invoice.save();

    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  }
);
