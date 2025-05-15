import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Return from '../models/return.model';
import Sale from '../models/sale.model';
import Product from '../models/product.model';
import { ReturnStatus, RefundStatus } from '../interfaces/return.interface';
import { SaleStatus } from '../interfaces/sale.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all returns with pagination and filtering
 * @route   GET /api/returns
 * @access  Private
 */
export const getAllReturns = asyncHandler(
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

    // Filter by refund status
    if (req.query.refundStatus) {
      filter.refundStatus = req.query.refundStatus;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.returnDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Search by return number or sale number
    if (req.query.search) {
      filter.$or = [
        { returnNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Return.countDocuments(filter);

    // Get returns with pagination
    const returns = await Return.find(filter)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('sale', 'saleNumber saleDate')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('processedBy', 'firstName lastName')
      .sort({ returnDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: returns,
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
 * @desc    Get return by ID
 * @route   GET /api/returns/:id
 * @access  Private
 */
export const getReturnById = asyncHandler(
  async (req: Request, res: Response) => {
    const returnDoc = await Return.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('sale', 'saleNumber saleDate')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('processedBy', 'firstName lastName')
      .populate({
        path: 'items.product',
        select: 'name sku barcode',
      });

    if (!returnDoc) {
      throw new AppError('Return not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: returnDoc,
    });
  }
);

/**
 * @desc    Create new return
 * @route   POST /api/returns
 * @access  Private
 */
export const createReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sale: saleId,
      returnDate,
      items,
      tax,
      notes,
    } = req.body;

    // Verify sale exists
    const sale = await Sale.findById(saleId)
      .populate('customer')
      .populate({
        path: 'items.product',
        select: 'name sku barcode',
      });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Process each item
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { 
        product: productId, 
        quantity, 
        unitPrice, 
        batchNumber, 
        reason, 
        condition, 
        returnToStock 
      } = item;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError(`Product with ID ${productId} not found`, 404);
      }

      // Verify item was in the original sale
      const saleItem = sale.items.find(
        (si: any) => 
          si.product._id.toString() === productId && 
          si.batchNumber === batchNumber
      );

      if (!saleItem) {
        throw new AppError(
          `Product ${product.name} with batch ${batchNumber} was not found in the original sale`,
          400
        );
      }

      // Verify return quantity is not greater than sold quantity
      if (quantity > saleItem.quantity) {
        throw new AppError(
          `Return quantity (${quantity}) exceeds sold quantity (${saleItem.quantity}) for product ${product.name}`,
          400
        );
      }

      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice;
      subtotal += itemSubtotal;

      // Add to processed items
      processedItems.push({
        product: productId,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        batchNumber,
        reason,
        condition,
        returnToStock: returnToStock || false,
      });

      // If returning to stock, update inventory
      if (returnToStock && condition === 'good') {
        // Find inventory item with matching batch number
        const inventoryItem = product.inventory.find(
          (inv: any) => inv.batchNumber === batchNumber
        );

        if (inventoryItem) {
          // Update inventory quantity
          inventoryItem.quantity += quantity;
        } else {
          // Add new inventory item
          product.inventory.push({
            batchNumber,
            quantity,
            costPrice: unitPrice, // Use the unit price as cost price
            expiryDate: saleItem.expiryDate,
          });
        }

        await product.save();
      }
    }

    // Calculate total
    const taxAmount = tax || 0;
    const total = subtotal + taxAmount;

    // Create return record
    const returnDoc = await Return.create({
      sale: saleId,
      customer: typeof sale.customer === 'object' ? sale.customer._id : sale.customer,
      returnDate: returnDate || new Date(),
      status: ReturnStatus.PENDING,
      items: processedItems,
      subtotal,
      tax: taxAmount,
      total,
      refundStatus: RefundStatus.PENDING,
      refundAmount: 0, // Will be set during refund processing
      notes,
      createdBy: req.user.id, // From auth middleware
    });

    // Update sale status if all items are returned
    const allItemsReturned = sale.items.every((saleItem: any) => {
      const returnItem = items.find(
        (ri: any) => 
          ri.product === saleItem.product._id.toString() && 
          ri.batchNumber === saleItem.batchNumber
      );
      return returnItem && returnItem.quantity >= saleItem.quantity;
    });

    if (allItemsReturned) {
      sale.status = SaleStatus.RETURNED;
      await sale.save();
    }

    res.status(201).json({
      status: 'success',
      data: returnDoc,
    });
  }
);

/**
 * @desc    Update return
 * @route   PATCH /api/returns/:id
 * @access  Private
 */
export const updateReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, notes } = req.body;

    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc) {
      throw new AppError('Return not found', 404);
    }

    // Update fields
    if (status) returnDoc.status = status;
    if (notes) returnDoc.notes = notes;

    await returnDoc.save();

    res.status(200).json({
      status: 'success',
      data: returnDoc,
    });
  }
);

/**
 * @desc    Approve return
 * @route   PATCH /api/returns/:id/approve
 * @access  Private (Admin/Manager only)
 */
export const approveReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const { approvedBy, notes } = req.body;

    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc) {
      throw new AppError('Return not found', 404);
    }

    // Check if return is in pending status
    if (returnDoc.status !== ReturnStatus.PENDING) {
      throw new AppError(`Return cannot be approved in ${returnDoc.status} status`, 400);
    }

    // Update return status
    returnDoc.status = ReturnStatus.APPROVED;
    returnDoc.approvedBy = approvedBy;
    if (notes) returnDoc.notes = notes;

    await returnDoc.save();

    res.status(200).json({
      status: 'success',
      data: returnDoc,
    });
  }
);

/**
 * @desc    Process refund
 * @route   PATCH /api/returns/:id/refund
 * @access  Private (Admin/Manager only)
 */
export const processRefund = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      refundStatus,
      refundAmount,
      refundMethod,
      refundReference,
      refundDate,
      notes,
    } = req.body;

    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc) {
      throw new AppError('Return not found', 404);
    }

    // Check if return is approved
    if (returnDoc.status !== ReturnStatus.APPROVED) {
      throw new AppError(`Return must be approved before processing refund`, 400);
    }

    // Update refund details
    returnDoc.refundStatus = refundStatus;
    returnDoc.refundAmount = refundAmount;
    if (refundMethod) returnDoc.refundMethod = refundMethod;
    if (refundReference) returnDoc.refundReference = refundReference;
    returnDoc.refundDate = refundDate ? new Date(refundDate) : new Date();
    returnDoc.processedBy = req.user.id;
    if (notes) returnDoc.notes = notes;

    // If refund is processed, update return status to completed
    if (refundStatus === RefundStatus.PROCESSED) {
      returnDoc.status = ReturnStatus.COMPLETED;
    }

    await returnDoc.save();

    res.status(200).json({
      status: 'success',
      data: returnDoc,
    });
  }
);
