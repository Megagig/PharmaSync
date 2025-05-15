export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
}

export interface ReturnItem {
  _id?: string;
  product: string | {
    _id: string;
    name: string;
    sku: string;
    barcode?: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  batchNumber: string;
  reason: string;
  condition: 'good' | 'damaged' | 'expired';
  returnToStock: boolean;
}

export interface Return {
  _id: string;
  returnNumber: string;
  sale: string | {
    _id: string;
    saleNumber: string;
    saleDate: string;
  };
  customer: string | {
    _id: string;
    firstName: string;
    lastName: string;
    customerNumber: string;
  };
  returnDate: string;
  status: ReturnStatus;
  items: ReturnItem[];
  subtotal: number;
  tax: number;
  total: number;
  refundStatus: RefundStatus;
  refundAmount: number;
  refundMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'store_credit';
  refundReference?: string;
  refundDate?: string;
  notes?: string;
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  processedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReturnFormData {
  sale: string;
  returnDate?: string;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    batchNumber: string;
    reason: string;
    condition: 'good' | 'damaged' | 'expired';
    returnToStock: boolean;
  }[];
  tax?: number;
  notes?: string;
}

export interface ReturnUpdateData {
  status?: ReturnStatus;
  notes?: string;
}

export interface ReturnApproveData {
  approvedBy: string;
  notes?: string;
}

export interface ReturnRefundData {
  refundStatus: RefundStatus;
  refundAmount: number;
  refundMethod?: 'cash' | 'card' | 'transfer' | 'credit' | 'store_credit';
  refundReference?: string;
  refundDate?: string;
  notes?: string;
}
