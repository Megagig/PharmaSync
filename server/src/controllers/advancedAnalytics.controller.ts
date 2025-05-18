import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { AppError } from '../utils/error';
import * as advancedAnalyticsService from '../services/advancedAnalytics.service';

/**
 * Get sales trend analytics
 * @route GET /api/analytics/advanced/sales-trend
 * @access Private
 */
export const getSalesTrendAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      period,
      compareWithPrevious,
      location,
    } = req.query;
    
    const result = await advancedAnalyticsService.getSalesTrendAnalytics({
      startDate: startDate as string,
      endDate: endDate as string,
      period: period as string,
      compareWithPrevious: compareWithPrevious === 'true',
      location: location as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get product performance analytics
 * @route GET /api/analytics/advanced/product-performance
 * @access Private
 */
export const getProductPerformanceAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      topProducts,
      category,
      location,
    } = req.query;
    
    const result = await advancedAnalyticsService.getProductPerformanceAnalytics({
      startDate: startDate as string,
      endDate: endDate as string,
      topProducts: topProducts ? parseInt(topProducts as string) : undefined,
      category: category as string,
      location: location as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get customer analytics
 * @route GET /api/analytics/advanced/customer
 * @access Private
 */
export const getCustomerAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      topCustomers,
      segmentBy,
      location,
    } = req.query;
    
    const result = await advancedAnalyticsService.getCustomerAnalytics({
      startDate: startDate as string,
      endDate: endDate as string,
      topCustomers: topCustomers ? parseInt(topCustomers as string) : undefined,
      segmentBy: segmentBy as string,
      location: location as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get insurance analytics
 * @route GET /api/analytics/advanced/insurance
 * @access Private
 */
export const getInsuranceAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      provider,
      location,
    } = req.query;
    
    const result = await advancedAnalyticsService.getInsuranceAnalytics({
      startDate: startDate as string,
      endDate: endDate as string,
      provider: provider as string,
      location: location as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

/**
 * Get prescription analytics
 * @route GET /api/analytics/advanced/prescription
 * @access Private
 */
export const getPrescriptionAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      startDate,
      endDate,
      doctor,
      location,
    } = req.query;
    
    const result = await advancedAnalyticsService.getPrescriptionAnalytics({
      startDate: startDate as string,
      endDate: endDate as string,
      doctor: doctor as string,
      location: location as string,
    });
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
