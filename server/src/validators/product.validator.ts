import { z } from 'zod';
import { ProductType, ProductCategory } from '../interfaces/product.interface';

const productPriceLevelSchema = z.object({
  name: z.string().min(1, 'Price level name is required'),
  price: z.number().nonnegative('Price must be non-negative'),
});

const productInventoryItemSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  quantity: z.number().int('Quantity must be an integer').nonnegative('Quantity must be non-negative'),
  location: z.string().min(1, 'Location is required'),
  costPrice: z.number().nonnegative('Cost price must be non-negative'),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(Object.values(ProductType) as [string, ...string[]]),
    category: z.enum(Object.values(ProductCategory) as [string, ...string[]]),
    brand: z.string().optional(),
    manufacturer: z.string().optional(),
    requiresPrescription: z.boolean().default(false),
    salesPriceLevels: z.array(productPriceLevelSchema).optional(),
    purchasePriceLevels: z.array(productPriceLevelSchema).optional(),
    defaultSalesPrice: z.number().nonnegative('Default sales price must be non-negative'),
    defaultPurchasePrice: z.number().nonnegative('Default purchase price must be non-negative'),
    minimumStockLevel: z.number().int('Minimum stock level must be an integer').nonnegative('Minimum stock level must be non-negative'),
    maximumStockLevel: z.number().int('Maximum stock level must be an integer').nonnegative('Maximum stock level must be non-negative').optional(),
    reorderPoint: z.number().int('Reorder point must be an integer').nonnegative('Reorder point must be non-negative'),
    reorderQuantity: z.number().int('Reorder quantity must be an integer').nonnegative('Reorder quantity must be non-negative').optional(),
    isActive: z.boolean().optional(),
    isTaxable: z.boolean().optional(),
    taxRate: z.number().nonnegative('Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%').optional(),
    notes: z.string().optional(),
    medicationId: z.string().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(Object.values(ProductType) as [string, ...string[]]).optional(),
    category: z.enum(Object.values(ProductCategory) as [string, ...string[]]).optional(),
    brand: z.string().optional(),
    manufacturer: z.string().optional(),
    requiresPrescription: z.boolean().optional(),
    salesPriceLevels: z.array(productPriceLevelSchema).optional(),
    purchasePriceLevels: z.array(productPriceLevelSchema).optional(),
    defaultSalesPrice: z.number().nonnegative('Default sales price must be non-negative').optional(),
    defaultPurchasePrice: z.number().nonnegative('Default purchase price must be non-negative').optional(),
    minimumStockLevel: z.number().int('Minimum stock level must be an integer').nonnegative('Minimum stock level must be non-negative').optional(),
    maximumStockLevel: z.number().int('Maximum stock level must be an integer').nonnegative('Maximum stock level must be non-negative').optional(),
    reorderPoint: z.number().int('Reorder point must be an integer').nonnegative('Reorder point must be non-negative').optional(),
    reorderQuantity: z.number().int('Reorder quantity must be an integer').nonnegative('Reorder quantity must be non-negative').optional(),
    isActive: z.boolean().optional(),
    isTaxable: z.boolean().optional(),
    taxRate: z.number().nonnegative('Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%').optional(),
    notes: z.string().optional(),
    medicationId: z.string().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const addProductInventoryItemSchema = z.object({
  body: productInventoryItemSchema,
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const updateProductInventoryItemSchema = z.object({
  body: productInventoryItemSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
    itemId: z.string().min(1, 'Inventory item ID is required'),
  }),
});

export const addProductPriceLevelSchema = z.object({
  body: productPriceLevelSchema,
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const updateProductPriceLevelSchema = z.object({
  body: productPriceLevelSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
    levelId: z.string().min(1, 'Price level ID is required'),
  }),
});
