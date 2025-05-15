import { Document, Types } from 'mongoose';

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
}

export interface IReturnItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  batchNumber: string;
  reason: string;
  condition: 'good' | 'damaged' | 'expired';
  returnToStock: boolean;
  _id?: Types.ObjectId;
}

export interface IReturn extends Document {
  returnNumber: string;
  sale: Types.ObjectId;
  customer: Types.ObjectId;
  returnDate: Date;
  status: ReturnStatus;
  items: Types.DocumentArray<IReturnItem>;
  subtotal: number;
  tax: number;
  total: number;
  refundStatus: RefundStatus;
  refundAmount: number;
  refundMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'store_credit';
  refundReference?: string;
  refundDate?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  processedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IReturnCreate {
  sale: string;
  returnDate?: Date;
  items: Omit<IReturnItem, 'subtotal'>[];
  tax?: number;
  notes?: string;
}

export interface IReturnUpdate {
  status?: ReturnStatus;
  notes?: string;
}

export interface IReturnApprove {
  approvedBy: string;
  notes?: string;
}

export interface IReturnProcess {
  refundStatus: RefundStatus;
  refundAmount: number;
  refundMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'store_credit';
  refundReference?: string;
  refundDate?: Date;
  notes?: string;
}

export interface IReturnResponse {
  id: string;
  returnNumber: string;
  sale: string;
  customer: string;
  returnDate: Date;
  status: ReturnStatus;
  items: IReturnItem[];
  subtotal: number;
  tax: number;
  total: number;
  refundStatus: RefundStatus;
  refundAmount: number;
  refundMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'store_credit';
  refundReference?: string;
  refundDate?: Date;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
