import { Document } from 'mongoose';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  PARTIAL = 'partial',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export interface IPurchaseOrderItem {
  medication: string; // Reference to medication ID
  quantity: number;
  unitPrice: number;
  subtotal: number;
  receivedQuantity?: number;
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
}

export interface IPurchaseOrder extends Document {
  supplier: string; // Reference to supplier ID
  orderNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  deliveryDate?: Date;
  status: PurchaseOrderStatus;
  items: IPurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  createdBy: string; // Reference to user ID
  approvedBy?: string; // Reference to user ID
  receivedBy?: string; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseOrderCreate {
  supplier: string;
  orderDate?: Date;
  expectedDeliveryDate?: Date;
  items: Omit<IPurchaseOrderItem, 'subtotal'>[];
  discount?: number;
  tax?: number;
  shippingCost?: number;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
}

export interface IPurchaseOrderUpdate {
  expectedDeliveryDate?: Date;
  status?: PurchaseOrderStatus;
  discount?: number;
  tax?: number;
  shippingCost?: number;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  notes?: string;
}

export interface IPurchaseOrderReceive {
  deliveryDate?: Date;
  items: {
    itemId: string;
    receivedQuantity: number;
    batchNumber: string;
    expiryDate: Date;
  }[];
  notes?: string;
}

export interface IPurchaseOrderResponse {
  id: string;
  supplier: string;
  orderNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  deliveryDate?: Date;
  status: PurchaseOrderStatus;
  items: IPurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  receivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
