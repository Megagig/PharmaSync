import { z } from 'zod';
import { PaymentMethod, PaymentDirection } from '../interfaces/payment.interface';

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentDate: z.string().optional(),
    paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
    reference: z.string().optional(),
    notes: z.string().optional(),
    direction: z.enum(Object.values(PaymentDirection) as [string, ...string[]]),
    customer: z.string().optional(),
    supplier: z.string().optional(),
    invoice: z.string().optional(),
    sale: z.string().optional(),
    purchaseOrder: z.string().optional(),
  })
  .refine(
    (data) => {
      // For received payments, customer or sale or invoice is required
      if (data.direction === PaymentDirection.RECEIVED) {
        return !!(data.customer || data.sale || data.invoice);
      }
      // For made payments, supplier or purchaseOrder or invoice is required
      if (data.direction === PaymentDirection.MADE) {
        return !!(data.supplier || data.purchaseOrder || data.invoice);
      }
      return true;
    },
    {
      message: 'For received payments, customer, sale, or invoice is required. For made payments, supplier, purchase order, or invoice is required.',
      path: ['customer', 'supplier', 'sale', 'purchaseOrder', 'invoice'],
    }
  ),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    paymentDate: z.string().optional(),
    paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]).optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
});
