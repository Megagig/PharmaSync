import { Request, Response } from 'express';
import { NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import {
  ReportType,
  ReportFormat,
  ChartType,
  IReportData,
  IReportRequest,
} from '../interfaces/report.interface';
import ReportConfiguration from '../models/reportConfiguration.model';
import ReportSchedule from '../models/reportSchedule.model';
import ReportExecution from '../models/reportExecution.model';
import { AppError } from '../utils/error';
import {
  generateSalesReport,
  generateInventoryReport,
  generatePrescriptionReport,
  generatePatientReport,
  generateStaffReport,
  generateChartData,
} from '../services/analytics.service';
import { exportReport, emailReport } from '../services/export.service';
import { createNotification } from './notification.controller';
import {
  NotificationType,
  NotificationPriority,
} from '../interfaces/notification.interface';

/**
 * @desc    Get all report configurations
 * @route   GET /api/reports/configurations
 * @access  Private
 */
export const getReportConfigurations = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by creator or public reports
    filter.$or = [{ createdBy: req.user.id }, { isPublic: true }];

    // Execute query with pagination
    const configurations = await ReportConfiguration.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ReportConfiguration.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: configurations,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get report configuration by ID
 * @route   GET /api/reports/configurations/:id
 * @access  Private
 */
export const getReportConfigurationById = asyncHandler(
  async (req: Request, res: Response) => {
    const configuration = await ReportConfiguration.findById(
      req.params.id
    ).populate('createdBy', 'firstName lastName email');

    if (!configuration) {
      throw new AppError('Report configuration not found', 404);
    }

    // Check if the user has access to this configuration
    if (
      !configuration.isPublic &&
      configuration.createdBy.toString() !== req.user.id
    ) {
      throw new AppError(
        'You do not have permission to access this report configuration',
        403
      );
    }

    res.status(200).json({
      status: 'success',
      data: configuration,
    });
  }
);

/**
 * @desc    Create a new report configuration
 * @route   POST /api/reports/configurations
 * @access  Private
 */
export const createReportConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      type,
      isPublic,
      filters,
      charts,
      startDate,
      endDate,
    } = req.body;

    const configuration = await ReportConfiguration.create({
      name,
      description,
      type,
      createdBy: req.user.id,
      isPublic: isPublic || false,
      filters,
      charts,
      startDate,
      endDate,
    });

    res.status(201).json({
      status: 'success',
      data: configuration,
    });
  }
);

/**
 * @desc    Update a report configuration
 * @route   PATCH /api/reports/configurations/:id
 * @access  Private
 */
export const updateReportConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, isPublic, filters, charts, startDate, endDate } =
      req.body;

    const configuration = await ReportConfiguration.findById(req.params.id);

    if (!configuration) {
      throw new AppError('Report configuration not found', 404);
    }

    // Check if the user has permission to update this configuration
    if (configuration.createdBy.toString() !== req.user.id) {
      throw new AppError(
        'You do not have permission to update this report configuration',
        403
      );
    }

    // Update fields
    if (name) configuration.name = name;
    if (description !== undefined) configuration.description = description;
    if (isPublic !== undefined) configuration.isPublic = isPublic;
    if (filters) configuration.filters = filters;
    if (charts) configuration.charts = charts;
    if (startDate) configuration.startDate = new Date(startDate);
    if (endDate) configuration.endDate = new Date(endDate);

    await configuration.save();

    res.status(200).json({
      status: 'success',
      data: configuration,
    });
  }
);

/**
 * @desc    Delete a report configuration
 * @route   DELETE /api/reports/configurations/:id
 * @access  Private
 */
export const deleteReportConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const configuration = await ReportConfiguration.findById(req.params.id);

    if (!configuration) {
      throw new AppError('Report configuration not found', 404);
    }

    // Check if the user has permission to delete this configuration
    if (configuration.createdBy.toString() !== req.user.id) {
      throw new AppError(
        'You do not have permission to delete this report configuration',
        403
      );
    }

    // Delete associated schedules
    await ReportSchedule.deleteMany({ report: configuration._id });

    // Delete the configuration
    await ReportConfiguration.findByIdAndDelete(configuration._id);

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Generate a report
 * @route   POST /api/reports/generate
 * @access  Private
 */
