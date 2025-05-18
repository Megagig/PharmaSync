import express from 'express';
import * as receiptController from '../controllers/receipt.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate receipt HTML
router.get(
  '/:transactionId/html',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  receiptController.generateReceiptHtml
);

// Send receipt email
router.post(
  '/:transactionId/email',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  receiptController.sendReceiptEmail
);

// Schedule refill reminder
router.post(
  '/:transactionId/refill-reminder',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  receiptController.scheduleRefillReminder
);

// Send refill reminders (admin only)
router.post(
  '/send-refill-reminders',
  restrictTo([RoleType.ADMIN]),
  receiptController.sendRefillReminders
);

export default router;
