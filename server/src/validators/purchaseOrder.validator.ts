import { z } from 'zod';
import { PurchaseOrderStatus } from '../interfaces/purchaseOrder.interface';

const purchaseOrderItemSchema = z.object({
  medication: z.string().min(1, 'Medication ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  notes: z.string().optional(),
});

export const createPurchaseOrderSchema = z.object({
  body: z.object({
    supplier: z.string().min(1, 'Supplier ID is required'),
    orderDate: z.string().optional(),
    expectedDeliveryDate: z.string().optional(),
    items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    shippingCost: z.number().nonnegative('Shipping cost must be non-negative').optional(),
    paymentTerms: z
      .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
      .optional(),
    notes: z.string().optional(),
  }),
});

export const updatePurchaseOrderSchema = z.object({
  body: z.object({
    expectedDeliveryDate: z.string().optional(),
    status: z.enum(Object.values(PurchaseOrderStatus) as [string, ...string[]]).optional(),
    discount: z.number().nonnegative('Discount must be non-negative').optional(),
    tax: z.number().nonnegative('Tax must be non-negative').optional(),
    shippingCost: z.number().nonnegative('Shipping cost must be non-negative').optional(),
    paymentTerms: z
      .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
      .optional(),
    paymentStatus: z
      .enum(['unpaid', 'partial', 'paid'])
      .optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Purchase order ID is required'),
  }),
});

export const addPurchaseOrderItemSchema = z.object({
  body: purchaseOrderItemSchema,
  params: z.object({
    id: z.string().min(1, 'Purchase order ID is required'),
  }),
});

export const updatePurchaseOrderItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive').optional(),
    unitPrice: z.number().nonnegative('Unit price must be non-negative').optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Purchase order ID is required'),
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

export const receivePurchaseOrderSchema = z.object({
  body: z.object({
    deliveryDate: z.string().optional(),
    items: z.array(
      z.object({
        itemId: z.string().min(1, 'Item ID is required'),
        receivedQuantity: z.number().int().positive('Received quantity must be positive'),
        batchNumber: z.string().min(1, 'Batch number is required'),
        expiryDate: z.string().min(1, 'Expiry date is required'),
      })
    ).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Purchase order ID is required'),
  }),
});

export const approvePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Purchase order ID is required'),
  }),
});

export const cancelPurchaseOrderSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Cancellation reason is required'),
  }),
  params: z.object({
    id: z.string().min(1, 'Purchase order ID is required'),
  }),
});
