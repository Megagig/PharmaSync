import { z } from 'zod';
import { LocationType } from '../interfaces/location.interface';

const locationAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Nigeria'),
});

export const createLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    type: z.enum(Object.values(LocationType) as [string, ...string[]]),
    address: locationAddressSchema.optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    manager: z.string().optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    notes: z.string().optional(),
    parentLocation: z.string().optional(),
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    code: z.string().optional(),
    type: z.enum(Object.values(LocationType) as [string, ...string[]]).optional(),
    address: locationAddressSchema.optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    manager: z.string().optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    notes: z.string().optional(),
    parentLocation: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Location ID is required'),
  }),
});
