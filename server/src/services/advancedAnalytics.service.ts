import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import PosTransaction from '../models/posTransaction.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import InsuranceClaim from '../models/insuranceClaim.model';
import Prescription from '../models/prescription.model';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import { ClaimStatus } from '../interfaces/insurance.interface';
import logger from '../utils/logger';

/**
 * Get sales trend analytics
 */
export const getSalesTrendAnalytics = async ({
  startDate,
  endDate,
  period = 'daily',
  compareWithPrevious = false,
  location,
}) => {
  try {
    // Build query
    const query: any = {
      transactionType: PosTransactionType.SALE,
    };

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.saleDate = { $gte: defaultStartDate };
    }

    if (location) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    // Build date grouping based on period
    let dateFormat;

    switch (period) {
      case 'hourly':
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
          hour: { $hour: '$saleDate' },
        };
        break;
      case 'daily':
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
        };
        break;
      case 'weekly':
        dateFormat = {
          year: { $year: '$saleDate' },
          week: { $week: '$saleDate' },
        };
        break;
      case 'monthly':
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
        };
        break;
      case 'quarterly':
        dateFormat = {
          year: { $year: '$saleDate' },
          quarter: { $ceil: { $divide: [{ $month: '$saleDate' }, 3] } },
        };
        break;
      case 'yearly':
        dateFormat = {
          year: { $year: '$saleDate' },
        };
        break;
      default:
        dateFormat = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
        };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$total' },
          subtotal: { $sum: '$subtotal' },
          discount: { $sum: '$discount' },
          tax: { $sum: '$tax' },
          count: { $sum: 1 },
          averageSale: { $avg: '$total' },
          itemsSold: { $sum: { $size: '$items' } },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 },
      },
    ];

    // Execute aggregation
    const salesByPeriod = await PosTransaction.aggregate(pipeline);

    // Format results for chart display
    const formattedSales = salesByPeriod.map(item => {
      let label;

      switch (period) {
        case 'hourly':
          label = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')} ${item._id.hour.toString().padStart(2, '0')}:00`;
          break;
        case 'daily':
          label = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
          break;
        case 'weekly':
          label = `${item._id.year} W${item._id.week}`;
          break;
        case 'monthly':
          label = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
          break;
        case 'quarterly':
          label = `${item._id.year} Q${item._id.quarter}`;
          break;
        case 'yearly':
          label = `${item._id.year}`;
          break;
        default:
          label = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
      }

      return {
        label,
        totalSales: item.totalSales,
        subtotal: item.subtotal,
        discount: item.discount,
        tax: item.tax,
        count: item.count,
        averageSale: item.averageSale,
        itemsSold: item.itemsSold,
      };
    });

    // Get comparison data if requested
    let comparisonData = null;

    if (compareWithPrevious && startDate && endDate) {
      // Calculate previous period
      const currentStartDate = new Date(startDate);
      const currentEndDate = new Date(endDate);
      const daysDifference = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));

      const previousStartDate = new Date(currentStartDate);
      previousStartDate.setDate(previousStartDate.getDate() - daysDifference);

      const previousEndDate = new Date(currentStartDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);

      // Build query for previous period
      const previousQuery = {
        ...query,
        saleDate: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
      };

      // Execute aggregation for previous period
      const previousPipeline = [
        { $match: previousQuery },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
            subtotal: { $sum: '$subtotal' },
            discount: { $sum: '$discount' },
            tax: { $sum: '$tax' },
            count: { $sum: 1 },
            averageSale: { $avg: '$total' },
            itemsSold: { $sum: { $size: '$items' } },
          },
        },
      ];

      const previousResults = await PosTransaction.aggregate(previousPipeline);

      if (previousResults.length > 0) {
        const current = {
          totalSales: formattedSales.reduce((sum, item) => sum + item.totalSales, 0),
          subtotal: formattedSales.reduce((sum, item) => sum + item.subtotal, 0),
          discount: formattedSales.reduce((sum, item) => sum + item.discount, 0),
          tax: formattedSales.reduce((sum, item) => sum + item.tax, 0),
          count: formattedSales.reduce((sum, item) => sum + item.count, 0),
          itemsSold: formattedSales.reduce((sum, item) => sum + item.itemsSold, 0),
        };

        const previous = previousResults[0];

        comparisonData = {
          current,
          previous: {
            totalSales: previous.totalSales,
            subtotal: previous.subtotal,
            discount: previous.discount,
            tax: previous.tax,
            count: previous.count,
            averageSale: previous.averageSale,
            itemsSold: previous.itemsSold,
          },
          percentageChange: {
            totalSales: calculatePercentageChange(previous.totalSales, current.totalSales),
            subtotal: calculatePercentageChange(previous.subtotal, current.subtotal),
            discount: calculatePercentageChange(previous.discount, current.discount),
            tax: calculatePercentageChange(previous.tax, current.tax),
            count: calculatePercentageChange(previous.count, current.count),
            averageSale: calculatePercentageChange(previous.averageSale, current.totalSales / current.count),
            itemsSold: calculatePercentageChange(previous.itemsSold, current.itemsSold),
          },
          period: {
            current: {
              startDate: new Date(startDate),
              endDate: new Date(endDate),
            },
            previous: {
              startDate: previousStartDate,
              endDate: previousEndDate,
            },
          },
        };
      }
    }

    // Get total sales for the period
    const totalSales = formattedSales.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCount = formattedSales.reduce((sum, item) => sum + item.count, 0);
    const averageSale = totalCount > 0 ? totalSales / totalCount : 0;

    return {
      salesByPeriod: formattedSales,
      comparison: comparisonData,
      summary: {
        totalSales,
        totalCount,
        averageSale,
        period,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error('Error in getSalesTrendAnalytics:', error);
    throw error;
  }
};

