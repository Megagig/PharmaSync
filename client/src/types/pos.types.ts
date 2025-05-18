import { Product } from './product.types';

export enum PosTransactionType {
  SALE = 'sale',
  RETURN = 'return',
  EXCHANGE = 'exchange',
  VOID = 'void'
}

export enum PosSessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  SUSPENDED = 'suspended'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERPAID = 'overpaid'
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PosState {
  cart: CartItem[];
  total: number;
}

export interface PosCartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  tax?: number;
  expiryDate?: string;
  batchNumber?: string;
  unit?: string;
  barcodeScanned?: boolean;
}

export interface PosTransaction {
  _id: string;
  saleNumber: string;
  transactionType: PosTransactionType;
  customer: string;
  location: string;
  cashier: string;
  posSession: string;
  cartItems: PosCartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: string;
  saleDate: Date;
  notes?: string;
  payments?: {
    method: string;
    amount: number;
    reference?: string;
    transactionId?: string;
    provider?: string;
  }[];
  change?: number;
  prescription?: string;
  doctor?: string;
  barcodeScanned?: boolean;
  emailReceipt?: boolean;
  emailSent?: boolean;
  refillReminder?: boolean;
  refillReminderDate?: Date;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
}

export interface PosSession {
  _id: string;
  sessionNumber: string;
  status: PosSessionStatus;
  startDate: Date;
  endDate?: Date;
  cashier: string;
  location: string;
  register: string;
  openingBalance?: number;
  closingBalance?: number;
  expectedClosingBalance?: number;
  actualClosingBalance?: number;
  cashVariance?: number;
  totalSales?: number;
  totalReturns?: number;
  totalPayments?: number;
}

export interface PosSessionFormData {
  openingBalance: number;
  location: string;
  register: string;
  notes?: string;
}

export interface PosSessionCloseData {
  actualClosingBalance: number;
  notes?: string;
}

export interface PosTransactionFormData {
  customer: string;
  transactionType: PosTransactionType;
  posSession: string;
  register: string;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    batchNumber?: string;
    expiryDate?: string;
    barcodeScanned?: boolean;
  }[];
  discount?: number;
  tax?: number;
  paymentMethods: {
    method: string;
    amount: number;
    reference?: string;
    transactionId?: string;
    provider?: string;
  }[];
  notes?: string;
  location: string;
  returnReason?: string;
  originalSale?: string;
  prescription?: string;
  doctor?: string;
  barcodeScanned?: boolean;
  emailReceipt?: boolean;
  refillReminder?: boolean;
  refillReminderDate?: string;
}

export interface PosReceiptData {
  transactionNumber: string;
  date: Date;
  customer: {
    name: string;
    id: string;
    email?: string;
    phone?: string;
  };
  cashier: string;
  location: string;
  address?: string;
  items: {
    product: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethods: {
    method: string;
    amount: number;
    reference?: string;
  }[];
  changeDue: number;
  transactionType: PosTransactionType;
  notes?: string;
  prescription?: {
    number: string;
    date: Date;
  };
  doctor?: {
    name: string;
  };
}
