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
  body: z
    .object({
      medicationId: z.string().min(1, 'Medication ID is required').optional(),
      productId: z.string().min(1, 'Product ID is required').optional(),
      batchNumber: z.string().min(1, 'Batch number is required'),
      quantity: z.number().int('Quantity must be an integer'),
      reason: z.string().min(1, 'Reason is required'),
      location: z.string().min(1, 'Location is required').optional(),
    })
    .refine((data) => data.medicationId || data.productId, {
      message: 'Either medicationId or productId is required',
      path: ['medicationId', 'productId'],
    })
    .refine((data) => !data.productId || data.location, {
      message: 'Location is required when adjusting product inventory',
      path: ['location'],
    }),
});

router.post(
  '/adjust',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(adjustInventorySchema),
  adjustInventory
);

export default router;
