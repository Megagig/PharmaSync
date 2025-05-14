import { Router } from 'express';
import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  addPurchaseOrderItem,
  updatePurchaseOrderItem,
  removePurchaseOrderItem,
  approvePurchaseOrder,
  markAsOrdered,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} from '../controllers/purchaseOrder.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  addPurchaseOrderItemSchema,
  updatePurchaseOrderItemSchema,
  receivePurchaseOrderSchema,
  approvePurchaseOrderSchema,
  cancelPurchaseOrderSchema,
} from '../validators/purchaseOrder.validator';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all purchase orders
router.get('/', getAllPurchaseOrders);

// Get purchase order by ID
router.get('/:id', getPurchaseOrderById);

// Create new purchase order
router.post(
  '/',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(createPurchaseOrderSchema),
  createPurchaseOrder
);

// Update purchase order
router.patch(
  '/:id',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(updatePurchaseOrderSchema),
  updatePurchaseOrder
);

// Add purchase order item
router.post(
  '/:id/items',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(addPurchaseOrderItemSchema),
  addPurchaseOrderItem
);

// Update purchase order item
router.patch(
  '/:id/items/:itemId',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(updatePurchaseOrderItemSchema),
  updatePurchaseOrderItem
);

// Remove purchase order item
router.delete(
  '/:id/items/:itemId',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  removePurchaseOrderItem
);

// Approve purchase order
router.patch(
  '/:id/approve',
  restrictTo(UserRole.ADMIN),
  validate(approvePurchaseOrderSchema),
  approvePurchaseOrder
);

// Mark purchase order as ordered
router.patch(
  '/:id/order',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(approvePurchaseOrderSchema), // Reuse the same schema
  markAsOrdered
);

// Receive purchase order
router.post(
  '/:id/receive',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.TECHNICIAN),
  validate(receivePurchaseOrderSchema),
  receivePurchaseOrder
);

// Cancel purchase order
router.patch(
  '/:id/cancel',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  validate(cancelPurchaseOrderSchema),
  cancelPurchaseOrder
);

export default router;
