import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/error';
import * as posReportService from '../services/posReport.service';
import PosTransaction from '../models/posTransaction.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import mongoose from 'mongoose';

/**
 * Get dashboard analytics
 * @route GET /api/pos/analytics/dashboard
 * @access Private
 */
export const getDashboardAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    // Get date range
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    const startOfThisWeek = new Date();
    startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    // Get today's sales
    const todaySales = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfToday },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get yesterday's sales
    const yesterdaySales = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get this week's sales
    const thisWeekSales = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfThisWeek },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get this month's sales
    const thisMonthSales = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfThisMonth },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get last month's sales
    const lastMonthSales = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth,
          },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get sales by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const salesByDay = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: { $gte: thirtyDaysAgo },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' },
          },
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    // Format sales by day for chart
    const formattedSalesByDay = salesByDay.map(day => ({
      date: `${day._id.year}-${day._id.month.toString().padStart(2, '0')}-${day._id.day.toString().padStart(2, '0')}`,
      total: day.total,
      count: day.count,
    }));

    // Get top selling products
    const topProducts = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: { $gte: thirtyDaysAgo },
          transactionType: PosTransactionType.SALE,
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.subtotal' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $addFields: {
          productName: { $arrayElemAt: ['$product.name', 0] },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]);

    // Get low stock products
    const lowStockProducts = await Product.find({
      totalStock: { $lt: 10 },
    })
      .sort({ totalStock: 1 })
      .limit(5);

    // Get expiring products
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const expiringProducts = await Product.aggregate([
      {
        $addFields: {
          expiringInventory: {
            $filter: {
              input: '$inventory',
              as: 'item',
              cond: {
                $and: [
                  { $gt: ['$$item.quantity', 0] },
                  { $lt: ['$$item.expiryDate', expiryDate] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          expiringInventory: { $ne: [] },
        },
      },
      { $sort: { 'expiringInventory.expiryDate': 1 } },
      { $limit: 5 },
    ]);

    // Get recent transactions
    const recentTransactions = await PosTransaction.find()
      .sort({ saleDate: -1 })
      .limit(5)
      .populate('customer', 'firstName lastName')
      .populate('cashier', 'firstName lastName');

    // Get customer stats
    const totalCustomers = await Customer.countDocuments();

    const newCustomersToday = await Customer.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const activeCustomers = await PosTransaction.aggregate([
      {
        $match: {
          saleDate: { $gte: thirtyDaysAgo },
          transactionType: PosTransactionType.SALE,
        },
      },
      {
        $group: {
          _id: '$customer',
          count: { $sum: 1 },
        },
      },
      {
        $count: 'activeCustomers',
      },
    ]);

    // Compile all analytics
    const analytics = {
      sales: {
        today: todaySales.length > 0 ? todaySales[0] : { total: 0, count: 0 },
        yesterday: yesterdaySales.length > 0 ? yesterdaySales[0] : { total: 0, count: 0 },
        thisWeek: thisWeekSales.length > 0 ? thisWeekSales[0] : { total: 0, count: 0 },
        thisMonth: thisMonthSales.length > 0 ? thisMonthSales[0] : { total: 0, count: 0 },
        lastMonth: lastMonthSales.length > 0 ? lastMonthSales[0] : { total: 0, count: 0 },
        byDay: formattedSalesByDay,
      },
      products: {
        topSelling: topProducts,
        lowStock: lowStockProducts,
        expiringSoon: expiringProducts,
      },
      customers: {
        total: totalCustomers,
        newToday: newCustomersToday,
        active: activeCustomers.length > 0 ? activeCustomers[0].activeCustomers : 0,
      },
      recentTransactions,
    };

    res.status(200).json({
      status: 'success',
      data: analytics,
    });
  }
);

/**
 * Get sales analytics
 * @route GET /api/pos/analytics/sales
 * @access Private
 */
export const getSalesAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, period = 'daily', location } = req.query;

    // Build date range
    const query: any = {
      transactionType: PosTransactionType.SALE,
    };

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate as string) };
    } else {
      // Default to last 30 days if no date range provided
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      query.saleDate = { $gte: defaultStartDate };
    }

    if (location) {
      query.location = new mongoose.Types.ObjectId(location as string);
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
          count: { $sum: 1 },
          averageSale: { $avg: '$total' },
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
          label = `${item._id.year}-${item._id.month}-${item._id.day} ${item._id.hour}:00`;
          break;
        case 'daily':
          label = `${item._id.year}-${item._id.month}-${item._id.day}`;
          break;
        case 'weekly':
          label = `${item._id.year} W${item._id.week}`;
          break;
        case 'monthly':
          label = `${item._id.year}-${item._id.month}`;
          break;
        case 'yearly':
          label = `${item._id.year}`;
          break;
        default:
          label = `${item._id.year}-${item._id.month}-${item._id.day}`;
      }

      return {
        label,
        totalSales: item.totalSales,
        count: item.count,
        averageSale: item.averageSale,
      };
    });

    // Get sales by payment method
    const paymentMethodPipeline = [
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          totalSales: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 as const } },
    ];

    const salesByPaymentMethod = await PosTransaction.aggregate(paymentMethodPipeline);

    // Get sales by product category
    const categoryPipeline = [
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
          category: { $arrayElemAt: ['$productDetails.category', 0] },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryDetails.name', 0] },
        },
      },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryName' },
          totalSales: { $sum: '$items.subtotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 as const } },
    ];

    const salesByCategory = await PosTransaction.aggregate(categoryPipeline);

    // Get total sales for the period
    const totalSales = formattedSales.reduce((sum, item) => sum + item.totalSales, 0);
    const totalCount = formattedSales.reduce((sum, item) => sum + item.count, 0);
    const averageSale = totalCount > 0 ? totalSales / totalCount : 0;

    res.status(200).json({
      status: 'success',
      data: {
        salesByPeriod: formattedSales,
        salesByPaymentMethod,
        salesByCategory,
        summary: {
          totalSales,
          totalCount,
          averageSale,
          period,
          startDate: startDate ? new Date(startDate as string) : null,
          endDate: endDate ? new Date(endDate as string) : null,
        },
      },
    });
  }
);

