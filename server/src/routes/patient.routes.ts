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
import { UserRole } from '../interfaces/user.interface';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Get all patients and create patient
router
  .route('/')
  .get(
    cacheMiddleware({ expiration: 300 }), // Cache for 5 minutes
    patientController.getAllPatients
  )
  .post(
    validate(createPatientSchema),
    async (req, res, next) => {
      // Clear patient cache when a new patient is created
      await clearCache('GET:/patients');
      next();
    },
    patientController.createPatient
  );

// Get, update, and delete patient by ID
router
  .route('/:id')
  .get(
    cacheMiddleware({ expiration: 600 }), // Cache for 10 minutes
    patientController.getPatientById
  )
  .patch(
    validate(updatePatientSchema),
    async (req, res, next) => {
      // Clear specific patient cache when updated
      await clearCache(`GET:/patients/${req.params.id}`);
      // Also clear the all patients list cache
      await clearCache('GET:/patients');
      next();
    },
    patientController.updatePatient
  )
  .delete(
    authorize(UserRole.ADMIN), // Only allow admin to delete patients
    async (req, res, next) => {
      // Clear specific patient cache when deleted
      await clearCache(`GET:/patients/${req.params.id}`);
      // Also clear the all patients list cache
      await clearCache('GET:/patients');
      next();
    },
    patientController.deletePatient
  );

// Allergy routes
router
  .route('/:id/allergies')
  .post(validate(addAllergySchema), patientController.addAllergy);

router
  .route('/:id/allergies/:allergyId')
  .patch(validate(updateAllergySchema), patientController.updateAllergy)
  .delete(patientController.removeAllergy);

// Medical condition routes
router
  .route('/:id/conditions')
  .post(
    validate(addMedicalConditionSchema),
    patientController.addMedicalCondition
  );

router
  .route('/:id/conditions/:conditionId')
  .patch(
    validate(updateMedicalConditionSchema),
    patientController.updateMedicalCondition
  )
  .delete(patientController.removeMedicalCondition);

// Medication routes
router.route('/:id/medications').post(patientController.addMedication);

router
  .route('/:id/medications/:medicationId')
  .delete(patientController.removeMedication);

// Medication History routes
router
  .route('/:id/medication-history')
  .post(
    validate(addMedicationHistorySchema),
    patientController.addMedicationHistory
  );

router
  .route('/:id/medication-history/:medicationId')
  .patch(
    validate(updateMedicationHistorySchema),
    patientController.updateMedicationHistory
  )
  .delete(patientController.removeMedicationHistory);

// Clinical Assessment routes
router
  .route('/:id/clinical-assessments')
  .post(
    validate(addClinicalAssessmentSchema),
    patientController.addClinicalAssessment
  );

router
  .route('/:id/clinical-assessments/:assessmentId')
  .patch(
    validate(updateClinicalAssessmentSchema),
    patientController.updateClinicalAssessment
  )
  .delete(patientController.removeClinicalAssessment);

// Laboratory Finding routes
router
  .route('/:id/laboratory-findings')
  .post(
    validate(addLaboratoryFindingSchema),
    patientController.addLaboratoryFinding
  );

router
  .route('/:id/laboratory-findings/:findingId')
  .patch(
    validate(updateLaboratoryFindingSchema),
    patientController.updateLaboratoryFinding
  )
  .delete(patientController.removeLaboratoryFinding);

// Drug Therapy Problem routes
router
  .route('/:id/drug-therapy-problems')
  .post(
    validate(addDrugTherapyProblemSchema),
    patientController.addDrugTherapyProblem
  );

router
  .route('/:id/drug-therapy-problems/:problemId')
  .patch(
    validate(updateDrugTherapyProblemSchema),
    patientController.updateDrugTherapyProblem
  )
  .delete(patientController.removeDrugTherapyProblem);

// Care Plan routes
router
  .route('/:id/care-plans')
  .post(validate(addCarePlanSchema), patientController.addCarePlan);

router
  .route('/:id/care-plans/:planId')
  .patch(validate(updateCarePlanSchema), patientController.updateCarePlan)
  .delete(patientController.removeCarePlan);

// SOAP Note routes
router
  .route('/:id/soap-notes')
  .post(validate(addSoapNoteSchema), patientController.addSoapNote);

router
  .route('/:id/soap-notes/:noteId')
  .patch(validate(updateSoapNoteSchema), patientController.updateSoapNote)
  .delete(patientController.removeSoapNote);

export default router;
