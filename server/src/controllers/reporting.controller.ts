import { Request, Response, NextFunction } from 'express';
import * as reportingService from '../services/reporting.service';

/**
 * @desc    Get patient demographics report
 * @route   GET /api/reports/demographics
 * @access  Private/Admin
 */
export const getPatientDemographicsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const report = await reportingService.getPatientDemographicsReport(startDate, endDate);
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medication usage report
 * @route   GET /api/reports/medication-usage
 * @access  Private/Admin
 */
export const getMedicationUsageReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const report = await reportingService.getMedicationUsageReport(startDate, endDate);
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get drug therapy problem report
 * @route   GET /api/reports/drug-therapy-problems
 * @access  Private/Admin
 */
export const getDrugTherapyProblemReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const report = await reportingService.getDrugTherapyProblemReport(startDate, endDate);
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient outcomes report
 * @route   GET /api/reports/patient-outcomes
 * @access  Private/Admin
 */
export const getPatientOutcomesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const report = await reportingService.getPatientOutcomesReport(startDate, endDate);
    
    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports
 * @route   GET /api/reports/all
 * @access  Private/Admin
 */
export const getAllReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const [
      demographics,
      medicationUsage,
      drugTherapyProblems,
      patientOutcomes,
    ] = await Promise.all([
      reportingService.getPatientDemographicsReport(startDate, endDate),
      reportingService.getMedicationUsageReport(startDate, endDate),
      reportingService.getDrugTherapyProblemReport(startDate, endDate),
      reportingService.getPatientOutcomesReport(startDate, endDate),
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        demographics,
        medicationUsage,
        drugTherapyProblems,
        patientOutcomes,
      },
    });
  } catch (error) {
    next(error);
  }
};
