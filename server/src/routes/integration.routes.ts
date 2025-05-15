import express from 'express';
import * as integrationController from '../controllers/integration.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';

const router = express.Router();

// Apply authentication middleware to all integration routes
router.use(authenticate);

// Get integration status (admin only)
router.get(
  '/status',
  authorize(['admin']),
  integrationController.getIntegrationStatus
);

// EHR integration routes
router.get(
  '/ehr/patients/search',
  integrationController.searchEHRPatients
);

router.post(
  '/ehr/patients/import',
  integrationController.importEHRPatient
);

// Drug database integration routes
router.get(
  '/drug-database/medications/search',
  integrationController.searchDrugDatabaseMedications
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
  authorize(['admin', 'pharmacist']),
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
