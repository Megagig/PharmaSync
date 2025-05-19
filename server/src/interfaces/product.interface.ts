import { Document, Types } from 'mongoose';

export enum ProductType {
  MEDICATION = 'medication',
  MEDICAL_SUPPLY = 'medical_supply',
  EQUIPMENT = 'equipment',
  COSMETIC = 'cosmetic',
  SUPPLEMENT = 'supplement',
  HYGIENE = 'hygiene',
  BABY_CARE = 'baby_care',
  OTHER = 'other',
}

export enum ProductCategory {
  // Medication categories
  ANALGESIC = 'analgesic',
  ANTIBIOTIC = 'antibiotic',
  ANTIHISTAMINE = 'antihistamine',
  ANTIHYPERTENSIVE = 'antihypertensive',
  ANTIDIABETIC = 'antidiabetic',
  ANTIDEPRESSANT = 'antidepressant',
  ANTIPSYCHOTIC = 'antipsychotic',
  ANTICONVULSANT = 'anticonvulsant',
  ANTIVIRAL = 'antiviral',
  ANTIMALARIAL = 'antimalarial',
  NSAID = 'nsaid',
  STEROID = 'steroid',
  VITAMIN = 'vitamin',
  SUPPLEMENT = 'supplement',

  // Medical supply categories
  BANDAGE = 'bandage',
  SYRINGE = 'syringe',
  GLOVE = 'glove',
  MASK = 'mask',
  SANITIZER = 'sanitizer',

  // Equipment categories
  THERMOMETER = 'thermometer',
  BLOOD_PRESSURE_MONITOR = 'blood_pressure_monitor',
  GLUCOSE_METER = 'glucose_meter',

  // Other categories
  COSMETIC = 'cosmetic',
  HYGIENE = 'hygiene',
  BABY_CARE = 'baby_care',
  OTHER = 'other',
}

export interface IProductInventoryItem {
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  location: string;
  costPrice: number;
  _id?: Types.ObjectId;
}

export interface IProductPriceLevel {
  name: string; // e.g., 'retail', 'wholesale', 'special'
  price: number;
  _id?: Types.ObjectId;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  type: ProductType;
  category: ProductCategory;
  brand?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  inventory: IProductInventoryItem[];
  priceLevels: IProductPriceLevel[];
  defaultPrice: number;
  // Price properties
  retailPrice: number;
  wholesalePrice: number;
  costPrice: number;
  minimumStockLevel: number;
  maximumStockLevel?: number;
  reorderPoint: number;
  reorderQuantity?: number;
  isActive: boolean;
  isTaxable: boolean;
  taxRate?: number;
  notes?: string;
  medicationId?: Types.ObjectId; // Reference to medication if type is MEDICATION
  images?: string[];
  tags?: string[];
  totalStock?: number; // Virtual property for total stock across all inventory items
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IProductCreate {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  type: ProductType;
  category: ProductCategory;
  brand?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  defaultPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  costPrice: number;
  priceLevels?: IProductPriceLevel[];
  minimumStockLevel: number;
  maximumStockLevel?: number;
  reorderPoint: number;
  reorderQuantity?: number;
  isActive?: boolean;
  isTaxable?: boolean;
  taxRate?: number;
  notes?: string;
  medicationId?: string;
  images?: string[];
  tags?: string[];
}

export interface IProductUpdate {
  name?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  type?: ProductType;
  category?: ProductCategory;
  brand?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  defaultPrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  isActive?: boolean;
  isTaxable?: boolean;
  taxRate?: number;
  notes?: string;
  medicationId?: string;
  images?: string[];
  tags?: string[];
}

export interface IProductResponse {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  type: ProductType;
  category: ProductCategory;
  brand?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  inventory: IProductInventoryItem[];
  priceLevels: IProductPriceLevel[];
  defaultPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  costPrice: number;
  minimumStockLevel: number;
  maximumStockLevel?: number;
  reorderPoint: number;
  reorderQuantity?: number;
  totalStock: number;
  isActive: boolean;
  isTaxable: boolean;
  taxRate?: number;
  notes?: string;
  medicationId?: string;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
