export enum SaleStatus {
  COMPLETED = 'completed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
}

export interface SaleItem {
  _id?: string;
  product: string | {
    _id: string;
    name: string;
    sku: string;
    barcode?: string;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  batchNumber: string;
  expiryDate?: string;
  notes?: string;
}

export interface Sale {
  _id: string;
  customer: string | {
    _id: string;
    firstName: string;
    lastName: string;
    customerNumber: string;
  };
  saleNumber: string;
  saleDate: string;
  status: SaleStatus;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit' | 'multiple';
  notes?: string;
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  location: string | {
    _id: string;
    name: string;
  };
  receiptGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleFormData {
  customer: string;
  saleDate?: string;
  items: {
    product: string;
    productName?: string; // Added to store product name
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number; // Required field
    finalPrice: number; // Required field
    batchNumber: string;
    expiryDate?: string;
    notes?: string;
  }[];
  discount?: number;
  tax?: number;
  subtotal?: number; // Added to store total subtotal
  totalDiscount?: number; // Added to store total discount
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'multiple';
  notes?: string;
  location: string;
}

export interface SaleUpdateData {
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'multiple';
  discount?: number;
  tax?: number;
  notes?: string;
  receiptGenerated?: boolean;
}

export interface SaleReceiptData {
  saleNumber: string;
  date: string;
  customer: {
    name: string;
    id: string;
  };
  soldBy: string;
  location: string;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
}
