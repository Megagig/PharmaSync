import mongoose from 'mongoose';
import { AppError } from '../utils/error';
import PosTransaction from '../models/posTransaction.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import { PosTransactionType } from '../interfaces/posTransaction.interface';
import { ReportType, ReportFormat } from '../interfaces/report.interface';
import logger from '../utils/logger';
import { formatDate, formatCurrency } from '../utils/formatters';
import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * Generate a sales report for a specific period
 */
export const generateSalesReport = async ({
  startDate,
  endDate,
  format = ReportFormat.JSON,
  location,
  cashier,
  customer,
  transactionType,
  paymentMethod,
  groupBy,
}) => {
  try {
    // Build query
    const query: any = {};

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.saleDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.saleDate = { $lte: new Date(endDate) };
    }

    if (location) {
      query.location = new mongoose.Types.ObjectId(location);
    }

    if (cashier) {
      query.cashier = new mongoose.Types.ObjectId(cashier);
    }

    if (customer) {
      query.customer = new mongoose.Types.ObjectId(customer);
    }

    if (transactionType) {
      query.transactionType = transactionType;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
    ];

    // Add grouping if specified
    if (groupBy) {
      const groupStage: any = {
        _id: {},
        count: { $sum: 1 },
        total: { $sum: '$total' },
        subtotal: { $sum: '$subtotal' },
        discount: { $sum: '$discount' },
        tax: { $sum: '$tax' },
      };

      if (Array.isArray(groupBy)) {
        groupBy.forEach(field => {
          groupStage._id[field] = `$${field}`;
        });
      } else {
        groupStage._id[groupBy] = `$${groupBy}`;
      }

      pipeline.push({ $group: groupStage });

      // Add lookup for grouped fields if needed
      if (groupBy.includes('location') || Array.isArray(groupBy) && groupBy.includes('location')) {
        pipeline.push({
          $lookup: {
            from: 'locations',
            localField: '_id.location',
            foreignField: '_id',
            as: 'locationDetails',
          },
        });
        pipeline.push({
          $addFields: {
            'locationName': { $arrayElemAt: ['$locationDetails.name', 0] },
          },
        });
      }

      if (groupBy.includes('cashier') || Array.isArray(groupBy) && groupBy.includes('cashier')) {
        pipeline.push({
          $lookup: {
            from: 'users',
            localField: '_id.cashier',
            foreignField: '_id',
            as: 'cashierDetails',
          },
        });
        pipeline.push({
          $addFields: {
            'cashierName': {
              $concat: [
                { $arrayElemAt: ['$cashierDetails.firstName', 0] },
                ' ',
                { $arrayElemAt: ['$cashierDetails.lastName', 0] },
              ],
            },
          },
        });
      }

      if (groupBy.includes('customer') || Array.isArray(groupBy) && groupBy.includes('customer')) {
        pipeline.push({
          $lookup: {
            from: 'customers',
            localField: '_id.customer',
            foreignField: '_id',
            as: 'customerDetails',
          },
        });
        pipeline.push({
          $addFields: {
            'customerName': {
              $concat: [
                { $arrayElemAt: ['$customerDetails.firstName', 0] },
                ' ',
                { $arrayElemAt: ['$customerDetails.lastName', 0] },
              ],
            },
          },
        });
      }

      // Sort by total descending
      pipeline.push({ $sort: { total: -1 } });
    } else {
      // If no grouping, just sort by date
      pipeline.push({ $sort: { saleDate: -1 } });
    }

    // Execute aggregation
    const results = await PosTransaction.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalSales: results.reduce((sum, item) => sum + (groupBy ? item.total : item.total), 0),
      totalTransactions: results.length,
      averageSale: results.length > 0
        ? results.reduce((sum, item) => sum + (groupBy ? item.total : item.total), 0) / results.length
        : 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    // Format the report based on the requested format
    const reportData = {
      title: 'Sales Report',
      type: ReportType.SALES,
      generatedAt: new Date(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      data: results,
      summary,
    };

    return formatReport(reportData, format);
  } catch (error) {
    logger.error('Error generating sales report:', error);
    throw error;
  }
};

/**
 * Generate an inventory report
 */
