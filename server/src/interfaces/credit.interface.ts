import { Document, Types } from 'mongoose';

export enum CreditTransactionType {
  CREDIT_INCREASE = 'credit_increase',  // Increase credit limit
  CREDIT_DECREASE = 'credit_decrease',  // Decrease credit limit
  SALE_ON_CREDIT = 'sale_on_credit',    // Sale made on credit
  PAYMENT = 'payment',                  // Payment made against credit
  CREDIT_ADJUSTMENT = 'credit_adjustment', // Manual adjustment
}

export interface ICreditTransaction extends Document {
  customer: Types.ObjectId;
  transactionType: CreditTransactionType;
  amount: number;
  balance: number;  // Credit balance after this transaction
  description: string;
  reference?: string;  // Reference to sale, payment, etc.
  sale?: Types.ObjectId;
  payment?: Types.ObjectId;
  invoice?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface ICreditTransactionCreate {
  customer: string;
  transactionType: CreditTransactionType;
  amount: number;
  description: string;
  reference?: string;
  sale?: string;
  payment?: string;
  invoice?: string;
}

export interface ICreditSummary {
  customer: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  lastTransactionDate: Date;
  transactions: ICreditTransaction[];
}

export interface ICreditLimitUpdate {
  creditLimit: number;
  reason: string;
}

export interface ICreditResponse {
  id: string;
  customer: string;
  transactionType: CreditTransactionType;
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  sale?: string;
  payment?: string;
  invoice?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
