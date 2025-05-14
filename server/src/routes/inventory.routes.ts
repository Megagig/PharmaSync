import { Router } from 'express';
import {
  getLowStockAlerts,
  getExpiringStockAlerts,
  getInventoryValuation,
  getInventoryMovement,
  adjustInventory,
} from '../controllers/inventory.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Protect all routes
router.use(protect);

// Get low stock alerts
router.get('/low-stock', getLowStockAlerts);

// Get expiring stock alerts
router.get('/expiring', getExpiringStockAlerts);

// Get inventory valuation
router.get('/valuation', getInventoryValuation);

// Get inventory movement history
router.get('/movement', getInventoryMovement);

// Adjust inventory
const adjustInventorySchema = z.object({
  body: z.object({
    medicationId: z.string().min(1, 'Medication ID is required'),
    batchNumber: z.string().min(1, 'Batch number is required'),
    quantity: z.number().int('Quantity must be an integer'),
    reason: z.string().min(1, 'Reason is required'),
  }),
});

router.post(
  '/adjust',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(adjustInventorySchema),
  adjustInventory
);

export default router;
