import express from 'express';
import * as comprehensiveReportsController from '../controllers/comprehensive-reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Permission } from '../interfaces/user.interface';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Patient reports - accessible to admin and pharmacist
router.get(
  '/patient',
  authorize(Permission.VIEW_REPORTS),
  comprehensiveReportsController.getPatientComprehensiveReport
);

// Medication reports - accessible to admin and pharmacist
router.get(
  '/medication',
  authorize(Permission.VIEW_REPORTS),
  comprehensiveReportsController.getMedicationComprehensiveReport
);

// Inventory reports - accessible to admin, pharmacist, and staff
router.get(
  '/inventory',
  authorize(Permission.VIEW_REPORTS),
  comprehensiveReportsController.getInventoryComprehensiveReport
);

// Sales reports - accessible to admin, pharmacist, and staff
router.get(
  '/sales',
  authorize(Permission.VIEW_REPORTS),
  comprehensiveReportsController.getSalesComprehensiveReport
);

// Financial reports - accessible to admin only
router.get(
  '/financial',
  authorize(Permission.VIEW_REPORTS),
  comprehensiveReportsController.getFinancialComprehensiveReport
);

// Administrative reports - accessible to admin only
router.get(
  '/administrative',
  authorize(Permission.VIEW_REPORTS),
  comprehensiveReportsController.getAdministrativeComprehensiveReport
);

export default router;
