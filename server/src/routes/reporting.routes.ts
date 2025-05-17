import express from 'express';
import * as reportingController from '../controllers/reporting.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Permission } from '../interfaces/user.interface';

const router = express.Router();

// Apply authentication middleware to all reporting routes
router.use(authenticate);

// Apply authorization middleware to restrict access to admin and pharmacist roles
router.use(authorize(Permission.VIEW_REPORTS));

// Get patient demographics report
router.get('/demographics', reportingController.getPatientDemographicsReport);

// Get medication usage report
router.get('/medication-usage', reportingController.getMedicationUsageReport);

// Get drug therapy problem report
router.get(
  '/drug-therapy-problems',
  reportingController.getDrugTherapyProblemReport
);

// Get patient outcomes report
router.get('/patient-outcomes', reportingController.getPatientOutcomesReport);

// Get all reports
router.get('/all', reportingController.getAllReports);

export default router;
