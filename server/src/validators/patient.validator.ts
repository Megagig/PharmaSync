import { z } from 'zod';
import {
  Gender,
  BloodGroup,
  Genotype,
  MaritalStatus,
  DrugTherapyProblemType,
} from '../interfaces/patient.interface';

// Define all schemas at the top of the file
const allergySchema = z.object({
  allergen: z.string().min(1, 'Allergen is required'),
  reaction: z.string().min(1, 'Reaction is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  dateIdentified: z.string().optional(),
});

const medicalConditionSchema = z.object({
  condition: z.string().min(1, 'Condition is required'),
  diagnosisDate: z.string(),
  status: z.enum(['active', 'resolved', 'in_remission']),
  notes: z.string().optional(),
});

const medicationHistorySchema = z.object({
  medication: z.string().min(1, 'Medication name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
});

const clinicalAssessmentSchema = z.object({
  date: z.string(),
  bloodPressure: z.string().min(1, 'Blood pressure is required'),
  respiratoryRate: z.string().min(1, 'Respiratory rate is required'),
  temperature: z.string().min(1, 'Temperature is required'),
  heartSounds: z.string().min(1, 'Heart sounds description is required'),
  palor: z.boolean(),
  dehydration: z.boolean(),
  notes: z.string().optional(),
});

const laboratoryFindingSchema = z.object({
  date: z.string(),
  pcv: z.string().optional(),
  mcms: z.string().optional(),
  euCr: z.string().optional(),
  fbc: z.string().optional(),
  fbs: z.string().optional(),
  hbA1c: z.string().optional(),
  other: z.record(z.string()).optional(),
  notes: z.string().optional(),
});

const drugTherapyProblemSchema = z.object({
  date: z.string(),
  type: z.enum([
    DrugTherapyProblemType.UNNECESSARY_DRUG_THERAPY,
    DrugTherapyProblemType.WRONG_DRUG,
    DrugTherapyProblemType.DOSAGE_TOO_LOW,
    DrugTherapyProblemType.DOSAGE_TOO_HIGH,
    DrugTherapyProblemType.ADVERSE_DRUG_REACTION,
    DrugTherapyProblemType.INAPPROPRIATE_ADHERENCE,
    DrugTherapyProblemType.NEEDS_ADDITIONAL_DRUG_THERAPY,
  ]),
  description: z.string().min(1, 'Description is required'),
  resolution: z.string().optional(),
  isResolved: z.boolean(),
});

const carePlanSchema = z.object({
  date: z.string(),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  objectives: z.array(z.string()).min(1, 'At least one objective is required'),
  followUpDate: z.string(),
  drugTherapyProblemResolved: z.boolean(),
  needsReview: z.boolean(),
  notes: z.string().optional(),
});

const soapNoteSchema = z.object({
  date: z.string(),
  subjective: z.string().min(1, 'Subjective information is required'),
  objective: z.string().min(1, 'Objective information is required'),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
});

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long'),
    dateOfBirth: z.string(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    bloodGroup: z
      .enum([
        BloodGroup.A_POSITIVE,
        BloodGroup.A_NEGATIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.B_NEGATIVE,
        BloodGroup.AB_POSITIVE,
        BloodGroup.AB_NEGATIVE,
        BloodGroup.O_POSITIVE,
        BloodGroup.O_NEGATIVE,
      ])
      .optional(),
    genotype: z
      .enum([
        Genotype.AA,
        Genotype.AS,
        Genotype.SS,
        Genotype.AC,
        Genotype.SC,
        Genotype.CC,
      ])
      .optional(),
    maritalStatus: z
      .enum([
        MaritalStatus.SINGLE,
        MaritalStatus.MARRIED,
        MaritalStatus.DIVORCED,
        MaritalStatus.WIDOWED,
      ])
      .optional(),
    weight: z.number().positive('Weight must be positive').optional(),
    allergies: z.array(allergySchema).optional(),
    medicalConditions: z.array(medicalConditionSchema).optional(),
    medicationHistory: z.array(medicationHistorySchema).optional(),
    clinicalAssessments: z.array(clinicalAssessmentSchema).optional(),
    laboratoryFindings: z.array(laboratoryFindingSchema).optional(),
    drugTherapyProblems: z.array(drugTherapyProblemSchema).optional(),
    carePlans: z.array(carePlanSchema).optional(),
    soapNotes: z.array(soapNoteSchema).optional(),
    notes: z.string().optional(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long')
      .optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
    phoneNumber: z.string().min(1, 'Phone number is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    bloodGroup: z
      .enum([
        BloodGroup.A_POSITIVE,
        BloodGroup.A_NEGATIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.B_NEGATIVE,
        BloodGroup.AB_POSITIVE,
        BloodGroup.AB_NEGATIVE,
        BloodGroup.O_POSITIVE,
        BloodGroup.O_NEGATIVE,
      ])
      .optional(),
    genotype: z
      .enum([
        Genotype.AA,
        Genotype.AS,
        Genotype.SS,
        Genotype.AC,
        Genotype.SC,
        Genotype.CC,
      ])
      .optional(),
    maritalStatus: z
      .enum([
        MaritalStatus.SINGLE,
        MaritalStatus.MARRIED,
        MaritalStatus.DIVORCED,
        MaritalStatus.WIDOWED,
      ])
      .optional(),
    weight: z.number().positive('Weight must be positive').optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const addAllergySchema = z.object({
  body: allergySchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateAllergySchema = z.object({
  body: allergySchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    allergyId: z.string().min(1, 'Allergy ID is required'),
  }),
});

export const addMedicalConditionSchema = z.object({
  body: medicalConditionSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateMedicalConditionSchema = z.object({
  body: medicalConditionSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    conditionId: z.string().min(1, 'Medical condition ID is required'),
  }),
});

// Medication History Schemas
export const addMedicationHistorySchema = z.object({
  body: medicationHistorySchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateMedicationHistorySchema = z.object({
  body: medicationHistorySchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    medicationId: z.string().min(1, 'Medication history ID is required'),
  }),
});

// Clinical Assessment Schemas
export const addClinicalAssessmentSchema = z.object({
  body: clinicalAssessmentSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateClinicalAssessmentSchema = z.object({
  body: clinicalAssessmentSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    assessmentId: z.string().min(1, 'Clinical assessment ID is required'),
  }),
});

// Laboratory Finding Schemas
export const addLaboratoryFindingSchema = z.object({
  body: laboratoryFindingSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateLaboratoryFindingSchema = z.object({
  body: laboratoryFindingSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    findingId: z.string().min(1, 'Laboratory finding ID is required'),
  }),
});

// Drug Therapy Problem Schemas
export const addDrugTherapyProblemSchema = z.object({
  body: drugTherapyProblemSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateDrugTherapyProblemSchema = z.object({
  body: drugTherapyProblemSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    problemId: z.string().min(1, 'Drug therapy problem ID is required'),
  }),
});

// Care Plan Schemas
export const addCarePlanSchema = z.object({
  body: carePlanSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateCarePlanSchema = z.object({
  body: carePlanSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    planId: z.string().min(1, 'Care plan ID is required'),
  }),
});

// SOAP Note Schemas
export const addSoapNoteSchema = z.object({
  body: soapNoteSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
  }),
});

export const updateSoapNoteSchema = z.object({
  body: soapNoteSchema,
  params: z.object({
    id: z.string().min(1, 'Patient ID is required'),
    noteId: z.string().min(1, 'SOAP note ID is required'),
  }),
});
