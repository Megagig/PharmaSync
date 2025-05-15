import { Router } from 'express';
import {
  getAllPriceLevels,
  getAllActivePriceLevels,
  getPriceLevelById,
  createPriceLevel,
  updatePriceLevel,
  deletePriceLevel,
  setPriceLevelAsDefault,
} from '../controllers/priceLevel.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPriceLevelSchema,
  updatePriceLevelSchema,
} from '../validators/priceLevel.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all active price levels (no pagination)
router.get('/active', getAllActivePriceLevels);

// Get all price levels and create price level
router
  .route('/')
  .get(getAllPriceLevels)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(createPriceLevelSchema),
    createPriceLevel
  );

// Get, update, and delete price level by ID
router
  .route('/:id')
  .get(getPriceLevelById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updatePriceLevelSchema),
    updatePriceLevel
  )
  .delete(
    restrictTo([RoleType.ADMIN]),
    deletePriceLevel
  );

// Set price level as default
router.patch(
  '/:id/set-default',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  setPriceLevelAsDefault
);

export default router;
