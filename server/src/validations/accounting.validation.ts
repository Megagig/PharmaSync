import { z } from 'zod';
import {
  AccountType,
  AccountCategory,
  AccountStatus,
  JournalEntryStatus,
  JournalEntryType,
  FinancialPeriodStatus,
  TaxType,
} from '../interfaces/accounting.interface';

// Account validation schemas
export const accountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.nativeEnum(AccountType, {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  category: z.nativeEnum(AccountCategory, {
    errorMap: () => ({ message: 'Invalid account category' }),
  }),
  parentAccount: z.string().optional(),
  isSubAccount: z.boolean().optional(),
  status: z.nativeEnum(AccountStatus, {
    errorMap: () => ({ message: 'Invalid account status' }),
  }).optional(),
  openingBalance: z.number().optional(),
  notes: z.string().optional(),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  category: z.nativeEnum(AccountCategory, {
    errorMap: () => ({ message: 'Invalid account category' }),
  }).optional(),
  parentAccount: z.string().optional(),
  isSubAccount: z.boolean().optional(),
  status: z.nativeEnum(AccountStatus, {
    errorMap: () => ({ message: 'Invalid account status' }),
  }).optional(),
  notes: z.string().optional(),
});

// Journal Entry validation schemas
const journalEntryItemSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  description: z.string().optional(),
  debit: z.number().min(0, 'Debit must be greater than or equal to 0'),
  credit: z.number().min(0, 'Credit must be greater than or equal to 0'),
});

export const journalEntrySchema = z.object({
  date: z.string().or(z.date()),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  type: z.nativeEnum(JournalEntryType, {
    errorMap: () => ({ message: 'Invalid journal entry type' }),
  }).optional(),
  items: z.array(journalEntryItemSchema).min(1, 'At least one item is required'),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  recurringEndDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
  relatedEntity: z.object({
    entityType: z.enum(['sale', 'purchase', 'expense', 'payment', 'invoice', 'other']),
    entityId: z.string(),
  }).optional(),
});

export const journalEntryUpdateSchema = z.object({
  date: z.string().or(z.date()).optional(),
  description: z.string().min(1, 'Description is required').optional(),
  reference: z.string().optional(),
  items: z.array(journalEntryItemSchema).min(1, 'At least one item is required').optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  recurringEndDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

// Financial Period validation schemas
export const financialPeriodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isFiscalYear: z.boolean().optional(),
  notes: z.string().optional(),
});

export const financialPeriodUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.nativeEnum(FinancialPeriodStatus, {
    errorMap: () => ({ message: 'Invalid financial period status' }),
  }).optional(),
  isFiscalYear: z.boolean().optional(),
  notes: z.string().optional(),
});

// Tax Configuration validation schemas
export const taxConfigurationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(TaxType, {
    errorMap: () => ({ message: 'Invalid tax type' }),
  }),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0').max(100, 'Rate must be less than or equal to 100'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  accountId: z.string().optional(),
});

export const taxConfigurationUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.nativeEnum(TaxType, {
    errorMap: () => ({ message: 'Invalid tax type' }),
  }).optional(),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0').max(100, 'Rate must be less than or equal to 100').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  accountId: z.string().optional(),
});
