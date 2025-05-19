import { z } from 'zod';

const purchaseItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  retailPrice: z
    .number()
    .nonnegative('Retail price must be non-negative')
    .optional(),
  wholesalePrice: z
    .number()
    .nonnegative('Wholesale price must be non-negative')
    .optional(),
  notes: z.string().optional(),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplier: z.string().min(1, 'Supplier ID is required'),
    purchaseDate: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
    discount: z
      .number()
      .nonnegative('Discount must be non-negative')
      .optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    shippingCost: z
      .number()
      .nonnegative('Shipping cost must be non-negative')
      .optional(),
    paymentTerms: z
      .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
      .optional(),
    notes: z.string().optional(),
  }),
});

export const updatePurchaseSchema = z.object({
  body: z.object({
    status: z.enum(['completed', 'cancelled']).optional(),
    discount: z
      .number()
      .nonnegative('Discount must be non-negative')
      .optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    shippingCost: z
      .number()
      .nonnegative('Shipping cost must be non-negative')
      .optional(),
    paymentTerms: z
      .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
      .optional(),
    paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Purchase ID is required'),
  }),
});
