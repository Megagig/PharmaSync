import { z } from 'zod';
import { CustomerType, HealthcareProfessionalType } from '../interfaces/customer.interface';

const customerAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Nigeria'),
  isDefault: z.boolean().optional(),
});

export const createCustomerSchema = z.object({
  body: z.object({
    customerNumber: z.string().optional(),
    type: z.enum(Object.values(CustomerType) as [string, ...string[]]),
    healthcareProfessionalType: z.enum(Object.values(HealthcareProfessionalType) as [string, ...string[]]).optional(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone number is required'),
    addresses: z.array(customerAddressSchema).min(1, 'At least one address is required'),
    organization: z.string().optional(),
    taxId: z.string().optional(),
    priceLevel: z.string().min(1, 'Price level is required'),
    creditLimit: z.number().nonnegative('Credit limit must be non-negative').optional(),
    notes: z.string().optional(),
    patientId: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    type: z.enum(Object.values(CustomerType) as [string, ...string[]]).optional(),
    healthcareProfessionalType: z.enum(Object.values(HealthcareProfessionalType) as [string, ...string[]]).optional(),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone number is required').optional(),
    addresses: z.array(customerAddressSchema).optional(),
    organization: z.string().optional(),
    taxId: z.string().optional(),
    priceLevel: z.string().min(1, 'Price level is required').optional(),
    creditLimit: z.number().nonnegative('Credit limit must be non-negative').optional(),
    currentBalance: z.number().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
    patientId: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
});

export const addCustomerAddressSchema = z.object({
  body: customerAddressSchema,
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
});

export const updateCustomerAddressSchema = z.object({
  body: customerAddressSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
    addressId: z.string().min(1, 'Address ID is required'),
  }),
});
