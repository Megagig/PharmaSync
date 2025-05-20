import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Purchase from '../models/purchase.model';
import Supplier from '../models/supplier.model';
import Product from '../models/product.model';
import { PurchaseStatus } from '../interfaces/purchase.interface';
import { AppError } from '../utils/error';
import { generateRandomString } from '../utils/helpers';

/**
 * @desc    Get all purchases
 * @route   GET /api/purchases
 * @access  Private
 */
export const getAllPurchases = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Apply filters if provided
    if (req.query.supplier) {
      query.supplier = req.query.supplier;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      query.purchaseDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    } else if (req.query.startDate) {
      query.purchaseDate = { $gte: new Date(req.query.startDate as string) };
    } else if (req.query.endDate) {
      query.purchaseDate = { $lte: new Date(req.query.endDate as string) };
    }

    const total = await Purchase.countDocuments(query);
    const purchases = await Purchase.find(query)
      .populate('supplier', 'name contactPerson phone email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: {
        purchases,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalItems: total,
      },
    });
  }
);

/**
 * @desc    Get purchase by ID
 * @route   GET /api/purchases/:id
 * @access  Private
 */
export const getPurchaseById = asyncHandler(
  async (req: Request, res: Response) => {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('createdBy', 'firstName lastName email')
      .populate({
        path: 'items.product',
        select: 'name sku barcode',
      });

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: purchase,
    });
  }
);

/**
 * @desc    Create new purchase
 * @route   POST /api/purchases
 * @access  Private
 */
export const createPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      supplier,
      purchaseDate,
      items,
      discount,
      tax,
      shippingCost,
      paymentTerms,
      notes,
    } = req.body;

    // Verify supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      throw new AppError('Supplier not found', 404);
    }

    // Process items and calculate subtotal
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const {
        product,
        quantity,
        unitPrice,
        retailPrice,
        wholesalePrice,
        notes,
        batchNumber,
        expiryDate,
      } = item;

      // Verify product exists
      const productExists = await Product.findById(product);
      if (!productExists) {
        throw new AppError(`Product with ID ${product} not found`, 404);
      }

      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice;
      subtotal += itemSubtotal;

      // Add to processed items
      processedItems.push({
        product,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        notes,
        batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });
    }

    // Calculate total
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const shippingAmount = shippingCost || 0;
    const total = subtotal - discountAmount + taxAmount + shippingAmount;

    // Generate purchase number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const purchaseNumber = `PUR-${dateStr}-${generateRandomString(
      5
    ).toUpperCase()}`;

    // Create purchase
    const purchase = await Purchase.create({
      supplier,
      purchaseNumber, // Explicitly set the purchase number
      purchaseDate: purchaseDate || new Date(),
      items: processedItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shippingCost: shippingAmount,
      total,
      paymentTerms: paymentTerms || supplierExists.paymentTerms || 'cod',
      paymentStatus: 'unpaid', // Default to unpaid so payments can be made later
      status: PurchaseStatus.COMPLETED,
      notes,
      createdBy: new mongoose.Types.ObjectId(req.user.id), // From auth middleware
    });

    // Update product stock levels
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        // Add to inventory with batch and expiry information if provided
        if (item.batchNumber) {
          // Check if batch already exists
          const existingBatchIndex = product.inventory.findIndex(
            (inv) => inv.batchNumber === item.batchNumber
          );

          if (existingBatchIndex >= 0) {
            // Update existing batch
            product.inventory[existingBatchIndex].quantity += item.quantity;
          } else {
            // Add new batch
            product.inventory.push({
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // Default to 2 years if not provided
              quantity: item.quantity,
              location: 'main', // Default location
              costPrice: item.unitPrice,
            });
          }
        } else {
          // If no batch information, just update total stock
          product.totalStock = (product.totalStock || 0) + item.quantity;
        }

        await product.save();
      }
    }

    res.status(201).json({
      status: 'success',
      data: purchase,
    });
  }
);

/**
 * @desc    Update purchase
 * @route   PATCH /api/purchases/:id
 * @access  Private
 */
export const updatePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      status,
      discount,
      tax,
      shippingCost,
      paymentTerms,
      paymentStatus,
      notes,
    } = req.body;

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    // Check if purchase can be updated
    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new AppError(
        `Cannot update a purchase with status: ${purchase.status}`,
        400
      );
    }

    // Update fields
    if (status !== undefined) purchase.status = status;
    if (discount !== undefined) purchase.discount = discount;
    if (tax !== undefined) purchase.tax = tax;
    if (shippingCost !== undefined) purchase.shippingCost = shippingCost;
    if (paymentTerms !== undefined) purchase.paymentTerms = paymentTerms;
    if (paymentStatus !== undefined) purchase.paymentStatus = paymentStatus;
    if (notes !== undefined) purchase.notes = notes;

    // Recalculate total
    purchase.total =
      purchase.subtotal -
      purchase.discount +
      purchase.tax +
      purchase.shippingCost;

    await purchase.save();

    res.status(200).json({
      status: 'success',
      data: purchase,
    });
  }
);

/**
 * @desc    Cancel purchase
 * @route   PATCH /api/purchases/:id/cancel
 * @access  Private
 */
export const cancelPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    // Check if purchase can be cancelled
    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new AppError('Purchase is already cancelled', 400);
    }

    // Update purchase status
    purchase.status = PurchaseStatus.CANCELLED;
    await purchase.save();

    // Revert product stock levels
    for (const item of purchase.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.totalStock = Math.max(
          0,
          (product.totalStock || 0) - item.quantity
        );
        await product.save();
      }
    }

    res.status(200).json({
      status: 'success',
      data: purchase,
    });
  }
);
