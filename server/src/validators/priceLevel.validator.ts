import { z } from 'zod';

export const createPriceLevelSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    description: z.string().optional(),
    markupPercentage: z.number().nonnegative('Markup percentage must be non-negative').max(1000, 'Markup percentage cannot exceed 1000%').optional(),
    markdownPercentage: z.number().nonnegative('Markdown percentage must be non-negative').max(100, 'Markdown percentage cannot exceed 100%').optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updatePriceLevelSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    code: z.string().optional(),
    description: z.string().optional(),
    markupPercentage: z.number().nonnegative('Markup percentage must be non-negative').max(1000, 'Markup percentage cannot exceed 1000%').optional(),
    markdownPercentage: z.number().nonnegative('Markdown percentage must be non-negative').max(100, 'Markdown percentage cannot exceed 100%').optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Price level ID is required'),
  }),
});
