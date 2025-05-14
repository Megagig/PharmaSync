import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplier.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createSupplierSchema,
  updateSupplierSchema,
} from '../validators/supplier.validator';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all suppliers
router.get('/', getAllSuppliers);

// Get supplier by ID
router.get('/:id', getSupplierById);

// Create new supplier
router.post(
  '/',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(createSupplierSchema),
  createSupplier
);

// Update supplier
router.patch(
  '/:id',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(updateSupplierSchema),
  updateSupplier
);

// Delete supplier (soft delete)
router.delete(
  '/:id',
  restrictTo(UserRole.ADMIN),
  deleteSupplier
);

export default router;
