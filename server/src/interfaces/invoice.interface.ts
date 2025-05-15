import { Document, Types } from 'mongoose';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum InvoiceType {
  SALES = 'sales',
  PURCHASE = 'purchase',
}

export interface IInvoiceItem {
  product: Types.ObjectId;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  _id?: Types.ObjectId;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customer?: Types.ObjectId;
  supplier?: Types.ObjectId;
  type: InvoiceType;
  status: InvoiceStatus;
  items: Types.DocumentArray<IInvoiceItem>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  notes?: string;
  termsAndConditions?: string;
  createdBy: Types.ObjectId;
  sale?: Types.ObjectId;
  purchaseOrder?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IInvoiceCreate {
  invoiceDate?: Date;
  dueDate?: Date;
  customer?: string;
  supplier?: string;
  type: InvoiceType;
  items: Omit<IInvoiceItem, 'subtotal'>[];
  discount?: number;
  tax?: number;
  notes?: string;
  termsAndConditions?: string;
  sale?: string;
  purchaseOrder?: string;
}

export interface IInvoiceUpdate {
  invoiceDate?: Date;
  dueDate?: Date;
  status?: InvoiceStatus;
  items?: Omit<IInvoiceItem, 'subtotal'>[];
  discount?: number;
  tax?: number;
  amountPaid?: number;
  notes?: string;
  termsAndConditions?: string;
}
