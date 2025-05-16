import Patient from '../models/patient.model';
import Medication from '../models/medication.model';
import Prescription from '../models/prescription.model';
import Dispensing from '../models/dispensing.model';
import Inventory from '../models/inventory.model';
import InventoryMovement from '../models/inventoryMovement.model';
import Sale from '../models/sale.model';
import PosTransaction from '../models/posTransaction.model';
import User from '../models/user.model';
import ActivityLog from '../models/activityLog.model';
import { ReportFormat } from '../interfaces/report.interface';
import {
  generatePDF,
  generateExcel,
  generateCSV,
} from '../utils/report-generators';
import { MovementType } from '../interfaces/inventoryMovement.interface';
import { PrescriptionStatus } from '../interfaces/prescription.interface';
import { DispensingStatus } from '../interfaces/dispensing.interface';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import mongoose from 'mongoose';

/**
 * Generate comprehensive patient report
 */
export const generatePatientComprehensiveReport = async (
  startDate?: Date,
  endDate?: Date,
  format: ReportFormat = ReportFormat.JSON
) => {
  // Build date filter
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.createdAt = { $gte: startDate };
  }
  if (endDate) {
    dateFilter.createdAt = { ...dateFilter.createdAt, $lte: endDate };
  }

  // Get patient demographics
  const totalPatients = await Patient.countDocuments(dateFilter);
  const maleCount = await Patient.countDocuments({
    ...dateFilter,
    gender: 'male',
  });
  const femaleCount = await Patient.countDocuments({
    ...dateFilter,
    gender: 'female',
  });
  const otherGenderCount = await Patient.countDocuments({
    ...dateFilter,
    gender: { $nin: ['male', 'female'] },
  });

  // Get age distribution
  const patients = await Patient.find(dateFilter);
  const ageGroups = {
    'Under 18': 0,
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    'Over 60': 0,
  };

  patients.forEach((patient) => {
    const age = patient.age || 0;
    if (age < 18) ageGroups['Under 18']++;
    else if (age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else ageGroups['Over 60']++;
  });

  // Get top medical conditions
  const allConditions: { [key: string]: number } = {};
  patients.forEach((patient) => {
    patient.medicalConditions.forEach((condition) => {
      const conditionName = condition.condition;
      allConditions[conditionName] = (allConditions[conditionName] || 0) + 1;
    });
  });

  const topMedicalConditions = Object.entries(allConditions)
    .map(([condition, count]) => ({ condition, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get top allergies
  const allAllergies: { [key: string]: number } = {};
  patients.forEach((patient) => {
    patient.allergies.forEach((allergy) => {
      const allergenName = allergy.allergen;
      allAllergies[allergenName] = (allAllergies[allergenName] || 0) + 1;
    });
  });

  const topAllergies = Object.entries(allAllergies)
    .map(([allergen, count]) => ({ allergen, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get patients with most prescriptions
  const prescriptions = await Prescription.find(dateFilter)
    .populate('patient', 'firstName lastName dateOfBirth gender')
    .lean();

  const prescriptionsByPatient: { [key: string]: any } = {};
  prescriptions.forEach((prescription) => {
    // Type assertion for populated patient field
    const patient = prescription.patient as any;
    const patientId = patient._id.toString();
    if (!prescriptionsByPatient[patientId]) {
      prescriptionsByPatient[patientId] = {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        gender: patient.gender,
        prescriptionCount: 0,
      };
    }
    prescriptionsByPatient[patientId].prescriptionCount++;
  });

  const patientsWithMostPrescriptions = Object.values(prescriptionsByPatient)
    .sort((a: any, b: any) => b.prescriptionCount - a.prescriptionCount)
    .slice(0, 10);

  // Compile the report data
  const reportData = {
    summary: {
      totalPatients,
      maleCount,
      femaleCount,
      otherGenderCount,
      genderDistribution: {
        male: totalPatients > 0 ? (maleCount / totalPatients) * 100 : 0,
        female: totalPatients > 0 ? (femaleCount / totalPatients) * 100 : 0,
        other: totalPatients > 0 ? (otherGenderCount / totalPatients) * 100 : 0,
      },
    },
    patientsByAgeGroup: Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: totalPatients > 0 ? (count / totalPatients) * 100 : 0,
    })),
    topMedicalConditions,
    topAllergies,
    patientsWithMostPrescriptions,
  };

  // Return data in requested format
  if (format === ReportFormat.JSON) {
    return reportData;
  } else if (format === ReportFormat.PDF) {
    return generatePDF(reportData, 'Patient Comprehensive Report');
  } else if (format === ReportFormat.EXCEL) {
    return generateExcel(reportData, 'Patient Report');
  } else if (format === ReportFormat.CSV) {
    return generateCSV(reportData);
  }

  return reportData;
};

/**
 * Generate comprehensive medication report
 */
export const generateMedicationComprehensiveReport = async (
  startDate?: Date,
  endDate?: Date,
  medicationType?: string,
  format: ReportFormat = ReportFormat.JSON
) => {
  // Build filters
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.createdAt = { $gte: startDate };
  }
  if (endDate) {
    dateFilter.createdAt = { ...dateFilter.createdAt, $lte: endDate };
  }

  const typeFilter: any = {};
  if (medicationType && medicationType !== 'all') {
    typeFilter.type = medicationType;
  }

  // Get medication usage data
  const medications = await Medication.find({ ...typeFilter }).lean();

  // Get prescription data for these medications
  const prescriptions = await Prescription.find({
    ...dateFilter,
    status: { $ne: PrescriptionStatus.CANCELLED },
  })
    .populate('items.medication')
    .lean();

  // Get dispensing data
  const dispensings = await Dispensing.find({
    ...dateFilter,
    status: DispensingStatus.COMPLETED,
  })
    .populate('items.medication')
    .lean();

  // Calculate medication usage
  const medicationUsage: { [key: string]: any } = {};

  // Process prescriptions
  prescriptions.forEach((prescription) => {
    prescription.items.forEach((item: any) => {
      const medicationId = item.medication._id.toString();
      if (!medicationUsage[medicationId]) {
        medicationUsage[medicationId] = {
          medicationId,
          medicationName: item.medication.name,
          genericName: item.medication.genericName,
          brandName: item.medication.brandName,
          category: item.medication.category,
          prescriptionCount: 0,
          dispensedCount: 0,
          totalQuantity: 0,
        };
      }
      medicationUsage[medicationId].prescriptionCount++;
      medicationUsage[medicationId].totalQuantity += item.quantity;
    });
  });

  // Process dispensings
  dispensings.forEach((dispensing) => {
    dispensing.items.forEach((item: any) => {
      const medicationId = item.medication._id.toString();
      if (!medicationUsage[medicationId]) {
        medicationUsage[medicationId] = {
          medicationId,
          medicationName: item.medication.name,
          genericName: item.medication.genericName,
          brandName: item.medication.brandName,
          category: item.medication.category,
          prescriptionCount: 0,
          dispensedCount: 0,
          totalQuantity: 0,
        };
      }
      medicationUsage[medicationId].dispensedCount++;
    });
  });

  // Get medication categories
  const categories: { [key: string]: number } = {};
  medications.forEach((medication) => {
    const category = medication.category;
    categories[category] = (categories[category] || 0) + 1;
  });

  const medicationByCategory = Object.entries(categories)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Get top prescribed medications
  const topPrescribedMedications = Object.values(medicationUsage)
    .sort((a: any, b: any) => b.prescriptionCount - a.prescriptionCount)
    .slice(0, 10);

  // Get top dispensed medications
  const topDispensedMedications = Object.values(medicationUsage)
    .sort((a: any, b: any) => b.dispensedCount - a.dispensedCount)
    .slice(0, 10);

  // Compile the report data
  const reportData = {
    summary: {
      totalMedications: medications.length,
      totalPrescriptions: prescriptions.length,
      totalDispensings: dispensings.length,
      medicationCategories: medicationByCategory,
    },
    topPrescribedMedications,
    topDispensedMedications,
    medicationUsage: Object.values(medicationUsage),
  };

  // Return data in requested format
  if (format === ReportFormat.JSON) {
    return reportData;
  } else if (format === ReportFormat.PDF) {
    return generatePDF(reportData, 'Medication Comprehensive Report');
  } else if (format === ReportFormat.EXCEL) {
    return generateExcel(reportData, 'Medication Report');
  } else if (format === ReportFormat.CSV) {
    return generateCSV(reportData);
  }

  return reportData;
};

/**
 * Helper function to calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Generate comprehensive inventory report
 */
export const generateInventoryComprehensiveReport = async (
  startDate?: Date,
  endDate?: Date,
  location?: string,
  reportType: string = 'valuation',
  format: ReportFormat = ReportFormat.JSON
) => {
  // Build filters
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.createdAt = { $gte: startDate };
  }
  if (endDate) {
    dateFilter.createdAt = { ...dateFilter.createdAt, $lte: endDate };
  }

  const locationFilter: any = {};
  if (location && location !== 'all') {
    locationFilter.location = location;
  }

  // Get inventory data
  const inventoryItems = await Inventory.find({
    ...locationFilter,
    ...dateFilter,
  })
    .populate('medication')
    .lean();

  // Get inventory movements
  const movements = await InventoryMovement.find({
    ...dateFilter,
    ...locationFilter,
  })
    .populate('items.product')
    .lean();

  // Calculate inventory summary
  const totalMedications = await Medication.countDocuments();
  const totalStock = inventoryItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = inventoryItems.reduce((sum, item) => {
    return sum + item.quantity * (item.purchasePrice || 0);
  }, 0);

  // Calculate low stock items
  const lowStockItems = [];
  for (const item of inventoryItems) {
    const medication = item.medication as any;
    if (item.quantity <= medication.minimumStockLevel) {
      lowStockItems.push({
        medicationId: medication._id,
        medicationName: medication.name,
        currentStock: item.quantity,
        minimumLevel: medication.minimumStockLevel,
        reorderQuantity: medication.minimumStockLevel * 2 - item.quantity,
      });
    }
  }

  // Group stock by category
  const stockByCategory: { [key: string]: any } = {};
  inventoryItems.forEach((item) => {
    const medication = item.medication as any;
    const category = medication.category;
    if (!stockByCategory[category]) {
      stockByCategory[category] = {
        category,
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };
    }
    stockByCategory[category].count++;
    stockByCategory[category].totalStock += item.quantity;
    stockByCategory[category].totalValue +=
      item.quantity * (item.purchasePrice || 0);
  });

  // Analyze expiry dates
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);
  const ninetyDaysLater = new Date(today);
  ninetyDaysLater.setDate(today.getDate() + 90);
  const oneEightyDaysLater = new Date(today);
  oneEightyDaysLater.setDate(today.getDate() + 180);

  const expiryBreakdown = [
    { expiryPeriod: 'Expired', count: 0, totalStock: 0, totalValue: 0 },
    { expiryPeriod: 'Within 30 days', count: 0, totalStock: 0, totalValue: 0 },
    { expiryPeriod: '31-90 days', count: 0, totalStock: 0, totalValue: 0 },
    { expiryPeriod: '91-180 days', count: 0, totalStock: 0, totalValue: 0 },
    { expiryPeriod: 'Over 180 days', count: 0, totalStock: 0, totalValue: 0 },
  ];

  inventoryItems.forEach((item) => {
    const expiryDate = new Date(item.expiryDate);
    let category;

    if (expiryDate < today) {
      category = expiryBreakdown[0]; // Expired
    } else if (expiryDate <= thirtyDaysLater) {
      category = expiryBreakdown[1]; // Within 30 days
    } else if (expiryDate <= ninetyDaysLater) {
      category = expiryBreakdown[2]; // 31-90 days
    } else if (expiryDate <= oneEightyDaysLater) {
      category = expiryBreakdown[3]; // 91-180 days
    } else {
      category = expiryBreakdown[4]; // Over 180 days
    }

    category.count++;
    category.totalStock += item.quantity;
    category.totalValue += item.quantity * (item.purchasePrice || 0);
  });

  // Compile the report data
  interface InventoryReportData {
    summary: {
      totalMedications: number;
      totalStock: number;
      totalValue: number;
      lowStockCount: number;
    };
    stockByCategory: any[];
    expiryBreakdown: {
      expiryPeriod: string;
      count: number;
      totalStock: number;
      totalValue: number;
    }[];
    lowStockItems: {
      medicationId: any;
      medicationName: string;
      currentStock: number;
      minimumLevel: number;
      reorderQuantity: number;
    }[];
    movementAnalysis?: {
      purchases: number;
      sales: number;
      transfers: number;
      adjustments: number;
      returns: number;
      other: number;
    };
    recentMovements?: any[];
  }

  const reportData: InventoryReportData = {
    summary: {
      totalMedications,
      totalStock,
      totalValue,
      lowStockCount: lowStockItems.length,
    },
    stockByCategory: Object.values(stockByCategory),
    expiryBreakdown,
    lowStockItems,
  };

  // Add report-specific data
  if (reportType === 'movement') {
    // Analyze inventory movements
    const movementAnalysis = {
      purchases: movements.filter((m) => m.type === MovementType.PURCHASE)
        .length,
      sales: movements.filter((m) => m.type === MovementType.SALE).length,
      transfers: movements.filter((m) => m.type === MovementType.TRANSFER)
        .length,
      adjustments: movements.filter((m) => m.type === MovementType.ADJUSTMENT)
        .length,
      returns: movements.filter((m) => m.type === MovementType.RETURN).length,
      other: movements.filter(
        (m) =>
          ![
            MovementType.PURCHASE,
            MovementType.SALE,
            MovementType.TRANSFER,
            MovementType.ADJUSTMENT,
            MovementType.RETURN,
          ].includes(m.type as MovementType)
      ).length,
    };

    reportData.movementAnalysis = movementAnalysis;
    reportData.recentMovements = movements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }

  // Return data in requested format
  if (format === ReportFormat.JSON) {
    return reportData;
  } else if (format === ReportFormat.PDF) {
    return generatePDF(reportData, 'Inventory Comprehensive Report');
  } else if (format === ReportFormat.EXCEL) {
    return generateExcel(reportData, 'Inventory Report');
  } else if (format === ReportFormat.CSV) {
    return generateCSV(reportData);
  }

  return reportData;
};

