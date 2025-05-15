import { z } from 'zod';
import { InvoiceStatus, InvoiceType } from '../interfaces/invoice.interface';

const invoiceItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  tax: z.number().nonnegative('Tax must be non-negative').optional(),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    invoiceDate: z.string().optional(),
    dueDate: z.string().min(1, 'Due date is required'),
    customer: z.string().optional(),
    supplier: z.string().optional(),
    type: z.enum(Object.values(InvoiceType) as [string, ...string[]]),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    sale: z.string().optional(),
    purchaseOrder: z.string().optional(),
  })
  .refine(
    (data) => {
      // For sales invoices, customer is required
      if (data.type === InvoiceType.SALES) {
        return !!data.customer;
      }
      // For purchase invoices, supplier is required
      if (data.type === InvoiceType.PURCHASE) {
        return !!data.supplier;
      }
      return true;
    },
    {
      message: 'Customer is required for sales invoices, supplier is required for purchase invoices',
      path: ['customer', 'supplier'],
    }
  ),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    invoiceDate: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(Object.values(InvoiceStatus) as [string, ...string[]]).optional(),
    items: z.array(invoiceItemSchema).optional(),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    amountPaid: z.number().nonnegative('Amount paid must be non-negative').optional(),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
  }),
});
