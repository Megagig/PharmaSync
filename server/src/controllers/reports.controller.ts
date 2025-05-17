import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Dispensing from '../models/dispensing.model';
import Medication from '../models/medication.model';
import Patient from '../models/patient.model';
import Prescription from '../models/prescription.model';
import { DispensingStatus } from '../interfaces/dispensing.interface';
import { PrescriptionStatus } from '../interfaces/prescription.interface';
import { AppError } from '../utils/error';
import logger from '../utils/logger';
import { redisClient } from '../config/redis';

interface SalesReportData {
  summary: {
    totalSales: number;
    totalDispensings: number;
    averageSale: number;
    minSale: number;
    maxSale: number;
    totalItems: number;
    averageItemsPerSale: number;
  };
  salesByDate: Array<{
    date: Date;
    totalSales: number;
    count: number;
  }>;
  paymentMethodBreakdown: Array<{
    paymentMethod: string;
    totalSales: number;
    count: number;
    percentage: number;
  }>;
  topSellingMedications: Array<{
    medicationId: mongoose.Types.ObjectId;
    medicationName: string;
    strength: string;
    totalQuantity: number;
    totalSales: number;
    averagePrice: number;
    transactions: number;
    percentageOfTotal: number;
  }>;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
}

interface InventoryReportData {
  summary: {
    totalMedications: number;
    totalStock: number;
    totalValue: number;
    outOfStockCount: number;
    lowStockCount: number;
    outOfStockPercentage: number;
    lowStockPercentage: number;
  };
  lowStockItems: Array<any>;
  expiringItems: Array<any>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    totalStock: number;
    totalValue: number;
  }>;
  generatedAt: Date;
}

/**
 * @desc    Get sales report with caching
 * @route   GET /api/reports/sales
 * @access  Private
 */
export const getSalesReport = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(new Date().setMonth(new Date().getMonth() - 1));
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);

      // Try to get from cache first
      const cacheKey = `reports:sales:${startDate.toISOString()}:${endDate.toISOString()}`;
      if (redisClient.isOpen) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(
            cachedData.toString()
          ) as SalesReportData;
          res.status(200).json({
            status: 'success',
            data: parsedData,
            source: 'cache',
          });
          return;
        }
      }

      // Aggregate sales data with error handling
      const [
        salesData,
        paymentMethodBreakdown,
        topSellingMedications,
        summary,
      ] = await Promise.all([
        // Daily sales data
        Dispensing.aggregate([
          {
            $match: {
              status: DispensingStatus.COMPLETED,
              dispensingDate: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$dispensingDate' },
                month: { $month: '$dispensingDate' },
                day: { $dayOfMonth: '$dispensingDate' },
              },
              totalSales: { $sum: '$total' },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
          },
          {
            $project: {
              _id: 0,
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day',
                },
              },
              totalSales: 1,
              count: 1,
            },
          },
        ]),

        // Payment method breakdown
        Dispensing.aggregate([
          {
            $match: {
              status: DispensingStatus.COMPLETED,
              dispensingDate: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: '$paymentMethod',
              totalSales: { $sum: '$total' },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              paymentMethod: '$_id',
              totalSales: 1,
              count: 1,
              percentage: {
                $multiply: [
                  { $divide: ['$totalSales', { $sum: '$total' }] },
                  100,
                ],
              },
            },
          },
          {
            $sort: { totalSales: -1 },
          },
        ]),

        // Top selling medications
        Dispensing.aggregate([
          {
            $match: {
              status: DispensingStatus.COMPLETED,
              dispensingDate: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $unwind: '$items',
          },
          {
            $group: {
              _id: '$items.medication',
              totalQuantity: { $sum: '$items.quantity' },
              totalSales: { $sum: '$items.subtotal' },
              averagePrice: { $avg: '$items.unitPrice' },
              transactions: { $sum: 1 },
            },
          },
          {
            $sort: { totalSales: -1 },
          },
          {
            $limit: 10,
          },
          {
            $lookup: {
              from: 'medications',
              localField: '_id',
              foreignField: '_id',
              as: 'medicationDetails',
            },
          },
          {
            $unwind: '$medicationDetails',
          },
          {
            $project: {
              _id: 0,
              medicationId: '$_id',
              medicationName: '$medicationDetails.name',
              strength: '$medicationDetails.strength',
              totalQuantity: 1,
              totalSales: 1,
              averagePrice: { $round: ['$averagePrice', 2] },
              transactions: 1,
              percentageOfTotal: {
                $multiply: [
                  { $divide: ['$totalSales', { $sum: '$totalSales' }] },
                  100,
                ],
              },
            },
          },
        ]),

        // Summary statistics
        Dispensing.aggregate([
          {
            $match: {
              status: DispensingStatus.COMPLETED,
              dispensingDate: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$total' },
              totalDispensings: { $sum: 1 },
              averageSale: { $avg: '$total' },
              minSale: { $min: '$total' },
              maxSale: { $max: '$total' },
              totalItems: { $sum: { $size: '$items' } },
            },
          },
          {
            $project: {
              _id: 0,
              totalSales: 1,
              totalDispensings: 1,
              averageSale: { $round: ['$averageSale', 2] },
              minSale: 1,
              maxSale: 1,
              totalItems: 1,
              averageItemsPerSale: {
                $round: [{ $divide: ['$totalItems', '$totalDispensings'] }, 2],
              },
            },
          },
        ]),
      ]);

      const reportData: SalesReportData = {
        summary:
          summary.length > 0
            ? summary[0]
            : {
                totalSales: 0,
                totalDispensings: 0,
                averageSale: 0,
                minSale: 0,
                maxSale: 0,
                totalItems: 0,
                averageItemsPerSale: 0,
              },
        salesByDate: salesData,
        paymentMethodBreakdown,
        topSellingMedications,
        dateRange: {
          startDate,
          endDate,
        },
        generatedAt: new Date(),
      };

      // Cache the results
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(reportData));
      }

      res.status(200).json({
        status: 'success',
        data: reportData,
        source: 'database',
      });
    } catch (error) {
      logger.error('Error generating sales report:', error);
      next(new AppError('Failed to generate sales report', 500));
    }
  }
);

