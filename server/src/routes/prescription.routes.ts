import { Router } from 'express';
import {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  addPrescriptionItem,
  updatePrescriptionItem,
  removePrescriptionItem,
  dispenseMedication,
  cancelPrescription,
} from '../controllers/prescription.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  addPrescriptionItemSchema,
  updatePrescriptionItemSchema,
  dispenseMedicationSchema,
} from '../validators/prescription.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all prescriptions
router.get('/', getAllPrescriptions);

// Get prescription by ID
router.get('/:id', getPrescriptionById);

// Create new prescription
router.post(
  '/',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(createPrescriptionSchema),
  createPrescription
);

// Update prescription
router.patch(
  '/:id',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updatePrescriptionSchema),
  updatePrescription
);

// Cancel prescription
router.patch(
  '/:id/cancel',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  cancelPrescription
);

// Add prescription item
router.post(
  '/:id/items',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(addPrescriptionItemSchema),
  addPrescriptionItem
);

// Update prescription item
router.patch(
  '/:id/items/:itemId',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  validate(updatePrescriptionItemSchema),
  updatePrescriptionItem
);

// Remove prescription item
router.delete(
  '/:id/items/:itemId',
  restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
  removePrescriptionItem
);

// Dispense medication
router.post(
  '/:id/dispense',
  restrictTo([
    RoleType.ADMIN,
    RoleType.PHARMACIST,
    RoleType.PHARMACY_TECHNICIAN,
  ]),
  validate(dispenseMedicationSchema),
  dispenseMedication
);

export default router;
