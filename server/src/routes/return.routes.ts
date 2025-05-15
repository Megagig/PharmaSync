import { Router } from 'express';
import {
  getAllReturns,
  getReturnById,
  createReturn,
  updateReturn,
  approveReturn,
  processRefund,
} from '../controllers/return.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReturnSchema,
  updateReturnSchema,
  approveReturnSchema,
  processRefundSchema,
} from '../validators/return.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all returns and create return
router
  .route('/')
  .get(getAllReturns)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    validate(createReturnSchema),
    createReturn
  );

// Get, update return by ID
router
  .route('/:id')
  .get(getReturnById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updateReturnSchema),
    updateReturn
  );

// Approve return
router
  .route('/:id/approve')
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(approveReturnSchema),
    approveReturn
  );

// Process refund
router
  .route('/:id/refund')
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(processRefundSchema),
    processRefund
  );

export default router;
