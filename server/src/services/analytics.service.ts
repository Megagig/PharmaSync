import mongoose from 'mongoose';
import { IReportFilter, IReportChart } from '../interfaces/report.interface';
import Medication from '../models/medication.model';
import Patient from '../models/patient.model';
import Prescription from '../models/prescription.model';
import Dispensing from '../models/dispensing.model';
// Inventory is part of Medication model
// import Inventory from '../models/inventory.model';
import User from '../models/user.model';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  format,
} from 'date-fns';

/**
 * Build a MongoDB query from report filters
 * @param filters Array of report filters
 * @returns MongoDB query object
 */
export const buildQueryFromFilters = (filters: IReportFilter[] = []): any => {
  if (!filters || filters.length === 0) {
    return {};
  }

  const query: any = {};

  filters.forEach((filter) => {
    const { field, operator, value } = filter;

    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'notEquals':
        query[field] = { $ne: value };
        break;
      case 'contains':
        query[field] = { $regex: value, $options: 'i' };
        break;
      case 'greaterThan':
        query[field] = { $gt: value };
        break;
      case 'lessThan':
        query[field] = { $lt: value };
        break;
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          query[field] = { $gte: value[0], $lte: value[1] };
        }
        break;
      case 'in':
        if (Array.isArray(value)) {
          query[field] = { $in: value };
        }
        break;
      default:
        break;
    }
  });

  return query;
};

/**
 * Get date range for time period
 * @param period Time period (day, week, month, year)
 * @param date Reference date
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (
  period: 'day' | 'week' | 'month' | 'year',
  date: Date = new Date()
): { start: Date; end: Date } => {
  switch (period) {
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 0 }),
        end: endOfWeek(date, { weekStartsOn: 0 }),
      };
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    case 'year':
      return {
        start: startOfYear(date),
        end: endOfYear(date),
      };
    default:
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
  }
};

/**
 * Generate time series data
 * @param model Mongoose model
 * @param timeField Field to use for time grouping
 * @param valueField Field to aggregate
 * @param startDate Start date
 * @param endDate End date
 * @param interval Time interval (day, week, month)
 * @param aggregation Aggregation method (sum, avg, count)
 * @param additionalQuery Additional query parameters
 * @returns Time series data
 */
export const generateTimeSeries = async (
  model: mongoose.Model<any>,
  timeField: string,
  valueField: string,
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'day',
  aggregation: 'sum' | 'avg' | 'count' = 'count',
  additionalQuery: any = {}
): Promise<any[]> => {
  const query: any = {
    [timeField]: { $gte: startDate, $lte: endDate },
    ...additionalQuery,
  };

  let groupByFormat: string;
  let groupByExpression: any;

  switch (interval) {
    case 'day':
      groupByFormat = '%Y-%m-%d';
      groupByExpression = {
        year: { $year: `$${timeField}` },
        month: { $month: `$${timeField}` },
        day: { $dayOfMonth: `$${timeField}` },
      };
      break;
    case 'week':
      groupByFormat = '%Y-%U';
      groupByExpression = {
        year: { $year: `$${timeField}` },
        week: { $week: `$${timeField}` },
      };
      break;
    case 'month':
      groupByFormat = '%Y-%m';
      groupByExpression = {
        year: { $year: `$${timeField}` },
        month: { $month: `$${timeField}` },
      };
      break;
    default:
      groupByFormat = '%Y-%m-%d';
      groupByExpression = {
        year: { $year: `$${timeField}` },
        month: { $month: `$${timeField}` },
        day: { $dayOfMonth: `$${timeField}` },
      };
  }

  let aggregationOperator: any;
  switch (aggregation) {
    case 'sum':
      aggregationOperator = { $sum: `$${valueField}` };
      break;
    case 'avg':
      aggregationOperator = { $avg: `$${valueField}` };
      break;
    case 'count':
    default:
      aggregationOperator = { $sum: 1 };
      break;
  }

  const pipeline = [
    { $match: query },
    {
      $group: {
        _id: groupByExpression,
        value: aggregationOperator,
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
        '_id.week': 1,
      } as any,
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: { $ifNull: ['$_id.month', 1] },
            day: { $ifNull: ['$_id.day', 1] },
          },
        },
        value: 1,
      },
    },
  ];

  const results = await model.aggregate(pipeline as any);

  // Format dates based on interval
  return results.map((item: any) => ({
    date: format(
      item.date,
      interval === 'day'
        ? 'yyyy-MM-dd'
        : interval === 'week'
        ? 'yyyy-[W]ww'
        : 'yyyy-MM'
    ),
    value: item.value,
  }));
};

/**
 * Generate chart data based on chart configuration
 * @param chart Chart configuration
 * @param startDate Start date
 * @param endDate End date
 * @param additionalQuery Additional query parameters
 * @returns Chart data
 */
