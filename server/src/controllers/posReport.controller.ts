import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/error';
import * as posReportService from '../services/posReport.service';
import { ReportFormat } from '../interfaces/report.interface';
import fs from 'fs';
import path from 'path';

/**
 * Generate a sales report
 * @route POST /api/pos/reports/sales
 * @access Private
 */
export const generateSalesReport = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      format = ReportFormat.JSON,
      location,
      cashier,
      customer,
      transactionType,
      paymentMethod,
      groupBy,
    } = req.body;
    
    const report = await posReportService.generateSalesReport({
      startDate,
      endDate,
      format,
      location,
      cashier,
      customer,
      transactionType,
      paymentMethod,
      groupBy,
    });
    
    // If the report has a file URL, send the file
    if (report.fileUrl) {
      const filePath = report.fileUrl;
      const fileName = path.basename(filePath);
      
      // Set appropriate content type
      let contentType = 'application/octet-stream';
      
      switch (format) {
        case ReportFormat.CSV:
          contentType = 'text/csv';
          break;
        case ReportFormat.EXCEL:
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case ReportFormat.PDF:
          contentType = 'application/pdf';
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // Send JSON response
      res.status(200).json({
        status: 'success',
        data: report.data,
      });
    }
  }
);

/**
 * Generate an inventory report
 * @route POST /api/pos/reports/inventory
 * @access Private
 */
export const generateInventoryReport = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      format = ReportFormat.JSON,
      location,
      category,
      lowStock,
      expiringSoon,
      daysToExpiry,
      groupBy,
    } = req.body;
    
    const report = await posReportService.generateInventoryReport({
      format,
      location,
      category,
      lowStock,
      expiringSoon,
      daysToExpiry,
      groupBy,
    });
    
    // If the report has a file URL, send the file
    if (report.fileUrl) {
      const filePath = report.fileUrl;
      const fileName = path.basename(filePath);
      
      // Set appropriate content type
      let contentType = 'application/octet-stream';
      
      switch (format) {
        case ReportFormat.CSV:
          contentType = 'text/csv';
          break;
        case ReportFormat.EXCEL:
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case ReportFormat.PDF:
          contentType = 'application/pdf';
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // Send JSON response
      res.status(200).json({
        status: 'success',
        data: report.data,
      });
    }
  }
);

/**
 * Generate a customer report
 * @route POST /api/pos/reports/customers
 * @access Private
 */
export const generateCustomerReport = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      format = ReportFormat.JSON,
      loyaltyTier,
      minPurchases,
      maxPurchases,
      groupBy,
    } = req.body;
    
    const report = await posReportService.generateCustomerReport({
      startDate,
      endDate,
      format,
      loyaltyTier,
      minPurchases,
      maxPurchases,
      groupBy,
    });
    
    // If the report has a file URL, send the file
    if (report.fileUrl) {
      const filePath = report.fileUrl;
      const fileName = path.basename(filePath);
      
      // Set appropriate content type
      let contentType = 'application/octet-stream';
      
      switch (format) {
        case ReportFormat.CSV:
          contentType = 'text/csv';
          break;
        case ReportFormat.EXCEL:
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case ReportFormat.PDF:
          contentType = 'application/pdf';
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // Send JSON response
      res.status(200).json({
        status: 'success',
        data: report.data,
      });
    }
  }
);