/**
 * Generate comprehensive sales report
 */
export const generateSalesComprehensiveReport = async (
  startDate?: Date,
  endDate?: Date,
  location?: string,
  groupBy: string = 'day',
  format: ReportFormat = ReportFormat.JSON
) => {
  // Build filters
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.saleDate = { $gte: startDate };
  }
  if (endDate) {
    dateFilter.saleDate = { ...dateFilter.saleDate, $lte: endDate };
  }

  const locationFilter: any = {};
  if (location && location !== 'all') {
    locationFilter.location = location;
  }

  // Get sales data
  const sales = await Sale.find({
    ...dateFilter,
    ...locationFilter,
    status: SaleStatus.COMPLETED,
  })
    .populate('customer')
    .populate('items.product')
    .lean();

  // Get POS transactions
  const posTransactions = await PosTransaction.find({
    ...dateFilter,
    ...locationFilter,
    transactionType: PosTransactionType.SALE,
  })
    .populate('customer')
    .populate('items.product')
    .lean();

  // Calculate sales summary
  const totalSales =
    sales.reduce((sum, sale) => sum + sale.total, 0) +
    posTransactions.reduce((sum, transaction) => sum + transaction.total, 0);

  const transactionCount = sales.length + posTransactions.length;

  const averageSale = transactionCount > 0 ? totalSales / transactionCount : 0;

  // Calculate return rate
  const returns = await PosTransaction.countDocuments({
    ...dateFilter,
    ...locationFilter,
    transactionType: PosTransactionType.RETURN,
  });

  const returnRate =
    transactionCount > 0 ? (returns / transactionCount) * 100 : 0;

  // Group sales by period
  const salesByPeriod = [];
  const allTransactions = [...sales, ...posTransactions];

  interface SalesByPeriod {
    period: string;
    sales: number;
    count: number;
  }

  if (groupBy === 'day') {
    const dailySales: Record<string, SalesByPeriod> = {};
    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.saleDate || transaction.createdAt);
      const day = date.toISOString().split('T')[0];
      if (!dailySales[day]) {
        dailySales[day] = { period: day, sales: 0, count: 0 };
      }
      dailySales[day].sales += transaction.total;
      dailySales[day].count++;
    });

    salesByPeriod.push(...Object.values(dailySales));
  } else if (groupBy === 'month') {
    const monthlySales: Record<string, SalesByPeriod> = {};
    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.saleDate || transaction.createdAt);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;
      if (!monthlySales[month]) {
        monthlySales[month] = { period: month, sales: 0, count: 0 };
      }
      monthlySales[month].sales += transaction.total;
      monthlySales[month].count++;
    });

    salesByPeriod.push(...Object.values(monthlySales));
  }

  // Get top products
  interface ProductSale {
    productId: string;
    productName: string;
    quantity: number;
    totalSales: number;
  }

  interface CategorySale {
    category: string;
    value: number;
  }

  const productSales: Record<string, ProductSale> = {};
  allTransactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      const product = item.product as any;
      const productId = product._id.toString();
      const productName = product.name;
      if (!productSales[productId]) {
        productSales[productId] = {
          productId,
          productName,
          quantity: 0,
          totalSales: 0,
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].totalSales += item.subtotal;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 10);

  // Get sales by category
  const salesByCategory: Record<string, CategorySale> = {};
  allTransactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      const product = item.product as any;
      const category = product.category || 'Uncategorized';
      if (!salesByCategory[category]) {
        salesByCategory[category] = { category, value: 0 };
      }
      salesByCategory[category].value += item.subtotal;
    });
  });

  // Compile the report data
  const reportData = {
    summary: {
      totalSales,
      transactionCount,
      averageSale,
      returnRate,
    },
    salesByPeriod: salesByPeriod.sort((a: SalesByPeriod, b: SalesByPeriod) =>
      a.period.localeCompare(b.period)
    ),
    topProducts,
    salesByCategory: Object.values(salesByCategory),
  };

  // Return data in requested format
  if (format === ReportFormat.JSON) {
    return reportData;
  } else if (format === ReportFormat.PDF) {
    return generatePDF(reportData, 'Sales Comprehensive Report');
  } else if (format === ReportFormat.EXCEL) {
    return generateExcel(reportData, 'Sales Report');
  } else if (format === ReportFormat.CSV) {
    return generateCSV(reportData);
  }

  return reportData;
};

