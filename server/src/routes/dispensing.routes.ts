import { Router } from 'express';
import {
  getAllDispensing,
  getDispensingById,
  createDispensing,
  updateDispensing,
  generateReceipt,
  returnDispensing,
} from '../controllers/dispensing.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createDispensingSchema,
  updateDispensingSchema,
  generateReceiptSchema,
  returnDispensingSchema,
} from '../validators/dispensing.validator';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all dispensing records
router.get('/', getAllDispensing);

// Get dispensing record by ID
router.get('/:id', getDispensingById);

// Create new dispensing record
router.post(
  '/',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.TECHNICIAN),
  validate(createDispensingSchema),
  createDispensing
);

// Update dispensing record
router.patch(
  '/:id',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(updateDispensingSchema),
  updateDispensing
);

// Generate receipt
router.post(
  '/:id/receipt',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.TECHNICIAN),
  validate(generateReceiptSchema),
  generateReceipt
);

// Process return
router.post(
  '/:id/return',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(returnDispensingSchema),
  returnDispensing
);

export default router;
