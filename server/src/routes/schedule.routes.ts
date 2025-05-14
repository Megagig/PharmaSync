import { Router } from 'express';
import {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getAllTimeOffRequests,
  getTimeOffRequestById,
  createTimeOffRequest,
  updateTimeOffRequestStatus,
  deleteTimeOffRequest,
} from '../controllers/schedule.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, Permission } from '../interfaces/user.interface';
import { ShiftType, RecurrenceType } from '../interfaces/schedule.interface';
import { z } from 'zod';

const router = Router();

// Protect all routes
router.use(protect);

// Shift routes
router.get('/shifts', getAllShifts);

router.get(
  '/shifts/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'Shift ID is required'),
      }),
    })
  ),
  getShiftById
);

router.post(
  '/shifts',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(
    z.object({
      body: z.object({
        user: z.string().min(1, 'User ID is required'),
        shiftType: z.enum(Object.values(ShiftType) as [string, ...string[]]),
        startTime: z.string().min(1, 'Start time is required'),
        endTime: z.string().min(1, 'End time is required'),
        notes: z.string().optional(),
        isRecurring: z.boolean().optional(),
        recurrenceType: z.enum(Object.values(RecurrenceType) as [string, ...string[]]).optional(),
        recurrenceEndDate: z.string().optional(),
      }),
    })
  ),
  createShift
);

router.patch(
  '/shifts/:id',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(
    z.object({
      body: z.object({
        shiftType: z.enum(Object.values(ShiftType) as [string, ...string[]]).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        notes: z.string().optional(),
        isRecurring: z.boolean().optional(),
        recurrenceType: z.enum(Object.values(RecurrenceType) as [string, ...string[]]).optional(),
        recurrenceEndDate: z.string().optional(),
      }),
      params: z.object({
        id: z.string().min(1, 'Shift ID is required'),
      }),
    })
  ),
  updateShift
);

router.delete(
  '/shifts/:id',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'Shift ID is required'),
      }),
    })
  ),
  deleteShift
);

// Time off request routes
router.get('/time-off', getAllTimeOffRequests);

router.get(
  '/time-off/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'Time off request ID is required'),
      }),
    })
  ),
  getTimeOffRequestById
);

router.post(
  '/time-off',
  validate(
    z.object({
      body: z.object({
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().min(1, 'End date is required'),
        reason: z.string().min(1, 'Reason is required'),
        notes: z.string().optional(),
      }),
    })
  ),
  createTimeOffRequest
);

router.patch(
  '/time-off/:id',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(
    z.object({
      body: z.object({
        status: z.enum(['pending', 'approved', 'rejected']),
        notes: z.string().optional(),
      }),
      params: z.object({
        id: z.string().min(1, 'Time off request ID is required'),
      }),
    })
  ),
  updateTimeOffRequestStatus
);

router.delete(
  '/time-off/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'Time off request ID is required'),
      }),
    })
  ),
  deleteTimeOffRequest
);

export default router;
