import { z } from 'zod';
import { SaleStatus, PaymentStatus } from '../interfaces/sale.interface';

const saleItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const createSaleSchema = z.object({
  body: z.object({
    customer: z.string().min(1, 'Customer ID is required'),
    saleDate: z.string().optional(),
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    paymentMethod: z
      .enum(['cash', 'card', 'transfer', 'credit', 'multiple'])
      .optional(),
    notes: z.string().optional(),
    location: z.string().min(1, 'Location ID is required'),
  }),
});

export const updateSaleSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(SaleStatus) as [string, ...string[]]).optional(),
    paymentStatus: z.enum(Object.values(PaymentStatus) as [string, ...string[]]).optional(),
    paymentMethod: z
      .enum(['cash', 'card', 'transfer', 'credit', 'multiple'])
      .optional(),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    notes: z.string().optional(),
    receiptGenerated: z.boolean().optional(),
  }),
});
