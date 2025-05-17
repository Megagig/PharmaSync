import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { cacheMiddleware, clearCache } from '../middleware/cache';
import {
  createPatientSchema,
  updatePatientSchema,
  addAllergySchema,
  updateAllergySchema,
  addMedicalConditionSchema,
  updateMedicalConditionSchema,
  addMedicationHistorySchema,
  updateMedicationHistorySchema,
  addClinicalAssessmentSchema,
  updateClinicalAssessmentSchema,
  addLaboratoryFindingSchema,
  updateLaboratoryFindingSchema,
  addDrugTherapyProblemSchema,
  updateDrugTherapyProblemSchema,
  addCarePlanSchema,
  updateCarePlanSchema,
  addSoapNoteSchema,
  updateSoapNoteSchema,
} from '../validators/patient.validator';
import { Permission } from '../interfaces/user.interface';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Get all patients and create patient
router
  .route('/')
  .get(
    authorize(Permission.VIEW_PATIENTS),
    cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
    patientController.getAllPatients
  )
  .post(
    authorize(Permission.CREATE_PATIENTS),
    validate(createPatientSchema),
    clearCache('GET:/patients'),
    patientController.createPatient
  );

// Get, update, and delete patient by ID
router
  .route('/:id')
  .get(
    authorize(Permission.VIEW_PATIENTS),
    cacheMiddleware({ expiration: 600 }), // Cache for 10 minutes
    patientController.getPatientById
  )
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updatePatientSchema),
    clearCache(['GET:/patients', 'GET:/patients/:id']),
    patientController.updatePatient
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients', 'GET:/patients/:id']),
    patientController.deletePatient
  );

// Allergy routes
router
  .route('/:id/allergies')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addAllergySchema),
    clearCache(['GET:/patients/:id']),
    patientController.addAllergy
  );

router
  .route('/:id/allergies/:allergyId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateAllergySchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateAllergy
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeAllergy
  );

// Medical condition routes
router
  .route('/:id/conditions')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addMedicalConditionSchema),
    clearCache(['GET:/patients/:id']),
    patientController.addMedicalCondition
  );

router
  .route('/:id/conditions/:conditionId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateMedicalConditionSchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateMedicalCondition
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeMedicalCondition
  );

// Medication routes
router
  .route('/:id/medications')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.addMedication
  );

router
  .route('/:id/medications/:medicationId')
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeMedication
  );

// Medication History routes
router
  .route('/:id/medication-history')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addMedicationHistorySchema),
    clearCache(['GET:/patients/:id']),
    patientController.addMedicationHistory
  );

router
  .route('/:id/medication-history/:medicationId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateMedicationHistorySchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateMedicationHistory
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeMedicationHistory
  );

// Clinical Assessment routes
router
  .route('/:id/clinical-assessments')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addClinicalAssessmentSchema),
    clearCache(['GET:/patients/:id']),
    patientController.addClinicalAssessment
  );

router
  .route('/:id/clinical-assessments/:assessmentId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateClinicalAssessmentSchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateClinicalAssessment
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeClinicalAssessment
  );

// Laboratory Finding routes
router
  .route('/:id/laboratory-findings')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addLaboratoryFindingSchema),
    clearCache(['GET:/patients/:id']),
    patientController.addLaboratoryFinding
  );

router
  .route('/:id/laboratory-findings/:findingId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateLaboratoryFindingSchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateLaboratoryFinding
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeLaboratoryFinding
  );

// Drug Therapy Problem routes
router
  .route('/:id/drug-therapy-problems')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addDrugTherapyProblemSchema),
    clearCache(['GET:/patients/:id']),
    patientController.addDrugTherapyProblem
  );

router
  .route('/:id/drug-therapy-problems/:problemId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateDrugTherapyProblemSchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateDrugTherapyProblem
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeDrugTherapyProblem
  );

// Care Plan routes
router
  .route('/:id/care-plans')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addCarePlanSchema),
    clearCache(['GET:/patients/:id']),
    patientController.addCarePlan
  );

router
  .route('/:id/care-plans/:planId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateCarePlanSchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateCarePlan
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeCarePlan
  );

// SOAP Note routes
router
  .route('/:id/soap-notes')
  .post(
    authorize(Permission.EDIT_PATIENTS),
    validate(addSoapNoteSchema),
    clearCache(['GET:/patients/:id']),
    patientController.addSoapNote
  );

router
  .route('/:id/soap-notes/:noteId')
  .patch(
    authorize(Permission.EDIT_PATIENTS),
    validate(updateSoapNoteSchema),
    clearCache(['GET:/patients/:id']),
    patientController.updateSoapNote
  )
  .delete(
    authorize(Permission.EDIT_PATIENTS),
    clearCache(['GET:/patients/:id']),
    patientController.removeSoapNote
  );

export default router;
