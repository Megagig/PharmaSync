import { z } from 'zod';
import { PrescriptionStatus } from '../interfaces/prescription.interface';

const dosageSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  instructions: z.string().optional(),
});

const prescriptionItemSchema = z.object({
  medication: z.string().min(1, 'Medication ID is required'),
  dosage: dosageSchema,
  quantity: z.number().int().positive('Quantity must be positive'),
  refills: z.number().int().nonnegative('Refills must be non-negative'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

const dispensingSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  notes: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    patient: z.string().min(1, 'Patient ID is required'),
    prescriptionDate: z.string().optional(),
    expiryDate: z.string(),
    items: z.array(prescriptionItemSchema).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
});

export const updatePrescriptionSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(PrescriptionStatus) as [string, ...string[]]).optional(),
    expiryDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required'),
  }),
});

export const addPrescriptionItemSchema = z.object({
  body: prescriptionItemSchema,
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required'),
  }),
});

export const updatePrescriptionItemSchema = z.object({
  body: z.object({
    dosage: dosageSchema.optional(),
    quantity: z.number().int().positive('Quantity must be positive').optional(),
    refills: z.number().int().nonnegative('Refills must be non-negative').optional(),
    refillsRemaining: z.number().int().nonnegative('Refills remaining must be non-negative').optional(),
    endDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required'),
    itemId: z.string().min(1, 'Prescription item ID is required'),
  }),
});

export const dispenseMedicationSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        itemId: z.string().min(1, 'Prescription item ID is required'),
        quantity: z.number().int().positive('Quantity must be positive'),
        batchNumber: z.string().min(1, 'Batch number is required'),
      })
    ).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required'),
  }),
});
