import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Medication from '../models/medication.model';
import { AppError } from '../utils/error';

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/low-stock
 * @access  Private
 */
export const getLowStockAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const threshold = parseInt(req.query.threshold as string) || 10;

    // Find medications with stock below threshold
    const lowStockMedications = await Medication.find({
      totalStock: { $lte: threshold },
    })
      .select(
        'name genericName brandName strength dosageForm totalStock reorderLevel'
      )
      .sort({ totalStock: 1 });

    res.status(200).json({
      status: 'success',
      data: lowStockMedications,
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

    // Find medications with batches expiring within the specified days
    const medications = await Medication.find({
      'inventory.expiryDate': { $lte: expiryDate, $gte: new Date() },
    });

    // Filter and format the results
    const expiringItems = [];

    for (const medication of medications) {
      const expiringBatches = medication.inventory.filter(
        (batch) =>
          batch.expiryDate <= expiryDate &&
          batch.expiryDate >= new Date() &&
          batch.quantity > 0
      );

      for (const batch of expiringBatches) {
        expiringItems.push({
          medicationId: medication._id,
          medicationName: medication.name,
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
    // Get all medications with inventory
    const medications = await Medication.find().select(
      'name inventory totalStock'
    );

    // Calculate valuation
    let totalValue = 0;
    const valuationData = [];

    for (const medication of medications) {
      let medicationValue = 0;

      for (const batch of medication.inventory) {
        const batchValue = batch.quantity * batch.unitPrice;
        medicationValue += batchValue;
      }

      totalValue += medicationValue;

      valuationData.push({
        medicationId: medication._id,
        medicationName: medication.name,
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
        medications: valuationData,
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
    const { medicationId, batchNumber, quantity, reason } = req.body;

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
      throw new AppError('Adjustment would result in negative inventory', 400);
    }

    // Update batch quantity
    medication.inventory[batchIndex].quantity = newQuantity;

    // Total stock is calculated from inventory

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
        medication: medication.name,
        batchNumber,
        previousQuantity: currentQuantity,
        adjustmentQuantity: quantity,
        newQuantity,
        reason,
      },
    });
  }
);
