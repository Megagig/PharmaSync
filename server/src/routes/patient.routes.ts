import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPatientSchema,
  updatePatientSchema,
  addAllergySchema,
  updateAllergySchema,
  addMedicalConditionSchema,
  updateMedicalConditionSchema,
} from '../validators/patient.validator';
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Get all patients and create patient
router.route('/')
  .get(patientController.getAllPatients)
  .post(
    validate(createPatientSchema),
    patientController.createPatient
  );

// Get, update, and delete patient by ID
router.route('/:id')
  .get(patientController.getPatientById)
  .patch(
    validate(updatePatientSchema),
    patientController.updatePatient
  )
  .delete(
    authorize(UserRole.ADMIN, UserRole.PHARMACIST),
    patientController.deletePatient
  );

// Allergy routes
router.route('/:id/allergies')
  .post(
    validate(addAllergySchema),
    patientController.addAllergy
  );

router.route('/:id/allergies/:allergyId')
  .patch(
    validate(updateAllergySchema),
    patientController.updateAllergy
  )
  .delete(patientController.removeAllergy);

// Medical condition routes
router.route('/:id/conditions')
  .post(
    validate(addMedicalConditionSchema),
    patientController.addMedicalCondition
  );

router.route('/:id/conditions/:conditionId')
  .patch(
    validate(updateMedicalConditionSchema),
    patientController.updateMedicalCondition
  )
  .delete(patientController.removeMedicalCondition);

// Medication routes
router.route('/:id/medications')
  .post(patientController.addMedication);

router.route('/:id/medications/:medicationId')
  .delete(patientController.removeMedication);

export default router;
