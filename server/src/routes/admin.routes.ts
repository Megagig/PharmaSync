import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Apply authentication middleware to all admin routes
router.use(authenticate);

// Restrict access to admin users
router.use(restrictTo([RoleType.ADMIN]));

// User approval routes
router.get('/pending-users', adminController.getPendingUsers);

router.patch(
  '/approve-user/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'User ID is required'),
      }),
    })
  ),
  adminController.approveUser
);

router.patch(
  '/reject-user/:id',
  validate(
    z.object({
      params: z.object({
        id: z.string().min(1, 'User ID is required'),
      }),
      body: z.object({
        reason: z.string().optional(),
      }),
    })
  ),
  adminController.rejectUser
);

export default router;
