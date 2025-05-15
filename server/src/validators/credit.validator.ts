import { z } from 'zod';
import { CreditTransactionType } from '../interfaces/credit.interface';

export const createCreditTransactionSchema = z.object({
  body: z.object({
    transactionType: z.enum(Object.values(CreditTransactionType) as [string, ...string[]]),
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(1, 'Description is required'),
    reference: z.string().optional(),
    sale: z.string().optional(),
    payment: z.string().optional(),
    invoice: z.string().optional(),
  }),
});

export const updateCreditLimitSchema = z.object({
  body: z.object({
    creditLimit: z.number().nonnegative('Credit limit must be non-negative'),
    reason: z.string().min(1, 'Reason is required'),
  }),
});
