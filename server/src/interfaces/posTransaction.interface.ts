import { Document, Types } from 'mongoose';
import { ISale, SaleStatus, PaymentStatus } from './sale.interface';

export enum PosTransactionType {
  SALE = 'sale',
  RETURN = 'return',
  EXCHANGE = 'exchange',
  VOID = 'void',
}

export interface IPosPaymentMethod {
  method:
    | 'cash'
    | 'card'
    | 'transfer'
    | 'credit'
    | 'gift_card'
    | 'store_credit'
    | 'mobile_money';
  amount: number;
  reference?: string;
  cardType?: string;
  cardLast4?: string;
  transactionId?: string;
  provider?: string; // For mobile money or transfer
  _id?: Types.ObjectId;
}

export interface IPosTransaction extends ISale {
  transactionType: PosTransactionType;
  posSession: Types.ObjectId;
  register: string;
  cashier: Types.ObjectId;
  paymentMethods: Types.DocumentArray<IPosPaymentMethod>;
  changeDue: number;
  discount: number;
  tax: number;
  returnReason?: string;
  originalSale?: Types.ObjectId; // For returns/exchanges, reference to the original sale
  giftCardIssued?: boolean;
  giftCardAmount?: number;
  giftCardNumber?: string;
  storeCreditIssued?: boolean;
  storeCreditAmount?: number;
  prescription?: Types.ObjectId; // Link to prescription if applicable
  doctor?: Types.ObjectId; // Link to doctor if applicable
  barcodeScanned?: boolean; // Whether the product was added via barcode scan
  loyaltyPointsEarned?: number; // Loyalty points earned from this transaction
  loyaltyPointsRedeemed?: number; // Loyalty points redeemed in this transaction
  emailReceipt?: boolean; // Whether to send receipt via email
  emailSent?: boolean; // Whether receipt email was sent
  refillReminder?: boolean; // Whether to send refill reminder
  refillReminderDate?: Date; // When to send refill reminder
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
    method:
      | 'cash'
      | 'card'
      | 'transfer'
      | 'credit'
      | 'gift_card'
      | 'store_credit'
      | 'mobile_money';
    amount: number;
    reference?: string;
    cardType?: string;
    cardLast4?: string;
    transactionId?: string;
    provider?: string;
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
  prescription?: string; // ID of linked prescription
  doctor?: string; // ID of doctor
  barcodeScanned?: boolean;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  emailReceipt?: boolean;
  refillReminder?: boolean;
  refillReminderDate?: Date;
}