export const generateChartData = async (
  chart: IReportChart,
  startDate: Date,
  endDate: Date,
  additionalQuery: any = {}
): Promise<any> => {
  const { type, dataField, labelField, groupBy, aggregation = 'count' } = chart;

  let model;
  switch (dataField.split('.')[0]) {
    case 'medications':
      model = Medication;
      break;
    case 'patients':
      model = Patient;
      break;
    case 'prescriptions':
      model = Prescription;
      break;
    case 'dispensings':
      model = Dispensing;
      break;
    case 'inventory':
      // Use Medication model for inventory data
      model = Medication;
      break;
    case 'users':
      model = User;
      break;
    default:
      throw new Error(`Unknown data field: ${dataField}`);
  }

  // Time series charts
  if (type === 'line' || type === 'area') {
    return generateTimeSeries(
      model,
      'createdAt', // Default time field
      dataField.split('.').slice(1).join('.'),
      startDate,
      endDate,
      groupBy as 'day' | 'week' | 'month',
      aggregation as 'sum' | 'avg' | 'count',
      additionalQuery
    );
  }

  // Group by charts (bar, pie, doughnut)
  const query: any = {
    createdAt: { $gte: startDate, $lte: endDate },
    ...additionalQuery,
  };

  let aggregationOperator: any;
  switch (aggregation) {
    case 'sum':
      aggregationOperator = {
        $sum: `$${dataField.split('.').slice(1).join('.')}`,
      };
      break;
    case 'avg':
      aggregationOperator = {
        $avg: `$${dataField.split('.').slice(1).join('.')}`,
      };
      break;
    case 'min':
      aggregationOperator = {
        $min: `$${dataField.split('.').slice(1).join('.')}`,
      };
      break;
    case 'max':
      aggregationOperator = {
        $max: `$${dataField.split('.').slice(1).join('.')}`,
      };
      break;
    case 'count':
    default:
      aggregationOperator = { $sum: 1 };
      break;
  }

  const pipeline = [
    { $match: query },
    {
      $group: {
        _id: `$${labelField.split('.').slice(1).join('.')}`,
        value: aggregationOperator,
      },
    },
    { $sort: { value: -1 } },
    {
      $project: {
        _id: 0,
        label: '$_id',
        value: 1,
      },
    },
  ];

  return model.aggregate(pipeline as any);
};

/**
 * Generate sales report data
 * @param startDate Start date
 * @param endDate End date
 * @param filters Additional filters
 * @returns Sales report data
 */
export const generateSalesReport = async (
  startDate: Date,
  endDate: Date,
  filters: IReportFilter[] = []
): Promise<any> => {
  const query = {
    createdAt: { $gte: startDate, $lte: endDate },
    ...buildQueryFromFilters(filters),
  };

  // Total sales
  const totalSales = await Dispensing.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  // Sales by medication
  const salesByMedication = await Dispensing.aggregate([
    { $match: query },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'medications',
        localField: 'items.medication',
        foreignField: '_id',
        as: 'medicationInfo',
      },
    },
    { $unwind: '$medicationInfo' },
    {
      $group: {
        _id: '$medicationInfo._id',
        name: { $first: '$medicationInfo.name' },
        total: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
        quantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        total: 1,
        quantity: 1,
      },
    },
  ]);

  // Sales by day
  const salesByDay = await generateTimeSeries(
    Dispensing,
    'createdAt',
    'totalAmount',
    startDate,
    endDate,
    'day',
    'sum',
    query
  );

  return {
    totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
    salesByMedication,
    salesByDay,
  };
};

/**
 * Generate inventory report data
 * @param filters Additional filters
 * @returns Inventory report data
 */
export const generateInventoryReport = async (
  filters: IReportFilter[] = []
): Promise<any> => {
  const query = buildQueryFromFilters(filters);

  // Current inventory status - using Medication model
  const inventoryStatus = await Medication.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'medications',
        localField: 'medication',
        foreignField: '_id',
        as: 'medicationInfo',
      },
    },
    { $unwind: '$medicationInfo' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        medication: {
          id: '$medicationInfo._id',
          name: '$medicationInfo.name',
          manufacturer: '$medicationInfo.manufacturer',
        },
        batchNumber: 1,
        quantity: 1,
        expiryDate: 1,
        reorderLevel: 1,
        unitCost: 1,
        totalValue: { $multiply: ['$quantity', '$unitCost'] },
        status: {
          $cond: {
            if: { $lte: ['$quantity', '$reorderLevel'] },
            then: 'Low Stock',
            else: 'In Stock',
          },
        },
      },
    },
    { $sort: { 'medication.name': 1 } },
  ]);

  // Low stock items
  const lowStockItems = inventoryStatus.filter(
    (item: any) => item.status === 'Low Stock'
  );

  // Expiring soon (within 90 days)
  const today = new Date();
  const ninetyDaysFromNow = new Date(today);
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const expiringSoon = await Medication.aggregate([
    {
      $match: {
        ...query,
        expiryDate: { $gte: today, $lte: ninetyDaysFromNow },
        quantity: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: 'medications',
        localField: 'medication',
        foreignField: '_id',
        as: 'medicationInfo',
      },
    },
    { $unwind: '$medicationInfo' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        medication: {
          id: '$medicationInfo._id',
          name: '$medicationInfo.name',
        },
        batchNumber: 1,
        quantity: 1,
        expiryDate: 1,
        daysUntilExpiry: {
          $divide: [{ $subtract: ['$expiryDate', today] }, 1000 * 60 * 60 * 24],
        },
      },
    },
    { $sort: { expiryDate: 1 } },
  ]);

  // Total inventory value
  const totalValue = inventoryStatus.reduce(
    (sum: number, item: any) => sum + item.totalValue,
    0
  );

  return {
    inventoryStatus,
    lowStockItems,
    expiringSoon,
    totalValue,
    totalItems: inventoryStatus.length,
    lowStockCount: lowStockItems.length,
    expiringSoonCount: expiringSoon.length,
  };
};

