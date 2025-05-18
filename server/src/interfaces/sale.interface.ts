import { Document, Types } from 'mongoose';

export enum SaleStatus {
  COMPLETED = 'completed',
  VOIDED = 'voided',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  OVERPAID = 'overpaid',
  REFUNDED = 'refunded',
}

export interface SaleItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  finalPrice: number;
  batchNumber: string;
  expiryDate?: Date;
  notes?: string;
}

export interface ISale extends Document {
  items: SaleItem[];
  customer: Types.ObjectId;
  saleNumber: string;
  subtotal: number;
  totalDiscount: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  status: SaleStatus;
  saleDate: Date;
  createdBy: Types.ObjectId;
  location: Types.ObjectId;
  receiptGenerated: boolean;
  voidedBy?: Types.ObjectId;
  voidedAt?: Date;
  voidReason?: string;
}

export interface ISaleCreate {
  customer: string;
  saleDate?: Date;
  items: Omit<SaleItem, 'subtotal'>[];
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
