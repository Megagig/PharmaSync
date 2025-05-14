import { Router } from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getPrescriptionReport,
  getPatientReport,
} from '../controllers/reports.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get sales report
router.get(
  '/sales',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  getSalesReport
);

// Get inventory report
router.get(
  '/inventory',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  getInventoryReport
);

// Get prescription report
router.get(
  '/prescriptions',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  getPrescriptionReport
);

// Get patient report
router.get(
  '/patients',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  getPatientReport
);

export default router;
