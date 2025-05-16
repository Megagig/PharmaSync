import { Document, Types } from 'mongoose';
import { ISale, SaleStatus, PaymentStatus } from './sale.interface';

export enum PosTransactionType {
  SALE = 'sale',
  RETURN = 'return',
  EXCHANGE = 'exchange',
}

export interface IPosPaymentMethod {
  method: 'cash' | 'card' | 'transfer' | 'credit' | 'gift_card' | 'store_credit';
  amount: number;
  reference?: string;
  cardType?: string;
  cardLast4?: string;
  _id?: Types.ObjectId;
}

export interface IPosTransaction extends ISale {
  transactionType: PosTransactionType;
  posSession: Types.ObjectId;
  register: string;
  cashier: Types.ObjectId;
  paymentMethods: Types.DocumentArray<IPosPaymentMethod>;
  changeDue: number;
  returnReason?: string;
  originalSale?: Types.ObjectId; // For returns/exchanges, reference to the original sale
  giftCardIssued?: boolean;
  giftCardAmount?: number;
  giftCardNumber?: string;
  storeCreditIssued?: boolean;
  storeCreditAmount?: number;
}

export interface IPosTransactionCreate {
  customer: string;
  transactionType: PosTransactionType;
  posSession: string;
  register: string;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    batchNumber: string;
    expiryDate?: Date;
    notes?: string;
  }[];
  discount?: number;
  tax?: number;
  paymentMethods: {
    method: 'cash' | 'card' | 'transfer' | 'credit' | 'gift_card' | 'store_credit';
    amount: number;
    reference?: string;
    cardType?: string;
    cardLast4?: string;
  }[];
  notes?: string;
  location: string;
  returnReason?: string;
  originalSale?: string;
  giftCardIssued?: boolean;
  giftCardAmount?: number;
  giftCardNumber?: string;
  storeCreditIssued?: boolean;
  storeCreditAmount?: number;
}
