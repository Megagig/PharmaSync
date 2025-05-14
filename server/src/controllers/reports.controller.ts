import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Dispensing from '../models/dispensing.model';
import Medication from '../models/medication.model';
import Patient from '../models/patient.model';
import Prescription from '../models/prescription.model';
import { DispensingStatus } from '../interfaces/dispensing.interface';
import { PrescriptionStatus } from '../interfaces/prescription.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get sales report
 * @route   GET /api/reports/sales
 * @access  Private
 */
export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : new Date();
  
  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);
  
  // Aggregate sales data
  const salesData = await Dispensing.aggregate([
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
  ]);
  
  // Get payment method breakdown
  const paymentMethodBreakdown = await Dispensing.aggregate([
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
      },
    },
  ]);
  
  // Get top selling medications
  const topSellingMedications = await Dispensing.aggregate([
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
      },
    },
  ]);
  
  // Calculate summary statistics
  const summary = await Dispensing.aggregate([
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
      },
    },
    {
      $project: {
        _id: 0,
        totalSales: 1,
        totalDispensings: 1,
        averageSale: 1,
        minSale: 1,
        maxSale: 1,
      },
    },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      summary: summary.length > 0 ? summary[0] : {
        totalSales: 0,
        totalDispensings: 0,
        averageSale: 0,
        minSale: 0,
        maxSale: 0,
      },
      salesByDate: salesData,
      paymentMethodBreakdown,
      topSellingMedications,
      dateRange: {
        startDate,
        endDate,
      },
    },
  });
});

/**
 * @desc    Get inventory report
 * @route   GET /api/reports/inventory
 * @access  Private
 */
export const getInventoryReport = asyncHandler(async (req: Request, res: Response) => {
  // Get inventory summary
  const inventorySummary = await Medication.aggregate([
    {
      $group: {
        _id: null,
        totalMedications: { $sum: 1 },
        totalStock: { $sum: '$totalStock' },
        totalValue: {
          $sum: {
            $reduce: {
              input: '$inventory',
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  { $multiply: ['$$this.quantity', '$$this.unitPrice'] },
                ],
              },
            },
          },
        },
        lowStockCount: {
          $sum: {
            $cond: [
              { $lte: ['$totalStock', '$reorderLevel'] },
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
        totalValue: 1,
        lowStockCount: 1,
      },
    },
  ]);
  
  // Get stock by category
  const stockByCategory = await Medication.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalStock: { $sum: '$totalStock' },
        totalValue: {
          $sum: {
            $reduce: {
              input: '$inventory',
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  { $multiply: ['$$this.quantity', '$$this.unitPrice'] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1,
        totalStock: 1,
        totalValue: 1,
      },
    },
  ]);
  
  // Get expiring medications
  const currentDate = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const next3Months = new Date();
  next3Months.setMonth(next3Months.getMonth() + 3);
  const next6Months = new Date();
  next6Months.setMonth(next6Months.getMonth() + 6);
  
  const expiryBreakdown = await Medication.aggregate([
    {
      $unwind: '$inventory',
    },
    {
      $match: {
        'inventory.quantity': { $gt: 0 },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              {
                case: { $lte: ['$inventory.expiryDate', currentDate] },
                then: 'expired',
              },
              {
                case: { $lte: ['$inventory.expiryDate', nextMonth] },
                then: 'within1Month',
              },
              {
                case: { $lte: ['$inventory.expiryDate', next3Months] },
                then: 'within3Months',
              },
              {
                case: { $lte: ['$inventory.expiryDate', next6Months] },
                then: 'within6Months',
              },
            ],
            default: 'after6Months',
          },
        },
        count: { $sum: 1 },
        totalStock: { $sum: '$inventory.quantity' },
        totalValue: { $sum: { $multiply: ['$inventory.quantity', '$inventory.unitPrice'] } },
      },
    },
    {
      $project: {
        _id: 0,
        expiryPeriod: '$_id',
        count: 1,
        totalStock: 1,
        totalValue: 1,
      },
    },
  ]);
  
  // Get inventory turnover
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  const inventoryTurnover = await Dispensing.aggregate([
    {
      $match: {
        status: DispensingStatus.COMPLETED,
        dispensingDate: { $gte: startDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.medication',
        totalDispensed: { $sum: '$items.quantity' },
      },
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
        totalStock: '$medicationDetails.totalStock',
        totalDispensed: 1,
        turnoverRatio: {
          $cond: [
            { $eq: ['$medicationDetails.totalStock', 0] },
            0,
            { $divide: ['$totalDispensed', '$medicationDetails.totalStock'] },
          ],
        },
      },
    },
    {
      $sort: { turnoverRatio: -1 },
    },
    {
      $limit: 10,
    },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      summary: inventorySummary.length > 0 ? inventorySummary[0] : {
        totalMedications: 0,
        totalStock: 0,
        totalValue: 0,
        lowStockCount: 0,
      },
      stockByCategory,
      expiryBreakdown,
      inventoryTurnover,
    },
  });
});

/**
 * @desc    Get prescription report
 * @route   GET /api/reports/prescriptions
 * @access  Private
 */
export const getPrescriptionReport = asyncHandler(async (req: Request, res: Response) => {
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
      summary: prescriptionSummary.length > 0 ? prescriptionSummary[0] : {
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
});

/**
 * @desc    Get patient report
 * @route   GET /api/reports/patients
 * @access  Private
 */
export const getPatientReport = asyncHandler(async (req: Request, res: Response) => {
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
          $concat: ['$patientDetails.firstName', ' ', '$patientDetails.lastName'],
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
      summary: patientSummary.length > 0 ? patientSummary[0] : {
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
});
