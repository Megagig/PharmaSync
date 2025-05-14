import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Nigeria'),
});

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: addressSchema,
    taxId: z.string().optional(),
    paymentTerms: z
      .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
      .optional(),
    notes: z.string().optional(),
    preferredSupplier: z.boolean().optional(),
    supplierCode: z.string().optional(),
    categories: z.array(z.string()).optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    contactPerson: z.string().min(1, 'Contact person is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone number is required').optional(),
    address: addressSchema.partial().optional(),
    taxId: z.string().optional(),
    paymentTerms: z
      .enum(['prepaid', 'net15', 'net30', 'net60', 'cod'])
      .optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
    preferredSupplier: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Supplier ID is required'),
  }),
});
