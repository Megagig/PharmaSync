import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model';
import Medication from '../models/medication.model';
import User from '../models/user.model';
import Setting from '../models/setting.model';
import { AppError } from '../utils/error';
import { IMedication } from '../interfaces/medication.interface';
import { IProduct } from '../interfaces/product.interface';
import asyncHandler from 'express-async-handler';
import { sendEmail } from '../utils/email';

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
    const category = req.query.category as string;
    const location = req.query.location as string;

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

    // Add filters to the query if provided
    const matchStage: any = {};
    if (productType) matchStage.type = productType;
    if (category) matchStage.category = category;

    if (Object.keys(matchStage).length > 0) {
      productQuery.unshift({
        $match: matchStage,
      });
    }

    // Add location filter if provided
    if (location) {
      productQuery[1].$match['inventory.location'] = location;
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
      success: true,
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

/**
 * @desc    Send expiry notifications
 * @route   POST /api/inventory/send-expiry-notifications
 * @access  Private/Admin
 */
export const sendExpiryNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Get notification settings
      const settings = await Setting.findOne({ key: 'expiryNotifications' });

      if (!settings || !settings.value.enabled) {
        res.status(400).json({
          success: false,
          message: 'Expiry notifications are not enabled',
        });
        return;
      }

      const { emailRecipients, notificationDays, includeInventoryReport } = settings.value;

      if (!emailRecipients || emailRecipients.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No email recipients configured',
        });
        return;
      }

      // Get expiring products for each notification day
      const expiryData: any = {};

      for (const days of notificationDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        // Get products expiring on this specific day (not range)
        const startDate = new Date(expiryDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(expiryDate);
        endDate.setHours(23, 59, 59, 999);

        const products = await Product.aggregate([
          {
            $unwind: '$inventory',
          },
          {
            $match: {
              'inventory.expiryDate': { $gte: startDate, $lte: endDate },
              'inventory.quantity': { $gt: 0 },
            },
          },
          {
            $project: {
              id: '$_id',
              name: '$name',
              type: '$type',
              category: '$category',
              sku: '$sku',
              batchNumber: '$inventory.batchNumber',
              quantity: '$inventory.quantity',
              location: '$inventory.location',
              expiryDate: '$inventory.expiryDate',
            },
          },
        ]);

        if (products.length > 0) {
          expiryData[days] = products;
        }
      }

      // If no products are expiring, don't send email
      if (Object.keys(expiryData).length === 0) {
        res.status(200).json({
          success: true,
          message: 'No products expiring on notification days',
        });
        return;
      }

      // Prepare email content
      let emailContent = `<h1>Product Expiry Notification</h1>`;

      for (const days in expiryData) {
        emailContent += `<h2>Products Expiring in ${days} Days</h2>`;
        emailContent += `<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">`;
        emailContent += `<tr><th>Product</th><th>SKU</th><th>Batch</th><th>Quantity</th><th>Location</th><th>Expiry Date</th></tr>`;

        for (const product of expiryData[days]) {
          const expiryDate = new Date(product.expiryDate).toLocaleDateString();
          emailContent += `<tr>`;
          emailContent += `<td>${product.name}</td>`;
          emailContent += `<td>${product.sku}</td>`;
          emailContent += `<td>${product.batchNumber}</td>`;
          emailContent += `<td>${product.quantity}</td>`;
          emailContent += `<td>${product.location}</td>`;
          emailContent += `<td>${expiryDate}</td>`;
          emailContent += `</tr>`;
        }

        emailContent += `</table><br/>`;
      }

      // Add inventory report if enabled
      if (includeInventoryReport) {
        // Get inventory summary
        const inventorySummary = await Product.aggregate([
          {
            $project: {
              name: 1,
              sku: 1,
              type: 1,
              category: 1,
              totalStock: { $size: '$inventory' },
              totalQuantity: { $sum: '$inventory.quantity' },
            },
          },
          {
            $sort: { name: 1 },
          },
        ]);

        if (inventorySummary.length > 0) {
          emailContent += `<h2>Inventory Summary</h2>`;
          emailContent += `<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">`;
          emailContent += `<tr><th>Product</th><th>SKU</th><th>Type</th><th>Category</th><th>Total Quantity</th></tr>`;

          for (const item of inventorySummary) {
            emailContent += `<tr>`;
            emailContent += `<td>${item.name}</td>`;
            emailContent += `<td>${item.sku}</td>`;
            emailContent += `<td>${item.type}</td>`;
            emailContent += `<td>${item.category}</td>`;
            emailContent += `<td>${item.totalQuantity}</td>`;
            emailContent += `</tr>`;
          }

          emailContent += `</table>`;
        }
      }

      // Send email to all recipients
      for (const recipient of emailRecipients) {
        await sendEmail({
          to: recipient,
          subject: 'PharmaSync - Product Expiry Notification',
          html: emailContent,
        });
      }

      res.status(200).json({
        success: true,
        message: `Expiry notifications sent to ${emailRecipients.length} recipients`,
      });
    } catch (error) {
      console.error('Error sending expiry notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending expiry notifications',
        error: (error as Error).message,
      });
    }
  }
);