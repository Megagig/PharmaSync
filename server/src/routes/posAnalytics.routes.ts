import express from 'express';
import * as posAnalyticsController from '../controllers/posAnalytics.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get dashboard analytics
router.get(
  '/dashboard',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posAnalyticsController.getDashboardAnalytics
);

// Get sales analytics
router.get(
  '/sales',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posAnalyticsController.getSalesAnalytics
);

// Get inventory analytics
router.get(
  '/inventory',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
  ]),
  posAnalyticsController.getInventoryAnalytics
);

export default router;
