import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ScheduleShift from '../models/scheduleShift.model';
import TimeOffRequest from '../models/timeOffRequest.model';
import User from '../models/user.model';
import ActivityLog from '../models/activityLog.model';
import { ActivityType } from '../interfaces/activityLog.interface';
import { ShiftType, RecurrenceType } from '../interfaces/schedule.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all schedule shifts with pagination and filtering
 * @route   GET /api/schedule/shifts
 * @access  Private
 */
export const getAllShifts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  // Filter by user
  if (req.query.user) {
    filter.user = req.query.user;
  }
  
  // Filter by shift type
  if (req.query.shiftType) {
    filter.shiftType = req.query.shiftType;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.$or = [
      {
        // Shifts that start within the date range
        startTime: {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        },
      },
      {
        // Shifts that end within the date range
        endTime: {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        },
      },
      {
        // Shifts that span the date range
        startTime: { $lte: new Date(req.query.startDate as string) },
        endTime: { $gte: new Date(req.query.endDate as string) },
      },
    ];
  }
  
  // Execute query with pagination
  const shifts = await ScheduleShift.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName')
    .sort({ startTime: 1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await ScheduleShift.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: shifts,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get shift by ID
 * @route   GET /api/schedule/shifts/:id
 * @access  Private
 */
export const getShiftById = asyncHandler(async (req: Request, res: Response) => {
  const shift = await ScheduleShift.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName');
  
  if (!shift) {
    throw new AppError('Shift not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: shift,
  });
});

/**
 * @desc    Create new shift
 * @route   POST /api/schedule/shifts
 * @access  Private/Admin
 */
export const createShift = asyncHandler(async (req: Request, res: Response) => {
  const {
    user,
    shiftType,
    startTime,
    endTime,
    notes,
    isRecurring,
    recurrenceType,
    recurrenceEndDate,
  } = req.body;
  
  // Verify user exists
  const userExists = await User.findById(user);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }
  
  // Create shift
  const shift = await ScheduleShift.create({
    user,
    shiftType,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    notes,
    isRecurring: isRecurring || false,
    recurrenceType: isRecurring ? recurrenceType : RecurrenceType.NONE,
    recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
    createdBy: req.user.id,
  });
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.SCHEDULE_CREATE,
    description: `Created new shift for ${userExists.firstName} ${userExists.lastName}`,
    details: {
      shiftId: shift._id,
      userId: user,
      shiftType,
      startTime,
      endTime,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({
    status: 'success',
    data: shift,
  });
});

/**
 * @desc    Update shift
 * @route   PATCH /api/schedule/shifts/:id
 * @access  Private/Admin
 */
export const updateShift = asyncHandler(async (req: Request, res: Response) => {
  const {
    shiftType,
    startTime,
    endTime,
    notes,
    isRecurring,
    recurrenceType,
    recurrenceEndDate,
  } = req.body;
  
  const shift = await ScheduleShift.findById(req.params.id);
  
  if (!shift) {
    throw new AppError('Shift not found', 404);
  }
  
  // Update fields
  if (shiftType) shift.shiftType = shiftType;
  if (startTime) shift.startTime = new Date(startTime);
  if (endTime) shift.endTime = new Date(endTime);
  if (notes !== undefined) shift.notes = notes;
  if (isRecurring !== undefined) shift.isRecurring = isRecurring;
  if (recurrenceType) shift.recurrenceType = recurrenceType;
  if (recurrenceEndDate) shift.recurrenceEndDate = new Date(recurrenceEndDate);
  
  // Set updatedBy
  shift.updatedBy = req.user.id;
  
  await shift.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.SCHEDULE_UPDATE,
    description: `Updated shift for ${shift.user}`,
    details: {
      shiftId: shift._id,
      updatedFields: Object.keys(req.body),
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: shift,
  });
});

/**
 * @desc    Delete shift
 * @route   DELETE /api/schedule/shifts/:id
 * @access  Private/Admin
 */
export const deleteShift = asyncHandler(async (req: Request, res: Response) => {
  const shift = await ScheduleShift.findById(req.params.id);
  
  if (!shift) {
    throw new AppError('Shift not found', 404);
  }
  
  await shift.remove();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.SCHEDULE_DELETE,
    description: `Deleted shift for ${shift.user}`,
    details: {
      shiftId: shift._id,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Get all time off requests with pagination and filtering
 * @route   GET /api/schedule/time-off
 * @access  Private
 */
export const getAllTimeOffRequests = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  // Filter by user
  if (req.query.user) {
    filter.user = req.query.user;
  }
  
  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    filter.$or = [
      {
        // Requests that start within the date range
        startDate: {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        },
      },
      {
        // Requests that end within the date range
        endDate: {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        },
      },
      {
        // Requests that span the date range
        startDate: { $lte: new Date(req.query.startDate as string) },
        endDate: { $gte: new Date(req.query.endDate as string) },
      },
    ];
  }
  
  // Execute query with pagination
  const timeOffRequests = await TimeOffRequest.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName')
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await TimeOffRequest.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    data: timeOffRequests,
    meta: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

/**
 * @desc    Get time off request by ID
 * @route   GET /api/schedule/time-off/:id
 * @access  Private
 */
export const getTimeOffRequestById = asyncHandler(async (req: Request, res: Response) => {
  const timeOffRequest = await TimeOffRequest.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName');
  
  if (!timeOffRequest) {
    throw new AppError('Time off request not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: timeOffRequest,
  });
});

/**
 * @desc    Create new time off request
 * @route   POST /api/schedule/time-off
 * @access  Private
 */
export const createTimeOffRequest = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, reason, notes } = req.body;
  
  // Create time off request
  const timeOffRequest = await TimeOffRequest.create({
    user: req.user.id,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    notes,
    status: 'pending',
  });
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.SCHEDULE_CREATE,
    description: 'Created new time off request',
    details: {
      timeOffRequestId: timeOffRequest._id,
      startDate,
      endDate,
      reason,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({
    status: 'success',
    data: timeOffRequest,
  });
});

/**
 * @desc    Update time off request status (approve/reject)
 * @route   PATCH /api/schedule/time-off/:id
 * @access  Private/Admin
 */
export const updateTimeOffRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = req.body;
  
  const timeOffRequest = await TimeOffRequest.findById(req.params.id);
  
  if (!timeOffRequest) {
    throw new AppError('Time off request not found', 404);
  }
  
  // Update status
  timeOffRequest.status = status;
  if (notes) timeOffRequest.notes = notes;
  
  // Set approver if approved or rejected
  if (status === 'approved' || status === 'rejected') {
    timeOffRequest.approvedBy = req.user.id;
  }
  
  await timeOffRequest.save();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.SCHEDULE_UPDATE,
    description: `${status === 'approved' ? 'Approved' : 'Rejected'} time off request`,
    details: {
      timeOffRequestId: timeOffRequest._id,
      userId: timeOffRequest.user,
      status,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: timeOffRequest,
  });
});

/**
 * @desc    Delete time off request
 * @route   DELETE /api/schedule/time-off/:id
 * @access  Private
 */
export const deleteTimeOffRequest = asyncHandler(async (req: Request, res: Response) => {
  const timeOffRequest = await TimeOffRequest.findById(req.params.id);
  
  if (!timeOffRequest) {
    throw new AppError('Time off request not found', 404);
  }
  
  // Only allow users to delete their own pending requests
  if (
    timeOffRequest.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to delete this time off request', 403);
  }
  
  // Only allow deletion of pending requests
  if (timeOffRequest.status !== 'pending' && req.user.role !== 'admin') {
    throw new AppError('Cannot delete a request that has already been processed', 400);
  }
  
  await timeOffRequest.remove();
  
  // Log activity
  await ActivityLog.create({
    user: req.user.id,
    activityType: ActivityType.SCHEDULE_DELETE,
    description: 'Deleted time off request',
    details: {
      timeOffRequestId: timeOffRequest._id,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