export const generateReport = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      type,
      startDate,
      endDate,
      filters,
      format = ReportFormat.JSON,
      charts,
    } = req.body as IReportRequest;

    // Validate dates
    const parsedStartDate = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const parsedEndDate = endDate ? new Date(endDate) : new Date();

    if (parsedStartDate > parsedEndDate) {
      throw new AppError('Start date cannot be after end date', 400);
    }

    // Generate report data based on type
    let reportData: IReportData;

    switch (type) {
      case ReportType.SALES:
        const salesData = await generateSalesReport(
          parsedStartDate,
          parsedEndDate,
          filters
        );
        reportData = {
          title: 'Sales Report',
          type: ReportType.SALES,
          generatedAt: new Date(),
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          data: salesData.salesByMedication,
          charts: [
            {
              title: 'Sales by Day',
              type: ChartType.LINE,
              data: salesData.salesByDay,
            },
          ],
          summary: {
            'Total Sales': `$${salesData.totalSales.toFixed(2)}`,
            'Number of Products': salesData.salesByMedication.length,
            Period: `${parsedStartDate.toLocaleDateString()} to ${parsedEndDate.toLocaleDateString()}`,
          },
        };
        break;

      case ReportType.INVENTORY:
        const inventoryData = await generateInventoryReport(filters);
        reportData = {
          title: 'Inventory Report',
          type: ReportType.INVENTORY,
          generatedAt: new Date(),
          data: inventoryData.inventoryStatus,
          charts: [
            {
              title: 'Inventory Status',
              type: ChartType.PIE,
              data: [
                {
                  label: 'In Stock',
                  value: inventoryData.totalItems - inventoryData.lowStockCount,
                },
                { label: 'Low Stock', value: inventoryData.lowStockCount },
              ],
            },
          ],
          summary: {
            'Total Items': inventoryData.totalItems,
            'Low Stock Items': inventoryData.lowStockCount,
            'Expiring Soon': inventoryData.expiringSoonCount,
            'Total Value': `$${inventoryData.totalValue.toFixed(2)}`,
          },
        };
        break;

      case ReportType.PRESCRIPTION:
        const prescriptionData = await generatePrescriptionReport(
          parsedStartDate,
          parsedEndDate,
          filters
        );
        reportData = {
          title: 'Prescription Report',
          type: ReportType.PRESCRIPTION,
          generatedAt: new Date(),
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          data: prescriptionData.prescriptionsByMedication,
          charts: [
            {
              title: 'Prescriptions by Status',
              type: ChartType.PIE,
              data: prescriptionData.prescriptionsByStatus,
            },
            {
              title: 'Prescriptions by Day',
              type: ChartType.LINE,
              data: prescriptionData.prescriptionsByDay,
            },
          ],
          summary: {
            'Total Prescriptions': prescriptionData.totalPrescriptions,
            Period: `${parsedStartDate.toLocaleDateString()} to ${parsedEndDate.toLocaleDateString()}`,
          },
        };
        break;

      case ReportType.PATIENT:
        const patientData = await generatePatientReport(filters);
        reportData = {
          title: 'Patient Report',
          type: ReportType.PATIENT,
          generatedAt: new Date(),
          data: patientData.patientsByAgeGroup,
          charts: [
            {
              title: 'Patients by Age Group',
              type: ChartType.BAR,
              data: patientData.patientsByAgeGroup,
            },
            {
              title: 'Patients by Gender',
              type: ChartType.PIE,
              data: patientData.patientsByGender,
            },
            {
              title: 'New Patients by Month',
              type: ChartType.LINE,
              data: patientData.newPatientsByMonth,
            },
          ],
          summary: {
            'Total Patients': patientData.totalPatients,
          },
        };
        break;

      case ReportType.STAFF:
        const staffData = await generateStaffReport(filters);
        reportData = {
          title: 'Staff Report',
          type: ReportType.STAFF,
          generatedAt: new Date(),
          data: staffData.activityByStaff,
          charts: [
            {
              title: 'Staff by Role',
              type: ChartType.PIE,
              data: staffData.staffByRole,
            },
          ],
          summary: {
            'Total Staff': staffData.totalStaff,
          },
        };
        break;

      case ReportType.CUSTOM:
        if (!charts || charts.length === 0) {
          throw new AppError(
            'Custom reports require at least one chart configuration',
            400
          );
        }

        // Generate data for each chart
        const chartResults = await Promise.all(
          charts.map(async (chart) => {
            const data = await generateChartData(
              chart,
              parsedStartDate,
              parsedEndDate,
              {}
            );
            return {
              title: chart.title,
              type: chart.type,
              data,
            };
          })
        );

        reportData = {
          title: 'Custom Report',
          type: ReportType.CUSTOM,
          generatedAt: new Date(),
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          data: [],
          charts: chartResults,
          summary: {
            Period: `${parsedStartDate.toLocaleDateString()} to ${parsedEndDate.toLocaleDateString()}`,
          },
        };
        break;

      default:
        throw new AppError(`Unsupported report type: ${type}`, 400);
    }

    // Create report execution record
    const execution = await ReportExecution.create({
      report: null, // Not associated with a saved configuration
      format,
      executedBy: req.user.id,
      status: 'processing',
      executedAt: new Date(),
    });

    // Export the report if a format other than JSON is requested
    if (format !== ReportFormat.JSON) {
      try {
        const filePath = await exportReport(reportData, format);

        // Update execution record
        execution.status = 'completed';
        execution.fileUrl = `/uploads/reports/${path.basename(filePath)}`;
        execution.completedAt = new Date();
        await execution.save();

        // Send file URL
        res.status(200).json({
          status: 'success',
          data: {
            ...reportData,
            fileUrl: execution.fileUrl,
          },
        });
      } catch (error: any) {
        // Update execution record with error
        execution.status = 'failed';
        execution.error = error.message || 'Unknown error';
        await execution.save();

        throw new AppError(
          `Failed to export report: ${error.message || 'Unknown error'}`,
          500
        );
      }
    }

    // For JSON format, just return the data
    execution.status = 'completed';
    execution.completedAt = new Date();
    await execution.save();

    res.status(200).json({
      status: 'success',
      data: reportData,
    });
  }
);

