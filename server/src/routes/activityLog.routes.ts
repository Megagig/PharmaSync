import { Router } from 'express';
import {
  getAllActivityLogs,
  getActivityLogById,
  getUserActivityLogs,
  getMyActivityLogs,
  getActivityTypes,
  getActivityStats,
} from '../controllers/activityLog.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, Permission } from '../interfaces/user.interface';
import { z } from 'zod';

const router = Router();

// Protect all routes
router.use(protect);

// Get activity types
router.get('/types', getActivityTypes);

// Get current user's activity logs
router.get('/me', getMyActivityLogs);

// Admin routes
router.get(
  '/',
  restrictTo(UserRole.ADMIN),
  getAllActivityLogs
);

router.get(
  '/stats',
  restrictTo(UserRole.ADMIN),
  getActivityStats
);

router.get(
  '/:id',
  restrictTo(UserRole.ADMIN),
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'Activity log ID is required'),
      }),
    })
  ),
  getActivityLogById
);

router.get(
  '/user/:userId',
  restrictTo(UserRole.ADMIN),
  validate(
    z.object({
      params: z.object({
        userId: z.string().min(1, 'User ID is required'),
      }),
    })
  ),
  getUserActivityLogs
);

export default router;