export const generateInventoryReport = async ({
  format = ReportFormat.JSON,
  location,
  category,
  lowStock,
  expiringSoon,
  daysToExpiry = 90,
  groupBy,
}) => {
  try {
    // Build query
    const query: any = {};

    if (location) {
      query['inventory.location'] = location;
    }

    if (category) {
      query.category = category;
    }

    if (lowStock) {
      query.totalStock = { $lt: lowStock };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
    ];

    // Add expiry date filter if needed
    if (expiringSoon) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

      pipeline.push({
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
      });

      pipeline.push({
        $match: {
          expiringInventory: { $ne: [] },
        },
      });
    }

    // Add grouping if specified
    if (groupBy) {
      const groupStage: any = {
        _id: {},
        count: { $sum: 1 },
        totalStock: { $sum: '$totalStock' },
        totalValue: { $sum: { $multiply: ['$totalStock', '$costPrice'] } },
      };

      if (Array.isArray(groupBy)) {
        groupBy.forEach(field => {
          groupStage._id[field] = `$${field}`;
        });
      } else {
        groupStage._id[groupBy] = `$${groupBy}`;
      }

      pipeline.push({ $group: groupStage });

      // Add lookup for grouped fields if needed
      if (groupBy.includes('category') || Array.isArray(groupBy) && groupBy.includes('category')) {
        pipeline.push({
          $lookup: {
            from: 'categories',
            localField: '_id.category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        });
        pipeline.push({
          $addFields: {
            'categoryName': { $arrayElemAt: ['$categoryDetails.name', 0] },
          },
        });
      }

      // Sort by total stock descending
      pipeline.push({ $sort: { totalStock: -1 } });
    } else {
      // If no grouping, include all fields and sort by stock level
      pipeline.push({
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          barcode: 1,
          category: 1,
          totalStock: 1,
          costPrice: 1,
          sellingPrice: 1,
          inventory: 1,
          expiringInventory: 1,
          totalValue: { $multiply: ['$totalStock', '$costPrice'] },
        },
      });

      pipeline.push({ $sort: { totalStock: 1 } });
    }

    // Execute aggregation
    const results = await Product.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalProducts: results.length,
      totalStock: results.reduce((sum, item) => sum + (groupBy ? item.totalStock : item.totalStock), 0),
      totalValue: results.reduce((sum, item) => sum + (groupBy ? item.totalValue : item.totalValue), 0),
      lowStockCount: results.filter(item => (groupBy ? item.totalStock : item.totalStock) < (lowStock || 10)).length,
      expiringCount: expiringSoon ? results.length : 0,
    };

    // Format the report based on the requested format
    const reportData = {
      title: 'Inventory Report',
      type: ReportType.INVENTORY,
      generatedAt: new Date(),
      data: results,
      summary,
    };

    return formatReport(reportData, format);
  } catch (error) {
    logger.error('Error generating inventory report:', error);
    throw error;
  }
};

/**
 * Generate a customer report
 */
export const generateCustomerReport = async ({
  startDate,
  endDate,
  format = ReportFormat.JSON,
  loyaltyTier,
  minPurchases,
  maxPurchases,
  groupBy,
}) => {
  try {
    // Build query
    const query: any = {};

    if (loyaltyTier) {
      query['loyalty.tier'] = loyaltyTier;
    }

    if (minPurchases || maxPurchases) {
      query.totalPurchases = {};

      if (minPurchases) {
        query.totalPurchases.$gte = minPurchases;
      }

      if (maxPurchases) {
        query.totalPurchases.$lte = maxPurchases;
      }
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
    ];

    // Add lookup for loyalty information
    pipeline.push({
      $lookup: {
        from: 'customerloyalties',
        localField: '_id',
        foreignField: 'customer',
        as: 'loyalty',
      },
    });

    pipeline.push({
      $addFields: {
        loyaltyInfo: { $arrayElemAt: ['$loyalty', 0] },
      },
    });

    // Add lookup for transactions if date range is specified
    if (startDate || endDate) {
      const transactionMatch: any = {};

      if (startDate && endDate) {
        transactionMatch.saleDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      } else if (startDate) {
        transactionMatch.saleDate = { $gte: new Date(startDate) };
      } else if (endDate) {
        transactionMatch.saleDate = { $lte: new Date(endDate) };
      }

      pipeline.push({
        $lookup: {
          from: 'postransactions',
          let: { customerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$customer', '$$customerId'] },
                ...transactionMatch,
              },
            },
          ],
          as: 'transactions',
        },
      });

      pipeline.push({
        $addFields: {
          transactionCount: { $size: '$transactions' },
          periodTotal: { $sum: '$transactions.total' },
        },
      });
    }

    // Add grouping if specified
    if (groupBy) {
      const groupStage: any = {
        _id: {},
        count: { $sum: 1 },
        totalPurchases: { $sum: '$totalPurchases' },
      };

      if (startDate || endDate) {
        groupStage.periodTotal = { $sum: '$periodTotal' };
        groupStage.transactionCount = { $sum: '$transactionCount' };
      }

      if (Array.isArray(groupBy)) {
        groupBy.forEach(field => {
          groupStage._id[field] = `$${field}`;
        });
      } else {
        groupStage._id[groupBy] = `$${groupBy}`;
      }

      pipeline.push({ $group: groupStage });

      // Sort by total purchases descending
      pipeline.push({ $sort: { totalPurchases: -1 } });
    } else {
      // If no grouping, include all fields and sort by total purchases
      pipeline.push({
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          customerNumber: 1,
          email: 1,
          phone: 1,
          totalPurchases: 1,
          lastPurchaseDate: 1,
          loyaltyInfo: 1,
          transactionCount: 1,
          periodTotal: 1,
        },
      });

      pipeline.push({ $sort: { totalPurchases: -1 } });
    }

    // Execute aggregation
    const results = await Customer.aggregate(pipeline);

    // Calculate summary
    const summary = {
      totalCustomers: results.length,
      totalPurchases: results.reduce((sum, item) => sum + (item.totalPurchases || 0), 0),
      averagePurchase: results.length > 0
        ? results.reduce((sum, item) => sum + (item.totalPurchases || 0), 0) / results.length
        : 0,
      periodTotal: results.reduce((sum, item) => sum + (item.periodTotal || 0), 0),
      transactionCount: results.reduce((sum, item) => sum + (item.transactionCount || 0), 0),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    // Format the report based on the requested format
    const reportData = {
      title: 'Customer Report',
      type: ReportType.PATIENT, // Using PATIENT instead of CUSTOMER which doesn't exist
      generatedAt: new Date(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      data: results,
      summary,
    };

    return formatReport(reportData, format);
  } catch (error) {
    logger.error('Error generating customer report:', error);
    throw error;
  }
};

