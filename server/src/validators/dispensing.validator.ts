import { z } from 'zod';
import { DispensingStatus } from '../interfaces/dispensing.interface';

const dispensingItemSchema = z.object({
  medication: z.string().min(1, 'Medication ID is required'),
  prescriptionItem: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  notes: z.string().optional(),
});

export const createDispensingSchema = z.object({
  body: z.object({
    patient: z.string().min(1, 'Patient ID is required'),
    prescription: z.string().optional(),
    dispensingDate: z.string().optional(),
    items: z.array(dispensingItemSchema).min(1, 'At least one item is required'),
    paymentMethod: z
      .enum(['cash', 'card', 'insurance', 'credit', 'other'])
      .optional(),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    notes: z.string().optional(),
  }),
});

export const updateDispensingSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(DispensingStatus) as [string, ...string[]]).optional(),
    paymentMethod: z
      .enum(['cash', 'card', 'insurance', 'credit', 'other'])
      .optional(),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    notes: z.string().optional(),
    receiptGenerated: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Dispensing ID is required'),
  }),
});

export const addDispensingItemSchema = z.object({
  body: dispensingItemSchema,
  params: z.object({
    id: z.string().min(1, 'Dispensing ID is required'),
  }),
});

export const updateDispensingItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive').optional(),
    unitPrice: z.number().nonnegative('Unit price must be non-negative').optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Dispensing ID is required'),
    itemId: z.string().min(1, 'Dispensing item ID is required'),
  }),
});

export const generateReceiptSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Dispensing ID is required'),
  }),
});

export const returnDispensingSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Return reason is required'),
    items: z.array(
      z.object({
        itemId: z.string().min(1, 'Item ID is required'),
        quantity: z.number().int().positive('Quantity must be positive'),
      })
    ).min(1, 'At least one item is required'),
  }),
  params: z.object({
    id: z.string().min(1, 'Dispensing ID is required'),
  }),
});
