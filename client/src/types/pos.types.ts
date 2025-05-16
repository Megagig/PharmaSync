export enum PosSessionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum PosTransactionType {
  SALE = 'sale',
  RETURN = 'return',
  EXCHANGE = 'exchange',
}

export interface PosPaymentMethod {
  _id?: string;
  method: 'cash' | 'card' | 'transfer' | 'credit' | 'gift_card' | 'store_credit';
  amount: number;
  reference?: string;
  cardType?: string;
  cardLast4?: string;
}

export interface PosSession {
  _id: string;
  sessionNumber: string;
  openedBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  closedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  openingTime: string;
  closingTime?: string;
  status: PosSessionStatus;
  location: string | {
    _id: string;
    name: string;
  };
  register: string;
  openingBalance: number;
  expectedClosingBalance: number;
  actualClosingBalance?: number;
  cashVariance?: number;
  notes?: string;
  transactions: string[] | {
    _id: string;
    saleNumber: string;
    saleDate: string;
    total: number;
    paymentStatus: string;
  }[];
  createdAt: string;
  updatedAt: string;
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

export interface PosTransaction {
  _id: string;
  customer: string | {
    _id: string;
    firstName: string;
    lastName: string;
    customerNumber: string;
    email?: string;
    phone?: string;
  };
  saleNumber: string;
  saleDate: string;
  status: string;
  items: {
    _id: string;
    product: string | {
      _id: string;
      name: string;
      sku: string;
      barcode?: string;
    };
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    batchNumber: string;
    expiryDate?: string;
    notes?: string;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string;
  location: string | {
    _id: string;
    name: string;
    address?: string;
  };
  receiptGenerated: boolean;
  transactionType: PosTransactionType;
  posSession: string | {
    _id: string;
    sessionNumber: string;
  };
  register: string;
  cashier: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  paymentMethods: PosPaymentMethod[];
  changeDue: number;
  returnReason?: string;
  originalSale?: string | {
    _id: string;
    saleNumber: string;
    saleDate: string;
    total: number;
  };
  giftCardIssued?: boolean;
  giftCardAmount?: number;
  giftCardNumber?: string;
  storeCreditIssued?: boolean;
  storeCreditAmount?: number;
  createdAt: string;
  updatedAt: string;
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
    batchNumber: string;
    expiryDate?: string;
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

export interface PosReceiptData {
  transactionNumber: string;
  date: string;
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
    discount: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethods: PosPaymentMethod[];
  changeDue: number;
  transactionType: string;
  notes?: string;
}
