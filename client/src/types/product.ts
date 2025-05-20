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

export interface ProductInventoryItem {
  _id?: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  location: string;
  costPrice: number;
}

export interface ProductPriceLevel {
  _id?: string;
  name: string;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  type: ProductType;
  category: ProductCategory;
  brand?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  inventory: ProductInventoryItem[];
  salesPriceLevels: ProductPriceLevel[];
  purchasePriceLevels: ProductPriceLevel[];
  defaultSalesPrice: number;
  defaultPurchasePrice: number;
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