/**
 * Get product performance analytics
 */
export const getProductPerformanceAnalytics = async ({
  startDate,
  endDate,
  topProducts = 10,
  category,
  location,
}) => {
  try {
    // Build query
    const query: any = {
      transactionType: PosTransactionType.SALE,
    };

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.saleDate = { $gte: defaultStartDate };
    }

    if (location) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    if (category) {
      // Join with products to filter by category
      pipeline.push({
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      });

      pipeline.push({
        $match: {
          'productDetails.category': new mongoose.Types.ObjectId(category),
        },
      });
    }

    // Execute aggregation
    const productPerformance = await PosTransaction.aggregate(pipeline);

    // Get sales by category
    const categoryPipeline: any[] = [
      { $match: query },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ['$productDetails', 0] },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$categoryDetails', 0] },
        },
      },
      {
        $group: {
          _id: '$product.category',
          categoryName: { $first: '$category.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.subtotal' },
          productCount: { $addToSet: '$items.product' },
        },
      },
      {
        $addFields: {
          productCount: { $size: '$productCount' },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const salesByCategory = await PosTransaction.aggregate(categoryPipeline);

    return {
      topProducts: productPerformance,
      salesByCategory,
      summary: {
        totalProductsSold: productPerformance.reduce((sum, item) => sum + item.totalQuantity, 0),
        totalSales: productPerformance.reduce((sum, item) => sum + item.totalSales, 0),
        averageProfitMargin: productPerformance.length > 0
          ? productPerformance.reduce((sum, item) => sum + item.profitMargin, 0) / productPerformance.length
          : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error('Error in getProductPerformanceAnalytics:', error);
    throw error;
  }
};

/**
 * Get customer analytics
 */
export const getCustomerAnalytics = async ({
  startDate,
  endDate,
  topCustomers = 10,
  segmentBy = 'sales',
  location,
}) => {
  try {
    // Build query
    const query: any = {
      transactionType: PosTransactionType.SALE,
    };

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.saleDate = { $gte: defaultStartDate };
    }

    if (location) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    // Exclude transactions without customer
    query.customer = { $ne: null };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$total' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$total' },
          firstPurchase: { $min: '$saleDate' },
          lastPurchase: { $max: '$saleDate' },
          itemsPurchased: { $sum: { $size: '$items' } },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $addFields: {
          customer: { $arrayElemAt: ['$customerDetails', 0] },
        },
      },
      {
        $project: {
          _id: 1,
          customerName: {
            $concat: [
              '$customer.firstName',
              ' ',
              '$customer.lastName',
            ],
          },
          customerNumber: '$customer.customerNumber',
          email: '$customer.email',
          phone: '$customer.phone',
          totalSpent: 1,
          transactionCount: 1,
          averageTransaction: 1,
          firstPurchase: 1,
          lastPurchase: 1,
          itemsPurchased: 1,
          daysSinceLastPurchase: {
            $dateDiff: {
              startDate: '$lastPurchase',
              endDate: new Date(),
              unit: 'day',
            },
          },
          purchaseFrequency: {
            $cond: [
              { $eq: ['$transactionCount', 1] },
              null,
              {
                $divide: [
                  {
                    $dateDiff: {
                      startDate: '$firstPurchase',
                      endDate: '$lastPurchase',
                      unit: 'day',
                    },
                  },
                  { $subtract: ['$transactionCount', 1] },
                ],
              },
            ],
          },
        },
      },
    ];

    // Sort based on segment
    if (segmentBy === 'sales') {
      pipeline.push({ $sort: { totalSpent: -1 } });
    } else if (segmentBy === 'frequency') {
      pipeline.push({ $sort: { transactionCount: -1 } });
    } else if (segmentBy === 'recency') {
      pipeline.push({ $sort: { daysSinceLastPurchase: 1 } });
    }

    // Limit to top customers
    if (topCustomers > 0) {
      pipeline.push({ $limit: topCustomers });
    }

    // Execute aggregation
    const customerAnalytics = await PosTransaction.aggregate(pipeline);

    // Get customer segments (RFM analysis)
    const rfmPipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: '$customer',
          recency: { $max: '$saleDate' },
          frequency: { $sum: 1 },
          monetary: { $sum: '$total' },
        },
      },
      {
        $addFields: {
          recencyScore: {
            $cond: [
              {
                $lte: [
                  {
                    $dateDiff: {
                      startDate: '$recency',
                      endDate: new Date(),
                      unit: 'day',
                    },
                  },
                  30,
                ],
              },
              3,
              {
                $cond: [
                  {
                    $lte: [
                      {
                        $dateDiff: {
                          startDate: '$recency',
                          endDate: new Date(),
                          unit: 'day',
                        },
                      },
                      90,
                    ],
                  },
                  2,
                  1,
                ],
              },
            ],
          },
          frequencyScore: {
            $cond: [
              { $gte: ['$frequency', 5] },
              3,
              {
                $cond: [
                  { $gte: ['$frequency', 2] },
                  2,
                  1,
                ],
              },
            ],
          },
          monetaryScore: {
            $cond: [
              { $gte: ['$monetary', 500] },
              3,
              {
                $cond: [
                  { $gte: ['$monetary', 100] },
                  2,
                  1,
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          rfmScore: {
            $add: [
              '$recencyScore',
              '$frequencyScore',
              '$monetaryScore',
            ],
          },
        },
      },
      {
        $addFields: {
          segment: {
            $switch: {
              branches: [
                { case: { $gte: ['$rfmScore', 8] }, then: 'Champions' },
                { case: { $gte: ['$rfmScore', 6] }, then: 'Loyal Customers' },
                { case: { $gte: ['$rfmScore', 5] }, then: 'Potential Loyalists' },
                { case: { $eq: ['$recencyScore', 3] }, then: 'New Customers' },
                { case: { $eq: ['$recencyScore', 1] }, then: 'At Risk' },
                { case: { $lte: ['$rfmScore', 3] }, then: 'Needs Attention' },
              ],
              default: 'Others',
            },
          },
        },
      },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          totalSpent: { $sum: '$monetary' },
          averageFrequency: { $avg: '$frequency' },
        },
      },
      { $sort: { count: -1 } },
    ];

    const customerSegments = await PosTransaction.aggregate(rfmPipeline);

    // Get new customers over time
    const newCustomersPipeline: any[] = [
      {
        $match: {
          createdAt: query.saleDate,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ];

    const newCustomersByDay = await Customer.aggregate(newCustomersPipeline);

    // Format results for chart display
    const formattedNewCustomers = newCustomersByDay.map(item => ({
      label: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      count: item.count,
    }));

    return {
      topCustomers: customerAnalytics,
      customerSegments,
      newCustomersByDay: formattedNewCustomers,
      summary: {
        totalCustomers: customerAnalytics.length,
        totalSpent: customerAnalytics.reduce((sum, item) => sum + item.totalSpent, 0),
        averageSpent: customerAnalytics.length > 0
          ? customerAnalytics.reduce((sum, item) => sum + item.totalSpent, 0) / customerAnalytics.length
          : 0,
        averageTransactionCount: customerAnalytics.length > 0
          ? customerAnalytics.reduce((sum, item) => sum + item.transactionCount, 0) / customerAnalytics.length
          : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error('Error in getCustomerAnalytics:', error);
    throw error;
  }
};

/**
 * Get insurance analytics
 */
export const getInsuranceAnalytics = async ({
  startDate,
  endDate,
  provider,
  location,
}) => {
  try {
    // Build query
    const query: any = {};

    if (startDate && endDate) {
      query.claimDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.claimDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.claimDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.claimDate = { $gte: defaultStartDate };
    }

    if (provider) {
      query.provider = new mongoose.Types.ObjectId(provider);
    }

    if (location) {
      // Join with transactions to filter by location
      const transactionIds = await PosTransaction.find({
        location: new mongoose.Types.ObjectId(location),
      }).distinct('_id');

      query.transaction = { $in: transactionIds };
    }

    // Build aggregation pipeline for claims by status
    const statusPipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: '$claimStatus',
          count: { $sum: 1 },
          totalClaimAmount: { $sum: '$totalClaimAmount' },
          totalApprovedAmount: { $sum: '$totalApprovedAmount' },
        },
      },
      { $sort: { count: -1 } },
    ];

    const claimsByStatus = await InsuranceClaim.aggregate(statusPipeline);

    // Build aggregation pipeline for claims by provider
    const providerPipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
          totalClaimAmount: { $sum: '$totalClaimAmount' },
          totalApprovedAmount: { $sum: '$totalApprovedAmount' },
          approvalRate: {
            $avg: {
              $cond: [
                { $eq: ['$claimStatus', ClaimStatus.APPROVED] },
                1,
                {
                  $cond: [
                    { $eq: ['$claimStatus', ClaimStatus.PARTIALLY_APPROVED] },
                    0.5,
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'insuranceproviders',
          localField: '_id',
          foreignField: '_id',
          as: 'providerDetails',
        },
      },
      {
        $addFields: {
          providerName: { $arrayElemAt: ['$providerDetails.name', 0] },
        },
      },
      { $sort: { totalClaimAmount: -1 } },
    ];

    const claimsByProvider = await InsuranceClaim.aggregate(providerPipeline);

    // Build aggregation pipeline for claims over time
    const timePipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$claimDate' },
            month: { $month: '$claimDate' },
            day: { $dayOfMonth: '$claimDate' },
          },
          count: { $sum: 1 },
          totalClaimAmount: { $sum: '$totalClaimAmount' },
          totalApprovedAmount: { $sum: '$totalApprovedAmount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ];

    const claimsByDay = await InsuranceClaim.aggregate(timePipeline);

    // Format results for chart display
    const formattedClaimsByDay = claimsByDay.map(item => ({
      label: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      count: item.count,
      totalClaimAmount: item.totalClaimAmount,
      totalApprovedAmount: item.totalApprovedAmount,
    }));

    // Calculate summary statistics
    const totalClaims = claimsByStatus.reduce((sum, item) => sum + item.count, 0);
    const totalClaimAmount = claimsByStatus.reduce((sum, item) => sum + item.totalClaimAmount, 0);
    const totalApprovedAmount = claimsByStatus.reduce((sum, item) => sum + item.totalApprovedAmount, 0);

    const approvedClaims = claimsByStatus.find(item => item._id === ClaimStatus.APPROVED);
    const partiallyApprovedClaims = claimsByStatus.find(item => item._id === ClaimStatus.PARTIALLY_APPROVED);
    const rejectedClaims = claimsByStatus.find(item => item._id === ClaimStatus.REJECTED);

    const approvalRate = totalClaims > 0
      ? ((approvedClaims?.count || 0) + (partiallyApprovedClaims?.count || 0) * 0.5) / totalClaims
      : 0;

    return {
      claimsByStatus,
      claimsByProvider,
      claimsByDay: formattedClaimsByDay,
      summary: {
        totalClaims,
        totalClaimAmount,
        totalApprovedAmount,
        approvalRate,
        rejectionRate: totalClaims > 0 ? (rejectedClaims?.count || 0) / totalClaims : 0,
        averageClaimAmount: totalClaims > 0 ? totalClaimAmount / totalClaims : 0,
        reimbursementRate: totalClaimAmount > 0 ? totalApprovedAmount / totalClaimAmount : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error('Error in getInsuranceAnalytics:', error);
    throw error;
  }
};

/**
 * Get prescription analytics
 */
export const getPrescriptionAnalytics = async ({
  startDate,
  endDate,
  doctor,
  location,
}) => {
  try {
    // Build query
    const query: any = {};

    if (startDate && endDate) {
      query.issueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.issueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.issueDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.issueDate = { $gte: defaultStartDate };
    }

    if (doctor) {
      query.doctor = new mongoose.Types.ObjectId(doctor);
    }

    // Build aggregation pipeline for prescriptions by status
    const statusPipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];

    const prescriptionsByStatus = await Prescription.aggregate(statusPipeline);

    // Build aggregation pipeline for prescriptions by doctor
    const doctorPipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorDetails',
        },
      },
      {
        $addFields: {
          doctorName: {
            $concat: [
              { $arrayElemAt: ['$doctorDetails.firstName', 0] },
              ' ',
              { $arrayElemAt: ['$doctorDetails.lastName', 0] },
            ],
          },
          specialization: { $arrayElemAt: ['$doctorDetails.specialization', 0] },
        },
      },
      { $sort: { count: -1 } },
    ];

    const prescriptionsByDoctor = await Prescription.aggregate(doctorPipeline);

    // Build aggregation pipeline for prescriptions over time
    const timePipeline: any[] = [
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' },
            day: { $dayOfMonth: '$issueDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ];

    const prescriptionsByDay = await Prescription.aggregate(timePipeline);

    // Format results for chart display
    const formattedPrescriptionsByDay = prescriptionsByDay.map(item => ({
      label: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      count: item.count,
    }));

    // Build aggregation pipeline for most prescribed medications
    const medicationPipeline: any[] = [
      { $match: query },
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.product',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $addFields: {
          productName: { $arrayElemAt: ['$productDetails.name', 0] },
          productSku: { $arrayElemAt: ['$productDetails.sku', 0] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ];

    const topMedications = await Prescription.aggregate(medicationPipeline);

    // Calculate summary statistics
    const totalPrescriptions = prescriptionsByStatus.reduce((sum, item) => sum + item.count, 0);

    return {
      prescriptionsByStatus,
      prescriptionsByDoctor,
      prescriptionsByDay: formattedPrescriptionsByDay,
      topMedications,
      summary: {
        totalPrescriptions,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error('Error in getPrescriptionAnalytics:', error);
    throw error;
  }
};

/**
 * Helper function to calculate percentage change
 */
const calculatePercentageChange = (previous: number, current: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.saleDate = { $gte: defaultStartDate };
    }

    if (location) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      { $unwind: '$items' },
    ];

    // Add category filter if provided
    if (category) {
      pipeline.push({
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      });

      pipeline.push({
        $match: {
          'productDetails.category': new mongoose.Types.ObjectId(category),
        },
      });
    }

    // Group by product
    pipeline.push({
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalSales: { $sum: '$items.subtotal' },
        averagePrice: { $avg: '$items.unitPrice' },
        transactionCount: { $sum: 1 },
        returnCount: {
          $sum: {
            $cond: [
              { $eq: ['$transactionType', PosTransactionType.RETURN] },
              1,
              0,
            ],
          },
        },
      },
    });

    // Lookup product details
    pipeline.push({
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    });

    pipeline.push({
      $addFields: {
        product: { $arrayElemAt: ['$product', 0] },
      },
    });

    // Lookup category details
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category',
      },
    });

    pipeline.push({
      $addFields: {
        category: { $arrayElemAt: ['$category', 0] },
      },
    });

    // Project final fields
    pipeline.push({
      $project: {
        _id: 1,
        productName: '$product.name',
        productSku: '$product.sku',
        categoryName: '$category.name',
        totalQuantity: 1,
        totalSales: 1,
        averagePrice: 1,
        transactionCount: 1,
        returnCount: 1,
        returnRate: {
          $cond: [
            { $eq: ['$transactionCount', 0] },
            0,
            { $divide: ['$returnCount', '$transactionCount'] },
          ],
        },
        profitMargin: {
          $multiply: [
            {
              $divide: [
                { $subtract: ['$averagePrice', '$product.costPrice'] },
                '$averagePrice',
              ],
            },
            100,
          ],
        },
      },
    });

    // Sort by total sales descending
    pipeline.push({ $sort: { totalSales: -1 } });

    // Limit to top products
    if (topProducts > 0) {
      pipeline.push({ $limit: topProducts });
    }

    // Execute aggregation
    const productPerformance = await PosTransaction.aggregate(pipeline);

    // Get sales by category
    const categoryPipeline: any[] = [
      { $match: query },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ['$productDetails', 0] },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$categoryDetails', 0] },
        },
      },
      {
        $group: {
          _id: '$product.category',
          categoryName: { $first: '$category.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.subtotal' },
          productCount: { $addToSet: '$items.product' },
        },
      },
      {
        $addFields: {
          productCount: { $size: '$productCount' },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const salesByCategory = await PosTransaction.aggregate(categoryPipeline);

    return {
      topProducts: productPerformance,
      salesByCategory,
      summary: {
        totalProductsSold: productPerformance.reduce((sum, item) => sum + item.totalQuantity, 0),
        totalSales: productPerformance.reduce((sum, item) => sum + item.totalSales, 0),
        averageProfitMargin: productPerformance.length > 0
          ? productPerformance.reduce((sum, item) => sum + item.profitMargin, 0) / productPerformance.length
          : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  } catch (error) {
    logger.error('Error in getPrescriptionAnalytics:', error);
    throw error;
  }
};

/**
 * Helper function to calculate percentage change
 */
const calculatePercentageChange = (previous: number, current: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};