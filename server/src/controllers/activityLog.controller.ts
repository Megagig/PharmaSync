import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/activityLog.model';
import { ActivityType } from '../interfaces/activityLog.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all activity logs with pagination and filtering
 * @route   GET /api/activity-logs
 * @access  Private/Admin
 */
export const getAllActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  // Filter by user
  if (req.query.user) {
    filter.user = req.query.user;
  }
  
  // Filter by activity type
  if (req.query.activityType) {
    filter.activityType = req.query.activityType;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.timestamp = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  }
  
  // Search by description
  if (req.query.search) {
    filter.description = { $regex: req.query.search, $options: 'i' };
  }
  
  // Execute query with pagination
  const activityLogs = await ActivityLog.find(filter)
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await ActivityLog.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: activityLogs,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get activity log by ID
 * @route   GET /api/activity-logs/:id
 * @access  Private/Admin
 */
export const getActivityLogById = asyncHandler(async (req: Request, res: Response) => {
  const activityLog = await ActivityLog.findById(req.params.id).populate(
    'user',
    'firstName lastName email'
  );
  
  if (!activityLog) {
    throw new AppError('Activity log not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: activityLog,
  });
});

/**
 * @desc    Get user activity logs
 * @route   GET /api/activity-logs/user/:userId
 * @access  Private/Admin
 */
export const getUserActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  const filter: any = { user: req.params.userId };
  
  // Filter by activity type
  if (req.query.activityType) {
    filter.activityType = req.query.activityType;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.timestamp = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  }
  
  // Execute query with pagination
  const activityLogs = await ActivityLog.find(filter)
    .populate('user', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await ActivityLog.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: activityLogs,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get current user's activity logs
 * @route   GET /api/activity-logs/me
 * @access  Private
 */
export const getMyActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  const filter: any = { user: req.user.id };
  
  // Filter by activity type
  if (req.query.activityType) {
    filter.activityType = req.query.activityType;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.timestamp = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  }
  
  // Execute query with pagination
  const activityLogs = await ActivityLog.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await ActivityLog.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: activityLogs,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get activity types
 * @route   GET /api/activity-logs/types
 * @access  Private
 */
export const getActivityTypes = asyncHandler(async (req: Request, res: Response) => {
  const activityTypes = Object.values(ActivityType);
  
  res.status(200).json({
    status: 'success',
    data: activityTypes,
  });
});

/**
 * @desc    Get activity statistics
 * @route   GET /api/activity-logs/stats
 * @access  Private/Admin
 */
export const getActivityStats = asyncHandler(async (req: Request, res: Response) => {
  // Get date range
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
  
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : new Date();
  
  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);
  
  // Get activity counts by type
  const activityByType = await ActivityLog.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  
  // Get activity counts by user
  const activityByUser = await ActivityLog.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$user',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        userName: {
          $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'],
        },
        userEmail: '$userDetails.email',
        count: 1,
      },
    },
  ]);
  
  // Get activity counts by day
  const activityByDay = await ActivityLog.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
        },
        count: 1,
      },
    },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      activityByType,
      activityByUser,
      activityByDay,
      dateRange: {
        startDate,
        endDate,
      },
    },
  });
});
