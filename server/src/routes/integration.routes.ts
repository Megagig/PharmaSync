import express from 'express';
import * as integrationController from '../controllers/integration.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces/user.interface';

const router = express.Router();

// Apply authentication middleware to all integration routes
router.use(authenticate);

// Get integration status (admin only)
router.get(
  '/status',
  authorize(UserRole.ADMIN),
  integrationController.getIntegrationStatus
);

// EHR integration routes
router.get('/ehr/patients/search', integrationController.searchEHRPatients);

router.post('/ehr/patients/import', integrationController.importEHRPatient);

// Drug database integration routes
router.get(
  '/drug-database/medications/search',
  integrationController.searchDrugDatabaseMedications
);

router.get(
  '/drug-database/medications/:id',
  integrationController.getMedicationDetails
);

router.post(
  '/drug-database/medications/import',
  integrationController.importDrugDatabaseMedication
);

router.post(
  '/drug-database/interactions/check',
  integrationController.checkDrugInteractions
);

// Pharmacy system integration routes
router.post(
  '/pharmacy-system/inventory/sync',
  authorize(UserRole.ADMIN, UserRole.PHARMACIST),
  integrationController.syncPharmacyInventory
);

router.post(
  '/pharmacy-system/prescriptions/send',
  integrationController.sendPrescriptionToPharmacy
);

// Combined integration routes
router.get(
  '/medications/:id/details',
  integrationController.getMedicationWithAdditionalInfo
);

export default router;
