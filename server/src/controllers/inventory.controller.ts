import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Medication from '../models/medication.model';
import Product from '../models/product.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/low-stock
 * @access  Private
 */
export const getLowStockAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const productType = req.query.productType as string;

    // Build query
    const query: any = {};

    if (productType) {
      query.type = productType;
    }

    // Find products with stock below threshold
    const lowStockProducts = await Product.find({
      ...query,
      $expr: {
        $lte: [{ $sum: '$inventory.quantity' }, '$minimumStockLevel'],
      },
    })
      .select('name sku type category inventory minimumStockLevel reorderPoint')
      .sort({ 'inventory.quantity': 1 });

    // Find medications with stock below threshold (for backward compatibility)
    const lowStockMedications = await Medication.find({
      totalStock: { $lte: threshold },
    })
      .select(
        'name genericName brandName strength dosageForm totalStock reorderLevel'
      )
      .sort({ totalStock: 1 });

    // Combine and format results
    const lowStockItems = [
      ...lowStockProducts.map((product) => ({
        id: product._id,
        name: product.name,
        sku: product.sku,
        type: 'product',
        productType: product.type,
        category: product.category,
        totalStock: product.inventory.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        minimumStockLevel: product.minimumStockLevel,
        reorderPoint: product.reorderPoint,
      })),
      ...lowStockMedications.map((medication) => ({
        id: medication._id,
        name: medication.name,
        genericName: medication.genericName,
        brandName: medication.brandName,
        strength: medication.strength,
        dosageForm: medication.dosageForm,
        type: 'medication',
        totalStock: medication.totalStock,
        reorderLevel: medication.reorderLevel,
      })),
    ];

    res.status(200).json({
      status: 'success',
      data: lowStockItems,
    });
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

    // Build query for products
    const productQuery: any = {};

    if (productType) {
      productQuery.type = productType;
    }

    // Find products with batches expiring within the specified days
    const products = await Product.find({
      ...productQuery,
      'inventory.expiryDate': { $lte: expiryDate, $gte: new Date() },
    });

    // Find medications with batches expiring within the specified days (for backward compatibility)
    const medications = await Medication.find({
      'inventory.expiryDate': { $lte: expiryDate, $gte: new Date() },
    });

    // Filter and format the results
    const expiringItems = [];

    // Process products
    for (const product of products) {
      const expiringBatches = product.inventory.filter(
        (batch) =>
          batch.expiryDate <= expiryDate &&
          batch.expiryDate >= new Date() &&
          batch.quantity > 0
      );

      for (const batch of expiringBatches) {
        expiringItems.push({
          id: product._id,
          name: product.name,
          sku: product.sku,
          type: 'product',
          productType: product.type,
          category: product.category,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          location: batch.location,
          expiryDate: batch.expiryDate,
          daysUntilExpiry: Math.ceil(
            (batch.expiryDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        });
      }
    }

    // Process medications (for backward compatibility)
    for (const medication of medications) {
      const expiringBatches = medication.inventory.filter(
        (batch) =>
          batch.expiryDate <= expiryDate &&
          batch.expiryDate >= new Date() &&
          batch.quantity > 0
      );

      for (const batch of expiringBatches) {
        expiringItems.push({
          id: medication._id,
          name: medication.name,
          type: 'medication',
          strength: medication.strength,
          dosageForm: medication.dosageForm,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          daysUntilExpiry: Math.ceil(
            (batch.expiryDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        });
      }
    }

    // Sort by days until expiry
    expiringItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    res.status(200).json({
      status: 'success',
      data: expiringItems,
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

/**
 * @desc    Adjust inventory
 * @route   POST /api/inventory/adjust
 * @access  Private
 */
export const adjustInventory = asyncHandler(
  async (req: Request, res: Response) => {
    const { medicationId, productId, batchNumber, quantity, reason, location } =
      req.body;

    // Check if we're adjusting a medication or a product
    if (medicationId) {
      // Validate medication
      const medication = await Medication.findById(medicationId);
      if (!medication) {
        throw new AppError('Medication not found', 404);
      }

      // Find the batch
      const batchIndex = medication.inventory.findIndex(
        (batch) => batch.batchNumber === batchNumber
      );

      if (batchIndex === -1) {
        throw new AppError(
          `Batch ${batchNumber} not found for this medication`,
          404
        );
      }

      // Calculate new quantity
      const currentQuantity = medication.inventory[batchIndex].quantity;
      const newQuantity = currentQuantity + quantity;

      if (newQuantity < 0) {
        throw new AppError(
          'Adjustment would result in negative inventory',
          400
        );
      }

      // Update batch quantity
      medication.inventory[batchIndex].quantity = newQuantity;

      // Add adjustment note
      const adjustmentNote = `Inventory adjusted by ${
        quantity > 0 ? '+' : ''
      }${quantity} units. Reason: ${reason}`;
      medication.notes = medication.notes
        ? `${medication.notes}\n\n${adjustmentNote}`
        : adjustmentNote;

      await medication.save();

      res.status(200).json({
        status: 'success',
        data: {
          type: 'medication',
          name: medication.name,
          batchNumber,
          previousQuantity: currentQuantity,
          adjustmentQuantity: quantity,
          newQuantity,
          reason,
        },
      });
    } else if (productId) {
      // Validate product
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Find the batch
      const batchIndex = product.inventory.findIndex(
        (batch) =>
          batch.batchNumber === batchNumber && batch.location === location
      );

      if (batchIndex === -1) {
        throw new AppError(
          `Batch ${batchNumber} not found for this product at location ${location}`,
          404
        );
      }

      // Calculate new quantity
      const currentQuantity = product.inventory[batchIndex].quantity;
      const newQuantity = currentQuantity + quantity;

      if (newQuantity < 0) {
        throw new AppError(
          'Adjustment would result in negative inventory',
          400
        );
      }

      // Update batch quantity
      product.inventory[batchIndex].quantity = newQuantity;

      // Add adjustment note
      const adjustmentNote = `Inventory adjusted by ${
        quantity > 0 ? '+' : ''
      }${quantity} units at location ${location}. Reason: ${reason}`;
      product.notes = product.notes
        ? `${product.notes}\n\n${adjustmentNote}`
        : adjustmentNote;

      await product.save();

      res.status(200).json({
        status: 'success',
        data: {
          type: 'product',
          name: product.name,
          sku: product.sku,
          batchNumber,
          location,
          previousQuantity: currentQuantity,
          adjustmentQuantity: quantity,
          newQuantity,
          reason,
        },
      });
    } else {
      throw new AppError('Either medicationId or productId is required', 400);
    }
  }
);