/**
 * @desc    Get inventory report with caching
 * @route   GET /api/reports/inventory
 * @access  Private
 */
export const getInventoryReport = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try to get from cache first
      const cacheKey = 'reports:inventory';
      if (redisClient.isOpen) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          const parsedData = JSON.parse(
            cachedData.toString()
          ) as InventoryReportData;
          res.status(200).json({
            status: 'success',
            data: parsedData,
            source: 'cache',
          });
          return;
        }
      }

      const [
        inventorySummary,
        lowStockItems,
        expiringItems,
        categoryBreakdown,
      ] = await Promise.all([
        // Inventory summary
        Medication.aggregate([
          {
            $group: {
              _id: null,
              totalMedications: { $sum: 1 },
              totalStock: { $sum: '$totalStock' },
              totalValue: {
                $sum: { $multiply: ['$totalStock', '$unitPrice'] },
              },
              outOfStockCount: {
                $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] },
              },
              lowStockCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ['$totalStock', 0] },
                        { $lte: ['$totalStock', '$reorderLevel'] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalMedications: 1,
              totalStock: 1,
              totalValue: { $round: ['$totalValue', 2] },
              outOfStockCount: 1,
              lowStockCount: 1,
              outOfStockPercentage: {
                $multiply: [
                  { $divide: ['$outOfStockCount', '$totalMedications'] },
                  100,
                ],
              },
              lowStockPercentage: {
                $multiply: [
                  { $divide: ['$lowStockCount', '$totalMedications'] },
                  100,
                ],
              },
            },
          },
        ]),

        // Low stock items
        Medication.find({
          $and: [
            { totalStock: { $gt: 0 } },
            { totalStock: { $lte: '$reorderLevel' } },
          ],
        })
          .select(
            'name strength dosageForm totalStock reorderLevel minimumStockLevel unitPrice'
          )
          .sort({ totalStock: 1 })
          .limit(10),

        // Expiring items (within next 90 days)
        Medication.aggregate([
          {
            $unwind: '$inventory',
          },
          {
            $match: {
              'inventory.expiryDate': {
                $gte: new Date(),
                $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              },
              'inventory.quantity': { $gt: 0 },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              strength: 1,
              batchNumber: '$inventory.batchNumber',
              quantity: '$inventory.quantity',
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
          {
            $limit: 10,
          },
        ]),

        // Category breakdown
        Medication.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalStock: { $sum: '$totalStock' },
              totalValue: {
                $sum: { $multiply: ['$totalStock', '$unitPrice'] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              count: 1,
              totalStock: 1,
              totalValue: { $round: ['$totalValue', 2] },
            },
          },
          {
            $sort: { totalValue: -1 },
          },
        ]),
      ]);

      const reportData: InventoryReportData = {
        summary:
          inventorySummary.length > 0
            ? inventorySummary[0]
            : {
                totalMedications: 0,
                totalStock: 0,
                totalValue: 0,
                outOfStockCount: 0,
                lowStockCount: 0,
                outOfStockPercentage: 0,
                lowStockPercentage: 0,
              },
        lowStockItems,
        expiringItems,
        categoryBreakdown,
        generatedAt: new Date(),
      };

      // Cache the results
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(reportData));
      }

      res.status(200).json({
        status: 'success',
        data: reportData,
        source: 'database',
      });
    } catch (error) {
      logger.error('Error generating inventory report:', error);
      next(new AppError('Failed to generate inventory report', 500));
    }
  }
);

/**
 * @desc    Get prescription report
 * @route   GET /api/reports/prescriptions
 * @access  Private
 */
