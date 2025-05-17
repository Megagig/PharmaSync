import { z } from 'zod';
import mongoose from 'mongoose';

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

// Schema for sale items
const saleItemSchema = z.object({
    product: z.string().refine(isValidObjectId, {
        message: 'Invalid product ID',
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    discount: z.number().min(0).max(100).optional(),
});

// Schema for creating a sale
export const createSaleSchema = z.object({
    body: z.object({
        items: z.array(saleItemSchema).min(1, 'At least one item is required'),
        customer: z
            .string()
            .refine(isValidObjectId, {
                message: 'Invalid customer ID',
            })
            .optional(),
        paymentMethod: z.enum(['cash', 'card', 'transfer', 'credit', 'multiple'], {
            errorMap: () => ({ message: 'Invalid payment method' }),
        }),
        notes: z.string().optional(),
    }),
});

// Schema for voiding a sale
export const voidSaleSchema = z.object({
    body: z.object({
        reason: z.string().min(1, 'Void reason is required'),
    }),
    params: z.object({
        id: z.string().refine(isValidObjectId, {
            message: 'Invalid sale ID',
        }),
    }),
});

// Schema for getting sales with filters
export const getSalesSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        customer: z
            .string()
            .refine(isValidObjectId, {
                message: 'Invalid customer ID',
            })
            .optional(),
        status: z.enum(['completed', 'voided']).optional(),
        minAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
        maxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    }),
}); 