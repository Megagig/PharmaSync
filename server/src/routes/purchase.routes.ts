import { Router } from 'express';
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  cancelPurchase,
} from '../controllers/purchase.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from '../validators/purchase.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all purchases
router.get('/', getAllPurchases);

// Get purchase by ID
router.get('/:id', getPurchaseById);

// Create new purchase
router.post(
  '/',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(createPurchaseSchema),
  createPurchase
);

// Update purchase
router.patch(
  '/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updatePurchaseSchema),
  updatePurchase
);

// Cancel purchase
router.patch(
  '/:id/cancel',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  cancelPurchase
);

export default router;
