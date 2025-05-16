import { Request, Response, NextFunction } from 'express';
import * as comprehensiveReportService from '../services/comprehensive-reports.service';
import { AppError } from '../utils/error';
import { ReportFormat } from '../interfaces/report.interface';

/**
 * @desc    Get patient comprehensive report
 * @route   GET /api/comprehensive-reports/patient
 * @access  Private/Admin/Pharmacist
 */
export const getPatientComprehensiveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const format = (req.query.format as ReportFormat) || ReportFormat.JSON;
    
    const report = await comprehensiveReportService.generatePatientComprehensiveReport(
      startDate, 
      endDate, 
      format
    );
    
    if (format === ReportFormat.JSON) {
      res.status(200).json({
        status: 'success',
        data: report,
      });
    } else {
      // For non-JSON formats, send as downloadable file
      const fileName = `patient-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (format === ReportFormat.PDF) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === ReportFormat.EXCEL) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === ReportFormat.CSV) {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      res.send(report);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medication comprehensive report
 * @route   GET /api/comprehensive-reports/medication
 * @access  Private/Admin/Pharmacist
 */
export const getMedicationComprehensiveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const medicationType = req.query.medicationType as string;
    const format = (req.query.format as ReportFormat) || ReportFormat.JSON;
    
    const report = await comprehensiveReportService.generateMedicationComprehensiveReport(
      startDate, 
      endDate, 
      medicationType,
      format
    );
    
    if (format === ReportFormat.JSON) {
      res.status(200).json({
        status: 'success',
        data: report,
      });
    } else {
      // For non-JSON formats, send as downloadable file
      const fileName = `medication-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (format === ReportFormat.PDF) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === ReportFormat.EXCEL) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === ReportFormat.CSV) {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      res.send(report);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory comprehensive report
 * @route   GET /api/comprehensive-reports/inventory
 * @access  Private/Admin/Pharmacist
 */
export const getInventoryComprehensiveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const location = req.query.location as string;
    const reportType = req.query.reportType as string;
    const format = (req.query.format as ReportFormat) || ReportFormat.JSON;
    
    const report = await comprehensiveReportService.generateInventoryComprehensiveReport(
      startDate, 
      endDate, 
      location,
      reportType,
      format
    );
    
    if (format === ReportFormat.JSON) {
      res.status(200).json({
        status: 'success',
        data: report,
      });
    } else {
      // For non-JSON formats, send as downloadable file
      const fileName = `inventory-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (format === ReportFormat.PDF) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === ReportFormat.EXCEL) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === ReportFormat.CSV) {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      res.send(report);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sales comprehensive report
 * @route   GET /api/comprehensive-reports/sales
 * @access  Private/Admin/Pharmacist
 */
export const getSalesComprehensiveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const location = req.query.location as string;
    const groupBy = req.query.groupBy as string;
    const format = (req.query.format as ReportFormat) || ReportFormat.JSON;
    
    const report = await comprehensiveReportService.generateSalesComprehensiveReport(
      startDate, 
      endDate, 
      location,
      groupBy,
      format
    );
    
    if (format === ReportFormat.JSON) {
      res.status(200).json({
        status: 'success',
        data: report,
      });
    } else {
      // For non-JSON formats, send as downloadable file
      const fileName = `sales-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (format === ReportFormat.PDF) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === ReportFormat.EXCEL) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === ReportFormat.CSV) {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      res.send(report);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get financial comprehensive report
 * @route   GET /api/comprehensive-reports/financial
 * @access  Private/Admin/Pharmacist
 */
export const getFinancialComprehensiveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const reportType = req.query.reportType as string;
    const period = req.query.period as string;
    const format = (req.query.format as ReportFormat) || ReportFormat.JSON;
    
    const report = await comprehensiveReportService.generateFinancialComprehensiveReport(
      startDate, 
      endDate, 
      reportType,
      period,
      format
    );
    
    if (format === ReportFormat.JSON) {
      res.status(200).json({
        status: 'success',
        data: report,
      });
    } else {
      // For non-JSON formats, send as downloadable file
      const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (format === ReportFormat.PDF) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === ReportFormat.EXCEL) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === ReportFormat.CSV) {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      res.send(report);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get administrative comprehensive report
 * @route   GET /api/comprehensive-reports/administrative
 * @access  Private/Admin
 */
export const getAdministrativeComprehensiveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const reportType = req.query.reportType as string;
    const userRole = req.query.userRole as string;
    const format = (req.query.format as ReportFormat) || ReportFormat.JSON;
    
    const report = await comprehensiveReportService.generateAdministrativeComprehensiveReport(
      startDate, 
      endDate, 
      reportType,
      userRole,
      format
    );
    
    if (format === ReportFormat.JSON) {
      res.status(200).json({
        status: 'success',
        data: report,
      });
    } else {
      // For non-JSON formats, send as downloadable file
      const fileName = `administrative-report-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (format === ReportFormat.PDF) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === ReportFormat.EXCEL) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (format === ReportFormat.CSV) {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      res.send(report);
    }
  } catch (error) {
    next(error);
  }
};
