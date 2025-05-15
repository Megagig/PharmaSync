import { Document, Types } from 'mongoose';

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

export interface ISaleItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  batchNumber: string;
  expiryDate?: Date;
  notes?: string;
  _id?: Types.ObjectId;
}

export interface ISale extends Document {
  customer: Types.ObjectId;
  saleNumber: string;
  saleDate: Date;
  status: SaleStatus;
  items: Types.DocumentArray<ISaleItem>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'multiple';
  notes?: string;
  createdBy: Types.ObjectId;
  location: Types.ObjectId;
  receiptGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface ISaleCreate {
  customer: string;
  saleDate?: Date;
  items: Omit<ISaleItem, 'subtotal'>[];
  discount?: number;
  tax?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'multiple';
  notes?: string;
  location: string;
}

export interface ISaleUpdate {
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'multiple';
  discount?: number;
  tax?: number;
  notes?: string;
  receiptGenerated?: boolean;
}
