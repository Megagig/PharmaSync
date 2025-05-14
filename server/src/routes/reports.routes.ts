import { Router } from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getPrescriptionReport,
  getPatientReport,
} from '../controllers/reports.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get sales report
router.get(
  '/sales',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  getSalesReport
);

// Get inventory report
router.get(
  '/inventory',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  getInventoryReport
);

// Get prescription report
router.get(
  '/prescriptions',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  getPrescriptionReport
);

// Get patient report
router.get(
  '/patients',
  restrictTo(UserRole.ADMIN, UserRole.PHARMACIST),
  getPatientReport
);

export default router;
