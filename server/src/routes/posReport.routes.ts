import express from 'express';
import * as posReportController from '../controllers/posReport.controller';
import { protect, restrictTo } from '../middleware/auth';
import { RoleType } from '../interfaces/role.interface';

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate sales report
router.post(
  '/sales',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
    RoleType.CASHIER,
  ]),
  posReportController.generateSalesReport
);

// Generate inventory report
router.post(
  '/inventory',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
  ]),
  posReportController.generateInventoryReport
);

// Generate customer report
router.post(
  '/customers',
  restrictTo([
    RoleType.ADMIN,
    RoleType.INVENTORY_MANAGER,
    RoleType.PHARMACIST,
  ]),
  posReportController.generateCustomerReport
);

export default router;
