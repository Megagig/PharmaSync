import { z } from 'zod';
import { MovementType } from '../interfaces/inventoryMovement.interface';

const movementItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
  costPrice: z.number().nonnegative('Cost price must be non-negative'),
  sellingPrice: z.number().nonnegative('Selling price must be non-negative').optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const createInventoryMovementSchema = z.object({
  body: z.object({
    referenceNumber: z.string().optional(),
    type: z.enum(Object.values(MovementType) as [string, ...string[]]),
    date: z.string().optional(),
    sourceLocation: z.string().min(1, 'Source location is required'),
    destinationLocation: z.string().optional(),
    items: z.array(movementItemSchema).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
});

export const updateInventoryMovementSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(MovementType) as [string, ...string[]]).optional(),
    date: z.string().optional(),
    sourceLocation: z.string().min(1, 'Source location is required').optional(),
    destinationLocation: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'approved', 'completed', 'cancelled']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Inventory movement ID is required'),
  }),
});

export const addInventoryMovementItemSchema = z.object({
  body: movementItemSchema,
  params: z.object({
    id: z.string().min(1, 'Inventory movement ID is required'),
  }),
});

export const updateInventoryMovementItemSchema = z.object({
  body: movementItemSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Inventory movement ID is required'),
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

export const approveInventoryMovementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Inventory movement ID is required'),
  }),
});

export const completeInventoryMovementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Inventory movement ID is required'),
  }),
});

export const cancelInventoryMovementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Inventory movement ID is required'),
  }),
});
