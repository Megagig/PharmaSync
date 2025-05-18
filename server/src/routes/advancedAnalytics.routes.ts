import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';
import * as advancedAnalyticsController from '../controllers/advancedAnalytics.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Sales trend analytics
router.get(
  '/sales-trend',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.INVENTORY_MANAGER,
  ]),
  advancedAnalyticsController.getSalesTrendAnalytics
);

// Product performance analytics
router.get(
  '/product-performance',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.INVENTORY_MANAGER,
  ]),
  advancedAnalyticsController.getProductPerformanceAnalytics
);

// Customer analytics
router.get(
  '/customer',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.INVENTORY_MANAGER,
  ]),
  advancedAnalyticsController.getCustomerAnalytics
);

// Insurance analytics
router.get(
  '/insurance',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.INVENTORY_MANAGER,
  ]),
  advancedAnalyticsController.getInsuranceAnalytics
);

// Prescription analytics
router.get(
  '/prescription',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.INVENTORY_MANAGER,
  ]),
  advancedAnalyticsController.getPrescriptionAnalytics
);

export default router;
