import { z } from 'zod';
import { Gender, BloodGroup } from '../interfaces/patient.interface';

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
    allergies: z.array(allergySchema).optional(),
    medicalConditions: z.array(medicalConditionSchema).optional(),
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