/**
 * Generate comprehensive financial report
 */
export const generateFinancialComprehensiveReport = async (
  startDate?: Date,
  endDate?: Date,
  reportType: string = 'summary',
  period: string = 'monthly',
  format: ReportFormat = ReportFormat.JSON
) => {
  // This is a placeholder for the financial report
  // In a real implementation, this would connect to the accounting module
  // and generate actual financial data

  // Mock data for demonstration
  const reportData = {
    summary: {
      totalRevenue: 12500000,
      totalExpenses: 7800000,
      grossProfit: 4700000,
      netProfit: 3200000,
      profitMargin: 25.6,
    },
    revenueByCategory: [
      { category: 'Prescription Sales', value: 5200000 },
      { category: 'OTC Sales', value: 3800000 },
      { category: 'Services', value: 2100000 },
      { category: 'Other', value: 1400000 },
    ],
    expensesByCategory: [
      { category: 'Inventory Purchases', value: 4500000 },
      { category: 'Salaries', value: 1800000 },
      { category: 'Rent', value: 800000 },
      { category: 'Utilities', value: 400000 },
      { category: 'Other', value: 300000 },
    ],
    monthlyPerformance: [
      { month: 'Jan', revenue: 980000, expenses: 620000, profit: 360000 },
      { month: 'Feb', revenue: 1050000, expenses: 640000, profit: 410000 },
      { month: 'Mar', revenue: 1120000, expenses: 680000, profit: 440000 },
      { month: 'Apr', revenue: 950000, expenses: 610000, profit: 340000 },
      { month: 'May', revenue: 1080000, expenses: 650000, profit: 430000 },
      { month: 'Jun', revenue: 1150000, expenses: 690000, profit: 460000 },
    ],
    accountsReceivable: {
      current: 1200000,
      overdue30: 450000,
      overdue60: 280000,
      overdue90: 150000,
    },
  };

  // Return data in requested format
  if (format === ReportFormat.JSON) {
    return reportData;
  } else if (format === ReportFormat.PDF) {
    return generatePDF(reportData, 'Financial Comprehensive Report');
  } else if (format === ReportFormat.EXCEL) {
    return generateExcel(reportData, 'Financial Report');
  } else if (format === ReportFormat.CSV) {
    return generateCSV(reportData);
  }

  return reportData;
};

