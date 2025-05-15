import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model';
import Medication from '../models/medication.model';
import { AppError } from '../utils/error';
import { IMedication } from '../interfaces/medication.interface';
import { IProduct } from '../interfaces/product.interface';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/low-stock
 * @access  Private
 */
export const getLowStockAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;
      const productType = req.query.productType as string;

      // Get medications with stock below threshold
      const medications = await Medication.find({
        $or: [
          { totalStock: { $lte: threshold } },
          { totalStock: { $lte: '$reorderLevel' } },
        ],
      }).select(
        'name genericName brandName strength dosageForm totalStock reorderLevel minimumStockLevel'
      );

      // Get products with stock below threshold
      const productQuery: any = {
        $or: [
          { totalStock: { $lte: threshold } },
          { totalStock: { $lte: '$reorderPoint' } },
        ],
      };

      if (productType) {
        productQuery.type = productType;
      }

      const products = await Product.find(productQuery).select(
        'name sku type category totalStock minimumStockLevel reorderPoint'
      );

      // Transform medications to match the expected format
      const medicationItems = medications.map((med: IMedication) => ({
        id: med._id,
        name: med.name,
        type: 'medication',
        genericName: med.genericName,
        brandName: med.brandName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        totalStock: med.totalStock,
        minimumStockLevel: med.minimumStockLevel || 0,
        reorderPoint: med.reorderLevel || 0,
      }));

      // Transform products to match the expected format
      const productItems = products.map((prod: IProduct) => ({
        id: prod._id,
        name: prod.name,
        type: 'product',
        sku: prod.sku,
        productType: prod.type,
        category: prod.category,
        totalStock: prod.totalStock,
        minimumStockLevel: prod.minimumStockLevel || 0,
        reorderPoint: prod.reorderPoint || 0,
      }));

      // Combine both lists
      const allItems = [...medicationItems, ...productItems];

      res.status(200).json({
        success: true,
        data: allItems,
      });
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock alerts',
        error: (error as Error).message,
      });
    }
  }
);

/**
 * @desc    Get expiring stock alerts
 * @route   GET /api/inventory/expiring
 * @access  Private
 */