/**
 * @desc    Generate a report from a saved configuration
 * @route   POST /api/reports/configurations/:id/generate
 * @access  Private
 */
export const generateReportFromConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const { format = ReportFormat.JSON } = req.body;
    const configId = req.params.id;

    // Get the configuration
    const configuration = await ReportConfiguration.findById(configId);

    if (!configuration) {
      throw new AppError('Report configuration not found', 404);
    }

    // Check if the user has access to this configuration
    if (
      !configuration.isPublic &&
      configuration.createdBy.toString() !== req.user.id
    ) {
      throw new AppError(
        'You do not have permission to access this report configuration',
        403
      );
    }

    // Create report execution record
    const execution = await ReportExecution.create({
      report: configuration._id,
      format,
      executedBy: req.user.id,
      status: 'processing',
      executedAt: new Date(),
    });

    // Generate the report using the configuration
    try {
      // Create a new request body with the configuration data
      req.body = {
        ...req.body,
        type: configuration.type,
        startDate: configuration.startDate,
        endDate: configuration.endDate,
        filters: configuration.filters,
        charts: configuration.charts,
      };

      // Call the generate report handler directly
      await generateReport(req, res, () => {});

      // Update execution record
      execution.status = 'completed';
      execution.completedAt = new Date();
      await execution.save();

      // The response is already sent by generateReport
      return;
    } catch (error: any) {
      // Update execution record with error
      execution.status = 'failed';
      execution.error = error.message || 'Unknown error';
      await execution.save();

      throw error;
    }
  }
);

/**
 * @desc    Get report executions
 * @route   GET /api/reports/executions
 * @access  Private
 */