/**
 * Format report data based on the requested format
 */
const formatReport = async (reportData, format) => {
  try {
    switch (format) {
      case ReportFormat.JSON:
        return {
          data: reportData,
          format: ReportFormat.JSON,
        };

      case ReportFormat.CSV:
        const csvParser = new Parser();
        const csv = csvParser.parse(reportData.data);

        const csvFilePath = path.join(
          __dirname,
          '../../../uploads/reports',
          `${reportData.type}_${Date.now()}.csv`
        );

        // Ensure directory exists
        fs.mkdirSync(path.dirname(csvFilePath), { recursive: true });

        // Write CSV file
        fs.writeFileSync(csvFilePath, csv);

        return {
          data: reportData,
          format: ReportFormat.CSV,
          fileUrl: csvFilePath,
        };

      case ReportFormat.EXCEL:
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Add title
        worksheet.addRow([reportData.title]);
        worksheet.addRow([`Generated at: ${formatDate(reportData.generatedAt)}`]);

        if (reportData.startDate && reportData.endDate) {
          worksheet.addRow([
            `Period: ${formatDate(reportData.startDate)} to ${formatDate(reportData.endDate)}`,
          ]);
        }

        worksheet.addRow([]);

        // Add headers
        if (reportData.data.length > 0) {
          const headers = Object.keys(reportData.data[0]);
          worksheet.addRow(headers);

          // Add data
          reportData.data.forEach(item => {
            worksheet.addRow(Object.values(item));
          });
        }

        // Add summary
        worksheet.addRow([]);
        worksheet.addRow(['Summary']);

        Object.entries(reportData.summary).forEach(([key, value]) => {
          worksheet.addRow([key, value]);
        });

        // Save workbook
        const excelFilePath = path.join(
          __dirname,
          '../../../uploads/reports',
          `${reportData.type}_${Date.now()}.xlsx`
        );

        // Ensure directory exists
        fs.mkdirSync(path.dirname(excelFilePath), { recursive: true });

        // Write Excel file
        await workbook.xlsx.writeFile(excelFilePath);

        return {
          data: reportData,
          format: ReportFormat.EXCEL,
          fileUrl: excelFilePath,
        };

      case ReportFormat.PDF:
        const pdfFilePath = path.join(
          __dirname,
          '../../../uploads/reports',
          `${reportData.type}_${Date.now()}.pdf`
        );

        // Ensure directory exists
        fs.mkdirSync(path.dirname(pdfFilePath), { recursive: true });

        // Create PDF document
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfFilePath);

        doc.pipe(stream);

        // Add title
        doc.fontSize(16).text(reportData.title, { align: 'center' });
        doc.moveDown();

        // Add generation date
        doc.fontSize(10).text(`Generated at: ${formatDate(reportData.generatedAt)}`);

        // Add date range if available
        if (reportData.startDate && reportData.endDate) {
          doc.text(
            `Period: ${formatDate(reportData.startDate)} to ${formatDate(reportData.endDate)}`
          );
        }

        doc.moveDown();

        // Add summary
        doc.fontSize(12).text('Summary', { underline: true });
        doc.moveDown(0.5);

        Object.entries(reportData.summary).forEach(([key, value]) => {
          doc.fontSize(10).text(`${key}: ${value}`);
        });

        doc.moveDown();

        // Add data table
        if (reportData.data.length > 0) {
          doc.fontSize(12).text('Data', { underline: true });
          doc.moveDown(0.5);

          // This is a simplified approach - a real implementation would need
          // more sophisticated table rendering
          reportData.data.forEach((item, index) => {
            doc.fontSize(10).text(`Item ${index + 1}:`);

            Object.entries(item).forEach(([key, value]) => {
              doc.text(`  ${key}: ${value}`);
            });

            doc.moveDown(0.5);
          });
        }

        // Finalize PDF
        doc.end();

        // Wait for the stream to finish
        await new Promise<void>((resolve) => {
          stream.on('finish', () => resolve());
        });

        return {
          data: reportData,
          format: ReportFormat.PDF,
          fileUrl: pdfFilePath,
        };

      default:
        throw new AppError(`Unsupported report format: ${format}`, 400);
    }
  } catch (error) {
    logger.error('Error formatting report:', error);
    throw error;
  }
};
