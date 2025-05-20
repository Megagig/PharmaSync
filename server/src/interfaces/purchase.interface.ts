import { Document, Types } from 'mongoose';

export enum PurchaseStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IPurchaseItem extends Document {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  retailPrice?: number;
  wholesalePrice?: number;
  subtotal: number;
  notes?: string;
  batchNumber?: string;
  expiryDate?: Date;
  _id: Types.ObjectId;
}

export interface IPurchase extends Document {
  supplier: Types.ObjectId;
  purchaseNumber: string;
  purchaseDate: Date;
  status: PurchaseStatus;
  items: Types.DocumentArray<IPurchaseItem>;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IPurchaseCreate {
  supplier: string;
  purchaseDate?: Date;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    retailPrice?: number;
    wholesalePrice?: number;
    notes?: string;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  discount?: number;
  tax?: number;
  shippingCost?: number;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
}

export interface IPurchaseResponse {
  id: string;
  supplier: string;
  purchaseNumber: string;
  purchaseDate: Date;
  status: PurchaseStatus;
  items: IPurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
