import { z } from 'zod';
import {
  ExpenseCategory,
  ExpenseStatus,
  PaymentMethod,
  RecurrenceInterval,
} from '../interfaces/expense.interface';

export const expenseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  subcategory: z
    .string()
    .max(50, 'Subcategory must be less than 50 characters')
    .optional(),
  date: z.string().or(z.date()).optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  // These fields are still in the schema but all optional
  status: z
    .nativeEnum(ExpenseStatus, {
      errorMap: () => ({ message: 'Invalid expense status' }),
    })
    .optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  paymentMethod: z
    .nativeEnum(PaymentMethod, {
      errorMap: () => ({ message: 'Invalid payment method' }),
    })
    .optional(),
  paymentDate: z.string().or(z.date()).optional(),
  paymentReference: z
    .string()
    .max(50, 'Payment reference must be less than 50 characters')
    .optional(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z
    .nativeEnum(RecurrenceInterval, {
      errorMap: () => ({ message: 'Invalid recurrence interval' }),
    })
    .optional(),
  recurrenceEndDate: z.string().or(z.date()).optional(),
  parentExpense: z.string().optional(),
});

export const expenseUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  category: z
    .nativeEnum(ExpenseCategory, {
      errorMap: () => ({ message: 'Invalid expense category' }),
    })
    .optional(),
  subcategory: z
    .string()
    .max(50, 'Subcategory must be less than 50 characters')
    .optional(),
  date: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  status: z
    .nativeEnum(ExpenseStatus, {
      errorMap: () => ({ message: 'Invalid expense status' }),
    })
    .optional(),
  paymentMethod: z
    .nativeEnum(PaymentMethod, {
      errorMap: () => ({ message: 'Invalid payment method' }),
    })
    .optional(),
  paymentDate: z.string().or(z.date()).optional(),
  paymentReference: z
    .string()
    .max(50, 'Payment reference must be less than 50 characters')
    .optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z
    .nativeEnum(RecurrenceInterval, {
      errorMap: () => ({ message: 'Invalid recurrence interval' }),
    })
    .optional(),
  recurrenceEndDate: z.string().or(z.date()).optional(),
});