export const getReportExecutions = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { executedBy: req.user.id };

    // Filter by report
    if (req.query.report) {
      filter.report = req.query.report;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Execute query with pagination
    const executions = await ReportExecution.find(filter)
      .populate('report', 'name type')
      .populate('executedBy', 'firstName lastName email')
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ReportExecution.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: executions,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Download a report file
 * @route   GET /api/reports/download/:id
 * @access  Private
 */
export const downloadReport = asyncHandler(
  async (req: Request, res: Response) => {
    const execution = await ReportExecution.findById(req.params.id);

    if (!execution) {
      throw new AppError('Report execution not found', 404);
    }

    // Check if the user has permission to download this report
    if (execution.executedBy.toString() !== req.user.id) {
      throw new AppError(
        'You do not have permission to download this report',
        403
      );
    }

    // Check if the report has a file URL
    if (!execution.fileUrl) {
      throw new AppError('No file available for this report', 404);
    }

    // Get the file path
    const filePath = path.join(__dirname, '../../', execution.fileUrl);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new AppError('Report file not found', 404);
    }

    // Set content type based on format
    let contentType = 'application/octet-stream';
    switch (execution.format) {
      case ReportFormat.PDF:
        contentType = 'application/pdf';
        break;
      case ReportFormat.CSV:
        contentType = 'text/csv';
        break;
      case ReportFormat.EXCEL:
        contentType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case ReportFormat.JSON:
        contentType = 'application/json';
        break;
    }

    // Send the file
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${path.basename(filePath)}`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
);

/**
 * @desc    Create a report schedule
 * @route   POST /api/reports/schedules
 * @access  Private
 */
export const createReportSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { report, frequency, format, recipients, nextRunDate, isActive } =
      req.body;

    // Check if the report configuration exists
    const configuration = await ReportConfiguration.findById(report);

    if (!configuration) {
      throw new AppError('Report configuration not found', 404);
    }

    // Check if the user has permission to schedule this report
    if (configuration.createdBy.toString() !== req.user.id) {
      throw new AppError(
        'You do not have permission to schedule this report',
        403
      );
    }

    // Create the schedule
    const schedule = await ReportSchedule.create({
      report,
      frequency,
      format,
      recipients,
      nextRunDate: new Date(nextRunDate),
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // Notify the user
    await createNotification({
      user: req.user.id,
      type: NotificationType.SYSTEM,
      title: 'Report Schedule Created',
      message: `Your schedule for "${configuration.name}" has been created and will run ${frequency}.`,
      priority: NotificationPriority.LOW,
    });

    res.status(201).json({
      status: 'success',
      data: schedule,
    });
  }
);

/**
 * @desc    Get report schedules
 * @route   GET /api/reports/schedules
 * @access  Private
 */
export const getReportSchedules = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { createdBy: req.user.id };

    // Filter by report
    if (req.query.report) {
      filter.report = req.query.report;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Execute query with pagination
    const schedules = await ReportSchedule.find(filter)
      .populate('report', 'name type')
      .populate('createdBy', 'firstName lastName email')
      .sort({ nextRunDate: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ReportSchedule.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: schedules,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Update a report schedule
 * @route   PATCH /api/reports/schedules/:id
 * @access  Private
 */
export const updateReportSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { frequency, format, recipients, nextRunDate, isActive } = req.body;

    const schedule = await ReportSchedule.findById(req.params.id);

    if (!schedule) {
      throw new AppError('Report schedule not found', 404);
    }

    // Check if the user has permission to update this schedule
    if (schedule.createdBy.toString() !== req.user.id) {
      throw new AppError(
        'You do not have permission to update this schedule',
        403
      );
    }

    // Update fields
    if (frequency) schedule.frequency = frequency;
    if (format) schedule.format = format;
    if (recipients) schedule.recipients = recipients;
    if (nextRunDate) schedule.nextRunDate = new Date(nextRunDate);
    if (isActive !== undefined) schedule.isActive = isActive;

    await schedule.save();

    res.status(200).json({
      status: 'success',
      data: schedule,
    });
  }
);

/**
 * @desc    Delete a report schedule
 * @route   DELETE /api/reports/schedules/:id
 * @access  Private
 */
export const deleteReportSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const schedule = await ReportSchedule.findById(req.params.id);

    if (!schedule) {
      throw new AppError('Report schedule not found', 404);
    }

    // Check if the user has permission to delete this schedule
    if (schedule.createdBy.toString() !== req.user.id) {
      throw new AppError(
        'You do not have permission to delete this schedule',
        403
      );
    }

    await ReportSchedule.findByIdAndDelete(schedule._id);

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);
