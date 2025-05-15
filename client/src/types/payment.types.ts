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

export interface Payment {
  _id: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  direction: PaymentDirection;
  customer?: string | {
    _id: string;
    firstName: string;
    lastName: string;
    customerNumber: string;
  };
  supplier?: string | {
    _id: string;
    name: string;
    supplierCode: string;
  };
  invoice?: string | {
    _id: string;
    invoiceNumber: string;
    invoiceDate: string;
    total: number;
  };
  sale?: string | {
    _id: string;
    saleNumber: string;
    saleDate: string;
    total: number;
  };
  purchaseOrder?: string | {
    _id: string;
    orderNumber: string;
    orderDate: string;
    total: number;
  };
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFormData {
  amount: number;
  paymentDate?: string;
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

export interface PaymentUpdateData {
  amount?: number;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
}
