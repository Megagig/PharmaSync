import { Document, Types } from 'mongoose';
import { ISale, SaleStatus, PaymentStatus } from './sale.interface';

export enum PosTransactionType {
  SALE = 'sale',
  RETURN = 'return',
  EXCHANGE = 'exchange',
  VOID = 'void',
  REFUND = 'refund',
  PARTIAL_RETURN = 'partial_return',
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

export enum ReturnReason {
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  WRONG_ITEM = 'wrong_item',
  CUSTOMER_DISSATISFIED = 'customer_dissatisfied',
  ADVERSE_REACTION = 'adverse_reaction',
  PRESCRIPTION_CHANGE = 'prescription_change',
  OTHER = 'other',
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
  returnReason?: ReturnReason;
  returnReasonDetails?: string; // Additional details for return reason
  originalSale?: Types.ObjectId; // For returns/exchanges, reference to the original sale
  returnedItems?: Types.ObjectId[]; // For partial returns, references to returned items
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
  loyaltyPointsReturned?: number; // Loyalty points returned in this transaction
  emailReceipt?: boolean; // Whether to send receipt via email
  emailSent?: boolean; // Whether receipt email was sent
  refillReminder?: boolean; // Whether to send refill reminder
  refillReminderDate?: Date; // When to send refill reminder
  returnPolicy?: string; // Return policy applied to this transaction
  returnPeriod?: number; // Number of days items can be returned
  returnDeadline?: Date; // Last date items can be returned
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
    originalItemId?: string; // For returns, reference to original item
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
  returnReason?: ReturnReason;
  returnReasonDetails?: string;
  originalSale?: string;
  returnedItems?: string[];
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
  loyaltyPointsReturned?: number;
  emailReceipt?: boolean;
  refillReminder?: boolean;
  refillReminderDate?: Date;
  returnPolicy?: string;
  returnPeriod?: number;
  returnDeadline?: Date;
}
