import { z } from 'zod';
import { BudgetPeriod, BudgetStatus } from '../interfaces/budget.interface';
import { ExpenseCategory } from '../interfaces/expense.interface';

const budgetItemSchema = z.object({
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  subcategory: z.string().max(50, 'Subcategory must be less than 50 characters').optional(),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
});

export const budgetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  period: z.nativeEnum(BudgetPeriod, {
    errorMap: () => ({ message: 'Invalid budget period' }),
  }),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.nativeEnum(BudgetStatus, {
    errorMap: () => ({ message: 'Invalid budget status' }),
  }).optional(),
  items: z.array(budgetItemSchema).min(1, 'At least one budget item is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  location: z.string().optional(),
});

export const budgetUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  period: z.nativeEnum(BudgetPeriod, {
    errorMap: () => ({ message: 'Invalid budget period' }),
  }).optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.nativeEnum(BudgetStatus, {
    errorMap: () => ({ message: 'Invalid budget status' }),
  }).optional(),
  items: z.array(budgetItemSchema).min(1, 'At least one budget item is required').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  location: z.string().optional(),
});
