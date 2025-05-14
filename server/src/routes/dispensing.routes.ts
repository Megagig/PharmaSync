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
import { RoleType } from '../interfaces/role.interface';

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
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
  ]),
  validate(createDispensingSchema),
  createDispensing
);

// Update dispensing record
router.patch(
  '/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updateDispensingSchema),
  updateDispensing
);

// Generate receipt
router.post(
  '/:id/receipt',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
  ]),
  validate(generateReceiptSchema),
  generateReceipt
);

// Process return
router.post(
  '/:id/return',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(returnDispensingSchema),
  returnDispensing
);

export default router;
