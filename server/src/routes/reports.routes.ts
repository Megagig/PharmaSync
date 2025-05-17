import { Router } from 'express';
import {
  getSalesReport,
  getInventoryReport,
  getPrescriptionReport,
  getPatientReport,
} from '../controllers/reports.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get sales report
router.get(
  '/sales',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  cacheMiddleware({
    expiration: 600, // Cache for 10 minutes
    keyGenerator: (req) => `cache:reports:sales:${JSON.stringify(req.query)}`,
  }),
  getSalesReport
);

// Get inventory report
router.get(
  '/inventory',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  cacheMiddleware({
    expiration: 600, // Cache for 10 minutes
    keyGenerator: (req) =>
      `cache:reports:inventory:${JSON.stringify(req.query)}`,
  }),
  getInventoryReport
);

// Get prescription report
router.get(
  '/prescriptions',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  cacheMiddleware({
    expiration: 600, // Cache for 10 minutes
    keyGenerator: (req) =>
      `cache:reports:prescriptions:${JSON.stringify(req.query)}`,
  }),
  getPrescriptionReport
);

// Get patient report
router.get(
  '/patients',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  cacheMiddleware({
    expiration: 600, // Cache for 10 minutes
    keyGenerator: (req) =>
      `cache:reports:patients:${JSON.stringify(req.query)}`,
  }),
  getPatientReport
);

export default router;
