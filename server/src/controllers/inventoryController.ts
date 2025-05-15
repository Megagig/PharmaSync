import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model';
import Medication from '../models/medication.model';
import { AppError } from '../utils/appError';
import { IMedication } from '../interfaces/medication.interface';
import { IProduct } from '../interfaces/product.interface';

// Get low stock alerts
export const getLowStockAlerts = async (req: Request, res: Response) => {
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
};

// Get expiring stock alerts
export const getExpiringStockAlerts = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 90;
    const productType = req.query.productType as string;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

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
      success: true,
      data: allItems,
    });
  } catch (error) {
    console.error('Error fetching expiring stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring stock alerts',
      error: (error as Error).message,
    });
  }
};

// Get inventory by location
export const getInventoryByLocation = async (req: Request, res: Response) => {
  try {
    const locationId = req.query.location as string;
    const productType = req.query.productType as string;

    if (!locationId) {
      throw new AppError('Location ID is required', 400);
    }

    // Since we don't have a Location model yet, we'll skip the verification
    // and create a mock location object
    const location = {
      _id: locationId,
      name: 'Default Location',
      type: 'store',
    };

    // Get medications at this location
    const medicationQuery: any = {
      'inventory.location': new mongoose.Types.ObjectId(locationId),
      'inventory.quantity': { $gt: 0 },
    };

    const medications = await Medication.aggregate([
      {
        $unwind: '$inventory',
      },
      {
        $match: medicationQuery,
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          genericName: { $first: '$genericName' },
          brandName: { $first: '$brandName' },
          strength: { $first: '$strength' },
          dosageForm: { $first: '$dosageForm' },
          totalStock: { $sum: '$inventory.quantity' },
          value: {
            $sum: {
              $multiply: [
                '$inventory.quantity',
                { $ifNull: ['$inventory.unitPrice', 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          type: { $literal: 'medication' },
          genericName: 1,
          brandName: 1,
          strength: 1,
          dosageForm: 1,
          totalStock: 1,
          value: 1,
        },
      },
    ]);

    // Get products at this location
    const productQuery: any = {
      'inventory.location': new mongoose.Types.ObjectId(locationId),
      'inventory.quantity': { $gt: 0 },
    };

    if (productType) {
      productQuery.type = productType;
    }

    const products = await Product.aggregate([
      {
        $match: productType ? { type: productType } : {},
      },
      {
        $unwind: '$inventory',
      },
      {
        $match: {
          'inventory.location': new mongoose.Types.ObjectId(locationId),
          'inventory.quantity': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          sku: { $first: '$sku' },
          type: { $first: '$type' },
          category: { $first: '$category' },
          totalStock: { $sum: '$inventory.quantity' },
          value: {
            $sum: {
              $multiply: [
                '$inventory.quantity',
                { $ifNull: ['$inventory.costPrice', 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          type: { $literal: 'product' },
          productType: '$type',
          sku: 1,
          category: 1,
          totalStock: 1,
          value: 1,
        },
      },
    ]);

    // Combine both lists
    const allItems = [...medications, ...products];

    // Calculate total inventory value at this location
    const totalValue = allItems.reduce((sum, item) => sum + item.value, 0);

    res.status(200).json({
      success: true,
      data: {
        location: {
          id: location._id,
          name: location.name,
          type: location.type,
        },
        totalValue,
        totalItems: allItems.length,
        items: allItems,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory by location:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory by location',
      error: (error as Error).message,
    });
  }
};

// Get inventory movements
export const getInventoryMovements = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;
    const productType = req.query.productType as string;

    const query: any = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    if (productType) {
      query['items.productType'] = productType;
    }

    // Since we don't have an InventoryMovement model yet, we'll return an empty array
    const movements = [];

    res.status(200).json({
      success: true,
      data: {
        movements,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory movements',
      error: (error as Error).message,
    });
  }
};

// Get inventory valuation
export const getInventoryValuation = async (req: Request, res: Response) => {
  try {
    const productType = req.query.productType as string;
    const locationId = req.query.location as string;

    // Get medications with their valuation
    const medicationQuery: any[] = [
      {
        $unwind: '$inventory',
      },
      {
        $match: {
          'inventory.quantity': { $gt: 0 },
        },
      },
    ];

    if (locationId) {
      medicationQuery[1].$match['inventory.location'] =
        new mongoose.Types.ObjectId(locationId);
    }

    const medications = await Medication.aggregate([
      ...medicationQuery,
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          totalStock: { $sum: '$inventory.quantity' },
          value: {
            $sum: {
              $multiply: [
                '$inventory.quantity',
                { $ifNull: ['$inventory.unitPrice', 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          type: { $literal: 'medication' },
          totalStock: 1,
          value: 1,
        },
      },
    ]);

    // Get products with their valuation
    const productQuery: any[] = [
      {
        $unwind: '$inventory',
      },
      {
        $match: {
          'inventory.quantity': { $gt: 0 },
        },
      },
    ];

    if (productType) {
      productQuery.unshift({
        $match: { type: productType },
      });
    }

    if (locationId) {
      productQuery[1].$match['inventory.location'] =
        new mongoose.Types.ObjectId(locationId);
    }

    const products = await Product.aggregate([
      ...productQuery,
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          type: { $first: '$type' },
          totalStock: { $sum: '$inventory.quantity' },
          value: {
            $sum: {
              $multiply: [
                '$inventory.quantity',
                { $ifNull: ['$inventory.costPrice', 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          type: { $literal: 'product' },
          productType: '$type',
          totalStock: 1,
          value: 1,
        },
      },
    ]);

    // Combine both lists
    const allItems = [...medications, ...products];

    // Sort by value (descending)
    allItems.sort((a, b) => b.value - a.value);

    // Calculate total inventory value
    const totalValue = allItems.reduce((sum, item) => sum + item.value, 0);

    res.status(200).json({
      success: true,
      data: {
        totalValue,
        items: allItems,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory valuation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory valuation',
      error: (error as Error).message,
    });
  }
};
