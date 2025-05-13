import { z } from 'zod';
import { MedicationType, MedicationCategory } from '../interfaces/medication.interface';

const dosageSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().min(1, 'Route is required'),
  instructions: z.string().optional(),
});

const sideEffectSchema = z.object({
  effect: z.string().min(1, 'Effect is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  frequency: z.enum(['rare', 'uncommon', 'common', 'very_common']),
});

const interactionSchema = z.object({
  interactsWith: z.string().min(1, 'Interacts with is required'),
  effect: z.string().min(1, 'Effect is required'),
  severity: z.enum(['minor', 'moderate', 'major', 'contraindicated']),
});

const inventoryItemSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string(),
  quantity: z.number().int().nonnegative('Quantity must be non-negative'),
  unitPrice: z.number().positive('Unit price must be positive'),
  supplier: z.string().optional(),
  purchaseDate: z.string().optional(),
});

export const createMedicationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    genericName: z.string().min(1, 'Generic name is required'),
    brandName: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(Object.values(MedicationType) as [string, ...string[]]),
    category: z.enum(Object.values(MedicationCategory) as [string, ...string[]]),
    dosageForm: z.string().min(1, 'Dosage form is required'),
    strength: z.string().min(1, 'Strength is required'),
    manufacturer: z.string().optional(),
    nafdacNumber: z.string().optional(),
    requiresPrescription: z.boolean(),
    standardDosage: dosageSchema,
    sideEffects: z.array(sideEffectSchema).optional(),
    interactions: z.array(interactionSchema).optional(),
    contraindications: z.array(z.string()).optional(),
    storageConditions: z.string().optional(),
    inventory: z.array(inventoryItemSchema).optional(),
    minimumStockLevel: z.number().int().nonnegative('Minimum stock level must be non-negative'),
  }),
});

export const updateMedicationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    genericName: z.string().min(1, 'Generic name is required').optional(),
    brandName: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(Object.values(MedicationType) as [string, ...string[]]).optional(),
    category: z.enum(Object.values(MedicationCategory) as [string, ...string[]]).optional(),
    dosageForm: z.string().min(1, 'Dosage form is required').optional(),
    strength: z.string().min(1, 'Strength is required').optional(),
    manufacturer: z.string().optional(),
    nafdacNumber: z.string().optional(),
    requiresPrescription: z.boolean().optional(),
    standardDosage: dosageSchema.optional(),
    storageConditions: z.string().optional(),
    minimumStockLevel: z.number().int().nonnegative('Minimum stock level must be non-negative').optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Medication ID is required'),
  }),
});

export const addInventoryItemSchema = z.object({
  body: inventoryItemSchema,
  params: z.object({
    id: z.string().min(1, 'Medication ID is required'),
  }),
});

export const updateInventoryItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().nonnegative('Quantity must be non-negative'),
    unitPrice: z.number().positive('Unit price must be positive').optional(),
    supplier: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Medication ID is required'),
    itemId: z.string().min(1, 'Inventory item ID is required'),
  }),
});

export const addSideEffectSchema = z.object({
  body: sideEffectSchema,
  params: z.object({
    id: z.string().min(1, 'Medication ID is required'),
  }),
});

export const addInteractionSchema = z.object({
  body: interactionSchema,
  params: z.object({
    id: z.string().min(1, 'Medication ID is required'),
  }),
});

export const addContraindicationSchema = z.object({
  body: z.object({
    contraindication: z.string().min(1, 'Contraindication is required'),
  }),
  params: z.object({
    id: z.string().min(1, 'Medication ID is required'),
  }),
});
