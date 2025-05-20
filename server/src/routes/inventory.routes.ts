import { Router } from 'express';
import {
  getLowStockAlerts,
  getExpiringStockAlerts,
  getInventoryValuation,
  getInventoryMovement,
  sendExpiryNotifications,
} from '../controllers/inventory.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import { validate } from '../middleware/validation.middleware';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import { z } from 'zod';

const router = Router();

// Protect all routes
router.use(protect);

// Get low stock alerts
router.get(
  '/low-stock',
  cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
  getLowStockAlerts
);

// Get expiring stock alerts
router.get(
  '/expiring',
  cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
  getExpiringStockAlerts
);

// Get inventory valuation
router.get(
  '/valuation',
  cacheMiddleware({ expiration: 600 }), // Cache for 10 minutes
  getInventoryValuation
);

// Get inventory movement history
router.get(
  '/movement',
  cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
  getInventoryMovement
);

// Send expiry notifications
router.post(
  '/send-expiry-notifications',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  sendExpiryNotifications
);

// TODO: Implement these routes when the controllers are ready
// // Get inventory by location
// router.get('/by-location', getInventoryByLocation);

// // Get inventory movements with filtering
// router.get('/movements', getInventoryMovements);

// // Adjust inventory
// const adjustInventorySchema = z.object({
//   body: z
//     .object({
//       medicationId: z.string().min(1, 'Medication ID is required').optional(),
//       productId: z.string().min(1, 'Product ID is required').optional(),
//       batchNumber: z.string().min(1, 'Batch number is required'),
//       quantity: z.number().int('Quantity must be an integer'),
//       reason: z.string().min(1, 'Reason is required'),
//       location: z.string().min(1, 'Location is required').optional(),
//     })
//     .refine((data) => data.medicationId || data.productId, {
//       message: 'Either medicationId or productId is required',
//       path: ['medicationId', 'productId'],
//     })
//     .refine((data) => !data.productId || data.location, {
//       message: 'Location is required when adjusting product inventory',
//       path: ['location'],
//     }),
// });

// router.post(
//   '/adjust',
//   restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
//   validate(adjustInventorySchema),
//   adjustInventory
// );

export default router;