/**
 * Get inventory analytics
 * @route GET /api/pos/analytics/inventory
 * @access Private
 */
export const getInventoryAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { location, category } = req.query;

    // Build query
    const query: any = {};

    if (location) {
      query['inventory.location'] = location;
    }

    if (category) {
      query.category = new mongoose.Types.ObjectId(category as string);
    }

    // Get low stock products
    const lowStockPipeline = [
      {
        $match: {
          ...query,
          totalStock: { $lt: 10 }, // Assuming 10 is the low stock threshold
        },
      },
      { $sort: { totalStock: 1 as const } },
      { $limit: 20 },
    ];

    const lowStockProducts = await Product.aggregate(lowStockPipeline);

    // Get expiring products
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days expiry threshold

    const expiringPipeline = [
      {
        $match: query,
      },
      {
        $addFields: {
          expiringInventory: {
            $filter: {
              input: '$inventory',
              as: 'item',
              cond: {
                $and: [
                  { $gt: ['$$item.quantity', 0] },
                  { $lt: ['$$item.expiryDate', expiryDate] },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          expiringInventory: { $ne: [] },
        },
      },
      { $sort: { 'expiringInventory.expiryDate': 1 as const } },
      { $limit: 20 },
    ];

    const expiringProducts = await Product.aggregate(expiringPipeline);

    // Get inventory value by category
    const inventoryValuePipeline = [
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalStock: { $sum: '$totalStock' },
          totalValue: { $sum: { $multiply: ['$totalStock', '$costPrice'] } },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryDetails.name', 0] },
        },
      },
      { $sort: { totalValue: -1 as const } },
    ];

    const inventoryValueByCategory = await Product.aggregate(inventoryValuePipeline);

    // Get total inventory value
    const totalInventoryPipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$totalStock' },
          totalValue: { $sum: { $multiply: ['$totalStock', '$costPrice'] } },
        },
      },
    ];

    const totalInventoryResult = await Product.aggregate(totalInventoryPipeline);
    const totalInventory = totalInventoryResult.length > 0 ? totalInventoryResult[0] : {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
    };

    res.status(200).json({
      status: 'success',
      data: {
        lowStockProducts,
        expiringProducts,
        inventoryValueByCategory,
        summary: {
          totalProducts: totalInventory.totalProducts,
          totalStock: totalInventory.totalStock,
          totalValue: totalInventory.totalValue,
          lowStockCount: lowStockProducts.length,
          expiringCount: expiringProducts.length,
        },
      },
    });
  }
);
