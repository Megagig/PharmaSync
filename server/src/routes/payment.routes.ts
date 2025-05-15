import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
} from '../controllers/payment.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPaymentSchema,
  updatePaymentSchema,
} from '../validators/payment.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all payments and create payment
router
  .route('/')
  .get(getAllPayments)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    validate(createPaymentSchema),
    createPayment
  );

// Get, update payment by ID
router
  .route('/:id')
  .get(getPaymentById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updatePaymentSchema),
    updatePayment
  );

export default router;