/**
 * Generate comprehensive administrative report
 */
export const generateAdministrativeComprehensiveReport = async (
  startDate?: Date,
  endDate?: Date,
  reportType: string = 'activity',
  userRole?: string,
  format: ReportFormat = ReportFormat.JSON
) => {
  // Build filters
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.createdAt = { $gte: startDate };
  }
  if (endDate) {
    dateFilter.createdAt = { ...dateFilter.createdAt, $lte: endDate };
  }

  const roleFilter: any = {};
  if (userRole && userRole !== 'all') {
    roleFilter.role = userRole;
  }

  // Get user data
  const users = await User.find(roleFilter).lean();

  // Get activity logs
  const activityLogs = await ActivityLog.find({
    ...dateFilter,
    ...(userRole && userRole !== 'all' ? { 'user.role': userRole } : {}),
  })
    .populate('user')
    .sort({ createdAt: -1 })
    .lean();

  // Calculate user statistics
  const userRoles: Record<string, number> = {};
  users.forEach((user) => {
    const role = user.role as string;
    userRoles[role] = (userRoles[role] || 0) + 1;
  });

  const userRoleData = Object.entries(userRoles).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate activity statistics
  const activityByType: Record<string, number> = {};
  activityLogs.forEach((log) => {
    // Type assertion for activity log
    const logData = log as any;
    const actionType = logData.type ? logData.type.split(':')[0] : 'unknown'; // e.g., "create:patient" -> "create"
    activityByType[actionType] = (activityByType[actionType] || 0) + 1;
  });

  const activityTypeData = Object.entries(activityByType).map(
    ([name, value]) => ({ name, value })
  );

  interface DailyActivity {
    day: string;
    logins: number;
    actions: number;
  }

  // Calculate daily activity
  const dailyActivity: Record<string, DailyActivity> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const day = date.toISOString().split('T')[0];
    dailyActivity[day] = { day, logins: 0, actions: 0 };
  }

  activityLogs.forEach((log) => {
    const day = new Date(log.createdAt).toISOString().split('T')[0];
    if (dailyActivity[day]) {
      // Type assertion for activity log
      const logData = log as any;
      if (logData.type === 'login') {
        dailyActivity[day].logins++;
      }
      dailyActivity[day].actions++;
    }
  });

  interface UserActivity {
    userId: string;
    userName: string;
    role: string;
    logins: number;
    actions: number;
    lastActive: Date;
  }

  // Get top active users
  const userActivity: Record<string, UserActivity> = {};
  activityLogs.forEach((log) => {
    // Type assertion for populated user field
    const user = log.user as any;
    const userId = user._id.toString();
    if (!userActivity[userId]) {
      userActivity[userId] = {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        logins: 0,
        actions: 0,
        lastActive: log.createdAt,
      };
    }
    // Type assertion for activity log
    const logData = log as any;
    if (logData.type === 'login') {
      userActivity[userId].logins++;
    }
    userActivity[userId].actions++;
    if (new Date(log.createdAt) > new Date(userActivity[userId].lastActive)) {
      userActivity[userId].lastActive = log.createdAt;
    }
  });

  const topActiveUsers = Object.values(userActivity)
    .sort((a: UserActivity, b: UserActivity) => b.actions - a.actions)
    .slice(0, 10);

  // Compile the report data
  const reportData = {
    summary: {
      totalUsers: users.length,
      totalActivities: activityLogs.length,
      activeUsers: Object.keys(userActivity).length,
      userRoles: userRoleData,
    },
    userActivityData: Object.values(dailyActivity),
    activityTypeData,
    topActiveUsers,
    recentActivities: activityLogs.slice(0, 20),
  };

  // Return data in requested format
  if (format === ReportFormat.JSON) {
    return reportData;
  } else if (format === ReportFormat.PDF) {
    return generatePDF(reportData, 'Administrative Comprehensive Report');
  } else if (format === ReportFormat.EXCEL) {
    return generateExcel(reportData, 'Administrative Report');
  } else if (format === ReportFormat.CSV) {
    return generateCSV(reportData);
  }

  return reportData;
};