export const getExpiringStockAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 90;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    const productType = req.query.productType as string;

    // Get medications with inventory items expiring within the specified days
    const medications = await Medication.aggregate([
      {
        $unwind: '$inventory',
      },
      {
        $match: {
          'inventory.expiryDate': { $lte: expiryDate },
          'inventory.quantity': { $gt: 0 },
        },
      },
      {
        $project: {
          id: '$_id',
          name: '$name',
          type: { $literal: 'medication' },
          genericName: 1,
          brandName: 1,
          strength: 1,
          dosageForm: 1,
          batchNumber: '$inventory.batchNumber',
          quantity: '$inventory.quantity',
          location: '$inventory.location',
          expiryDate: '$inventory.expiryDate',
          daysUntilExpiry: {
            $ceil: {
              $divide: [
                { $subtract: ['$inventory.expiryDate', new Date()] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $sort: { daysUntilExpiry: 1 },
      },
    ]);

    // Get products with inventory items expiring within the specified days
    const productQuery: any[] = [
      {
        $unwind: '$inventory',
      },
      {
        $match: {
          'inventory.expiryDate': { $lte: expiryDate },
          'inventory.quantity': { $gt: 0 },
        },
      },
    ];

    if (productType) {
      productQuery.unshift({
        $match: { type: productType },
      });
    }

    const products = await Product.aggregate([
      ...productQuery,
      {
        $project: {
          id: '$_id',
          name: '$name',
          type: { $literal: 'product' },
          productType: '$type',
          category: '$category',
          sku: '$sku',
          batchNumber: '$inventory.batchNumber',
          quantity: '$inventory.quantity',
          location: '$inventory.location',
          expiryDate: '$inventory.expiryDate',
          daysUntilExpiry: {
            $ceil: {
              $divide: [
                { $subtract: ['$inventory.expiryDate', new Date()] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $sort: { daysUntilExpiry: 1 },
      },
    ]);

    // Combine both lists
    const allItems = [...medications, ...products];

    // Sort by days until expiry
    allItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    res.status(200).json({
      status: 'success',
      data: allItems,
    });
  }
);

/**
 * @desc    Get inventory valuation
 * @route   GET /api/inventory/valuation
 * @access  Private
 */
export const getInventoryValuation = asyncHandler(
  async (req: Request, res: Response) => {
    const productType = req.query.productType as string;

    // Build query for products
    const productQuery: any = {};

    if (productType) {
      productQuery.type = productType;
    }

    // Get all products with inventory
    const products = await Product.find(productQuery).select(
      'name sku type category inventory'
    );

    // Get all medications with inventory (for backward compatibility)
    const medications = await Medication.find().select(
      'name inventory totalStock'
    );

    // Calculate valuation
    let totalValue = 0;
    const valuationData = [];

    // Process products
    for (const product of products) {
      let productValue = 0;

      for (const batch of product.inventory) {
        const batchValue = batch.quantity * batch.costPrice;
        productValue += batchValue;
      }

      totalValue += productValue;

      valuationData.push({
        id: product._id,
        name: product.name,
        sku: product.sku,
        type: 'product',
        productType: product.type,
        category: product.category,
        totalStock: product.inventory.reduce(
          (total, batch) => total + batch.quantity,
          0
        ),
        value: productValue,
      });
    }

    // Process medications (for backward compatibility)
    for (const medication of medications) {
      let medicationValue = 0;

      for (const batch of medication.inventory) {
        const batchValue = batch.quantity * batch.unitPrice;
        medicationValue += batchValue;
      }

      totalValue += medicationValue;

      valuationData.push({
        id: medication._id,
        name: medication.name,
        type: 'medication',
        totalStock: medication.inventory.reduce(
          (total, batch) => total + batch.quantity,
          0
        ),
        value: medicationValue,
      });
    }

    // Sort by value (highest first)
    valuationData.sort((a, b) => b.value - a.value);

    res.status(200).json({
      status: 'success',
      data: {
        totalValue,
        items: valuationData,
      },
    });
  }
);

/**
 * @desc    Get inventory movement history
 * @route   GET /api/inventory/movement
 * @access  Private
 */
export const getInventoryMovement = asyncHandler(
  async (req: Request, res: Response) => {
    const medicationId = req.query.medicationId as string;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(0);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    // Validate medication if provided
    if (medicationId) {
      const medicationExists = await Medication.findById(medicationId);
      if (!medicationExists) {
        throw new AppError('Medication not found', 404);
      }
    }

    // Build pipeline for aggregation
    const pipeline: any[] = [
      {
        $match: {
          ...(medicationId && { _id: medicationId }),
        },
      },
      {
        $lookup: {
          from: 'purchaseorders',
          let: { medicationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$medicationId', '$items.medication'] },
                    { $gte: ['$deliveryDate', startDate] },
                    { $lte: ['$deliveryDate', endDate] },
                    { $eq: ['$status', 'received'] },
                  ],
                },
              },
            },
            {
              $unwind: '$items',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$items.medication', '$$medicationId'],
                },
              },
            },
            {
              $project: {
                date: '$deliveryDate',
                type: { $literal: 'purchase' },
                quantity: '$items.receivedQuantity',
                batchNumber: '$items.batchNumber',
                reference: '$orderNumber',
              },
            },
          ],
          as: 'purchases',
        },
      },
      {
        $lookup: {
          from: 'dispensings',
          let: { medicationId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$medicationId', '$items.medication'] },
                    { $gte: ['$dispensingDate', startDate] },
                    { $lte: ['$dispensingDate', endDate] },
                    { $eq: ['$status', 'completed'] },
                  ],
                },
              },
            },
            {
              $unwind: '$items',
            },
            {
              $match: {
                $expr: {
                  $eq: ['$items.medication', '$$medicationId'],
                },
              },
            },
            {
              $project: {
                date: '$dispensingDate',
                type: { $literal: 'dispensing' },
                quantity: { $multiply: ['$items.quantity', -1] }, // Negative for outgoing
                batchNumber: '$items.batchNumber',
                reference: '$dispensingNumber',
              },
            },
          ],
          as: 'dispensings',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          movements: {
            $concatArrays: ['$purchases', '$dispensings'],
          },
        },
      },
      {
        $unwind: {
          path: '$movements',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'movements.date': 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          movements: { $push: '$movements' },
        },
      },
    ];

    const results = await Medication.aggregate(pipeline);

    res.status(200).json({
      status: 'success',
      data: results,
    });
  }
);
