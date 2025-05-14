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
import { RoleType } from '../interfaces/role.interface';

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
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(createPurchaseOrderSchema),
  createPurchaseOrder
);

// Update purchase order
router.patch(
  '/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updatePurchaseOrderSchema),
  updatePurchaseOrder
);

// Add purchase order item
router.post(
  '/:id/items',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(addPurchaseOrderItemSchema),
  addPurchaseOrderItem
);

// Update purchase order item
router.patch(
  '/:id/items/:itemId',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updatePurchaseOrderItemSchema),
  updatePurchaseOrderItem
);

// Remove purchase order item
router.delete(
  '/:id/items/:itemId',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  removePurchaseOrderItem
);

// Approve purchase order
router.patch(
  '/:id/approve',
  restrictTo([RoleType.ADMIN]),
  validate(approvePurchaseOrderSchema),
  approvePurchaseOrder
);

// Mark purchase order as ordered
router.patch(
  '/:id/order',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(approvePurchaseOrderSchema), // Reuse the same schema
  markAsOrdered
);

// Receive purchase order
router.post(
  '/:id/receive',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
  ]),
  validate(receivePurchaseOrderSchema),
  receivePurchaseOrder
);

// Cancel purchase order
router.patch(
  '/:id/cancel',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(cancelPurchaseOrderSchema),
  cancelPurchaseOrder
);

export default router;
