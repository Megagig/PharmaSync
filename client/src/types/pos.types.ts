import { Product } from './product.types';

export enum PosTransactionType {
  SALE = 'sale',
  RETURN = 'return',
  TRANSFER = 'transfer',
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
  }[];
  change?: number;
}

export interface PosSession {
  _id: string;
  sessionNumber: string;
  status: PosSessionStatus;
  startDate: Date;
  endDate?: Date;
  cashier: string;
  location: string;
  openingBalance?: number;
  closingBalance?: number;
  totalSales?: number;
  totalReturns?: number;
  totalPayments?: number;
}
