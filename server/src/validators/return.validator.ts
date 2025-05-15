import { z } from 'zod';
import { ReturnStatus, RefundStatus } from '../interfaces/return.interface';

const returnItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  reason: z.string().min(1, 'Reason is required'),
  condition: z.enum(['good', 'damaged', 'expired']),
  returnToStock: z.boolean().optional(),
});

export const createReturnSchema = z.object({
  body: z.object({
    sale: z.string().min(1, 'Sale ID is required'),
    returnDate: z.string().optional(),
    items: z.array(returnItemSchema).min(1, 'At least one item is required'),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    notes: z.string().optional(),
  }),
});

export const updateReturnSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(ReturnStatus) as [string, ...string[]]).optional(),
    notes: z.string().optional(),
  }),
});

export const approveReturnSchema = z.object({
  body: z.object({
    approvedBy: z.string().min(1, 'Approver ID is required'),
    notes: z.string().optional(),
  }),
});

export const processRefundSchema = z.object({
  body: z.object({
    refundStatus: z.enum(Object.values(RefundStatus) as [string, ...string[]]),
    refundAmount: z.number().nonnegative('Refund amount must be non-negative'),
    refundMethod: z.enum(['cash', 'card', 'transfer', 'credit', 'store_credit']).optional(),
    refundReference: z.string().optional(),
    refundDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});
