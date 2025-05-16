import express from 'express';
import * as comprehensiveReportsController from '../controllers/comprehensive-reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces/user.interface';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Patient reports - accessible to admin and pharmacist
router.get(
  '/patient',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  comprehensiveReportsController.getPatientComprehensiveReport
);

// Medication reports - accessible to admin and pharmacist
router.get(
  '/medication',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  comprehensiveReportsController.getMedicationComprehensiveReport
);

// Inventory reports - accessible to admin, pharmacist, and manager
router.get(
  '/inventory',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.MANAGER),
  comprehensiveReportsController.getInventoryComprehensiveReport
);

// Sales reports - accessible to admin, pharmacist, and manager
router.get(
  '/sales',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.MANAGER),
  comprehensiveReportsController.getSalesComprehensiveReport
);

// Financial reports - accessible to admin only
router.get(
  '/financial',
  authorize(UserRole.ADMIN),
  comprehensiveReportsController.getFinancialComprehensiveReport
);

// Administrative reports - accessible to admin only
router.get(
  '/administrative',
  authorize(UserRole.ADMIN),
  comprehensiveReportsController.getAdministrativeComprehensiveReport
);

export default router;