export const getPrescriptionReport = asyncHandler(
  async (req: Request, res: Response) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    // Get prescription summary
    const prescriptionSummary = await Prescription.aggregate([
      {
        $match: {
          prescriptionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalPrescriptions: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ['$status', PrescriptionStatus.ACTIVE] }, 1, 0],
            },
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', PrescriptionStatus.COMPLETED] }, 1, 0],
            },
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ['$status', PrescriptionStatus.PENDING] }, 1, 0],
            },
          },
          cancelledCount: {
            $sum: {
              $cond: [{ $eq: ['$status', PrescriptionStatus.CANCELLED] }, 1, 0],
            },
          },
          averageItemsPerPrescription: { $avg: { $size: '$items' } },
        },
      },
      {
        $project: {
          _id: 0,
          totalPrescriptions: 1,
          activeCount: 1,
          completedCount: 1,
          pendingCount: 1,
          cancelledCount: 1,
          averageItemsPerPrescription: 1,
        },
      },
    ]);

    // Get prescriptions by date
    const prescriptionsByDate = await Prescription.aggregate([
      {
        $match: {
          prescriptionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$prescriptionDate' },
            month: { $month: '$prescriptionDate' },
            day: { $dayOfMonth: '$prescriptionDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          count: 1,
        },
      },
    ]);

    // Get top prescribed medications
    const topPrescribedMedications = await Prescription.aggregate([
      {
        $match: {
          prescriptionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.medication',
          prescriptionCount: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      {
        $sort: { prescriptionCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'medications',
          localField: '_id',
          foreignField: '_id',
          as: 'medicationDetails',
        },
      },
      {
        $unwind: '$medicationDetails',
      },
      {
        $project: {
          _id: 0,
          medicationId: '$_id',
          medicationName: '$medicationDetails.name',
          strength: '$medicationDetails.strength',
          prescriptionCount: 1,
          totalQuantity: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        summary:
          prescriptionSummary.length > 0
            ? prescriptionSummary[0]
            : {
                totalPrescriptions: 0,
                activeCount: 0,
                completedCount: 0,
                pendingCount: 0,
                cancelledCount: 0,
                averageItemsPerPrescription: 0,
              },
        prescriptionsByDate,
        topPrescribedMedications,
        dateRange: {
          startDate,
          endDate,
        },
      },
    });
  }
);

/**
 * @desc    Get patient report
 * @route   GET /api/reports/patients
 * @access  Private
 */
export const getPatientReport = asyncHandler(
  async (req: Request, res: Response) => {
    // Get patient summary
    const patientSummary = await Patient.aggregate([
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          maleCount: {
            $sum: {
              $cond: [{ $eq: ['$gender', 'male'] }, 1, 0],
            },
          },
          femaleCount: {
            $sum: {
              $cond: [{ $eq: ['$gender', 'female'] }, 1, 0],
            },
          },
          otherGenderCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$gender', 'male'] },
                    { $ne: ['$gender', 'female'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalPatients: 1,
          maleCount: 1,
          femaleCount: 1,
          otherGenderCount: 1,
        },
      },
    ]);

    // Get patients by age group
    const patientsByAgeGroup = await Patient.aggregate([
      {
        $project: {
          ageGroup: {
            $switch: {
              branches: [
                {
                  case: { $lt: ['$age', 18] },
                  then: 'Under 18',
                },
                {
                  case: { $lt: ['$age', 30] },
                  then: '18-29',
                },
                {
                  case: { $lt: ['$age', 45] },
                  then: '30-44',
                },
                {
                  case: { $lt: ['$age', 60] },
                  then: '45-59',
                },
                {
                  case: { $lt: ['$age', 75] },
                  then: '60-74',
                },
              ],
              default: '75+',
            },
          },
        },
      },
      {
        $group: {
          _id: '$ageGroup',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          ageGroup: '$_id',
          count: 1,
        },
      },
      {
        $sort: {
          ageGroup: 1,
        },
      },
    ]);

    // Get top medical conditions
    const topMedicalConditions = await Patient.aggregate([
      {
        $unwind: {
          path: '$medicalConditions',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$medicalConditions.condition',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          condition: '$_id',
          count: 1,
        },
      },
    ]);

    // Get top allergies
    const topAllergies = await Patient.aggregate([
      {
        $unwind: {
          path: '$allergies',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$allergies.allergen',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          allergen: '$_id',
          count: 1,
        },
      },
    ]);

    // Get patients with most prescriptions
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const patientsWithMostPrescriptions = await Prescription.aggregate([
      {
        $match: {
          prescriptionDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$patient',
          prescriptionCount: { $sum: 1 },
        },
      },
      {
        $sort: { prescriptionCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: '_id',
          as: 'patientDetails',
        },
      },
      {
        $unwind: '$patientDetails',
      },
      {
        $project: {
          _id: 0,
          patientId: '$_id',
          patientName: {
            $concat: [
              '$patientDetails.firstName',
              ' ',
              '$patientDetails.lastName',
            ],
          },
          age: '$patientDetails.age',
          gender: '$patientDetails.gender',
          prescriptionCount: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        summary:
          patientSummary.length > 0
            ? patientSummary[0]
            : {
                totalPatients: 0,
                maleCount: 0,
                femaleCount: 0,
                otherGenderCount: 0,
              },
        patientsByAgeGroup,
        topMedicalConditions,
        topAllergies,
        patientsWithMostPrescriptions,
      },
    });
  }
);
