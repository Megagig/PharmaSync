import { Router } from 'express';
import {
  getAllInventoryMovements,
  getInventoryMovementById,
  createInventoryMovement,
  updateInventoryMovement,
  approveInventoryMovement,
  completeInventoryMovement,
  cancelInventoryMovement,
} from '../controllers/inventoryMovement.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createInventoryMovementSchema,
  updateInventoryMovementSchema,
  approveInventoryMovementSchema,
  completeInventoryMovementSchema,
  cancelInventoryMovementSchema,
} from '../validators/inventoryMovement.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all inventory movements and create inventory movement
router
  .route('/')
  .get(getAllInventoryMovements)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    validate(createInventoryMovementSchema),
    createInventoryMovement
  );

// Get and update inventory movement by ID
router
  .route('/:id')
  .get(getInventoryMovementById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST, RoleType.PHARMACY_TECHNICIAN]),
    validate(updateInventoryMovementSchema),
    updateInventoryMovement
  );

// Approve inventory movement
router.patch(
  '/:id/approve',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(approveInventoryMovementSchema),
  approveInventoryMovement
);

// Complete inventory movement
router.patch(
  '/:id/complete',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(completeInventoryMovementSchema),
  completeInventoryMovement
);

// Cancel inventory movement
router.patch(
  '/:id/cancel',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(cancelInventoryMovementSchema),
  cancelInventoryMovement
);

export default router;
