export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum InvoiceType {
  SALES = 'sales',
  PURCHASE = 'purchase',
}

export interface InvoiceItem {
  _id?: string;
  product: string | {
    _id: string;
    name: string;
    sku: string;
    barcode?: string;
  };
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
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
    contactPerson: string;
  };
  type: InvoiceType;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  notes?: string;
  termsAndConditions?: string;
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  sale?: string | {
    _id: string;
    saleNumber: string;
    saleDate: string;
  };
  purchaseOrder?: string | {
    _id: string;
    orderNumber: string;
    orderDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  invoiceDate?: string;
  dueDate: string;
  customer?: string;
  supplier?: string;
  type: InvoiceType;
  items: {
    product: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }[];
  discount?: number;
  tax?: number;
  notes?: string;
  termsAndConditions?: string;
  sale?: string;
  purchaseOrder?: string;
}

export interface InvoiceUpdateData {
  invoiceDate?: string;
  dueDate?: string;
  status?: InvoiceStatus;
  items?: {
    product: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }[];
  discount?: number;
  tax?: number;
  amountPaid?: number;
  notes?: string;
  termsAndConditions?: string;
}