/**
 * Generate prescription report data
 * @param startDate Start date
 * @param endDate End date
 * @param filters Additional filters
 * @returns Prescription report data
 */
export const generatePrescriptionReport = async (
  startDate: Date,
  endDate: Date,
  filters: IReportFilter[] = []
): Promise<any> => {
  const query = {
    createdAt: { $gte: startDate, $lte: endDate },
    ...buildQueryFromFilters(filters),
  };

  // Total prescriptions
  const totalPrescriptions = await Prescription.countDocuments(query);

  // Prescriptions by status
  const prescriptionsByStatus = await Prescription.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Prescriptions by medication
  const prescriptionsByMedication = await Prescription.aggregate([
    { $match: query },
    { $unwind: '$medications' },
    {
      $lookup: {
        from: 'medications',
        localField: 'medications.medication',
        foreignField: '_id',
        as: 'medicationInfo',
      },
    },
    { $unwind: '$medicationInfo' },
    {
      $group: {
        _id: '$medicationInfo._id',
        name: { $first: '$medicationInfo.name' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        count: 1,
      },
    },
  ]);

  // Prescriptions by day
  const prescriptionsByDay = await generateTimeSeries(
    Prescription,
    'createdAt',
    '',
    startDate,
    endDate,
    'day',
    'count',
    query
  );

  return {
    totalPrescriptions,
    prescriptionsByStatus,
    prescriptionsByMedication,
    prescriptionsByDay,
  };
};

/**
 * Generate patient report data
 * @param filters Additional filters
 * @returns Patient report data
 */
export const generatePatientReport = async (
  filters: IReportFilter[] = []
): Promise<any> => {
  const query = buildQueryFromFilters(filters);

  // Total patients
  const totalPatients = await Patient.countDocuments(query);

  // Patients by age group
  const patientsByAgeGroup = await Patient.aggregate([
    { $match: query },
    {
      $project: {
        ageGroup: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: 'Under 18' },
              {
                case: { $and: [{ $gte: ['$age', 18] }, { $lt: ['$age', 30] }] },
                then: '18-29',
              },
              {
                case: { $and: [{ $gte: ['$age', 30] }, { $lt: ['$age', 45] }] },
                then: '30-44',
              },
              {
                case: { $and: [{ $gte: ['$age', 45] }, { $lt: ['$age', 60] }] },
                then: '45-59',
              },
              { case: { $gte: ['$age', 60] }, then: '60+' },
            ],
            default: 'Unknown',
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
    { $sort: { ageGroup: 1 } },
  ]);

  // Patients by gender
  const patientsByGender = await Patient.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        gender: '$_id',
        count: 1,
      },
    },
  ]);

  // New patients by month (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const newPatientsByMonth = await generateTimeSeries(
    Patient,
    'createdAt',
    '',
    twelveMonthsAgo,
    new Date(),
    'month',
    'count',
    query
  );

  return {
    totalPatients,
    patientsByAgeGroup,
    patientsByGender,
    newPatientsByMonth,
  };
};

/**
 * Generate staff report data
 * @param filters Additional filters
 * @returns Staff report data
 */
export const generateStaffReport = async (
  filters: IReportFilter[] = []
): Promise<any> => {
  const query = {
    ...buildQueryFromFilters(filters),
    role: { $ne: 'patient' },
  };

  // Total staff
  const totalStaff = await User.countDocuments(query);

  // Staff by role
  const staffByRole = await User.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Activity by staff (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activityByStaff = await mongoose.model('ActivityLog').aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    { $match: { 'userInfo.role': { $ne: 'patient' } } },
    {
      $group: {
        _id: '$user',
        name: {
          $first: {
            $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'],
          },
        },
        role: { $first: '$userInfo.role' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        role: 1,
        count: 1,
      },
    },
  ]);

  return {
    totalStaff,
    staffByRole,
    activityByStaff,
  };
};
