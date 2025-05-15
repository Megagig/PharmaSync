import { Document, Types } from 'mongoose';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHEQUE = 'cheque',
  MOBILE_MONEY = 'mobile_money',
  CREDIT = 'credit',
}

export enum PaymentDirection {
  RECEIVED = 'received', // Money coming in (from customers)
  MADE = 'made',         // Money going out (to suppliers)
}

export interface IPayment extends Document {
  paymentNumber: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  direction: PaymentDirection;
  customer?: Types.ObjectId;
  supplier?: Types.ObjectId;
  invoice?: Types.ObjectId;
  sale?: Types.ObjectId;
  purchaseOrder?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IPaymentCreate {
  amount: number;
  paymentDate?: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  direction: PaymentDirection;
  customer?: string;
  supplier?: string;
  invoice?: string;
  sale?: string;
  purchaseOrder?: string;
}

export interface IPaymentUpdate {
  amount?: number;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
}
