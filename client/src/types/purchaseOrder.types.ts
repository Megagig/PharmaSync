export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  PARTIAL = 'partial',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export interface PurchaseOrderItem {
  _id?: string;
  medication: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  receivedQuantity?: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
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
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderFormData {
  supplier: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  items: {
    medication: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
  discount?: number;
  tax?: number;
  shippingCost?: number;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
}

export interface PurchaseOrderReceiveData {
  deliveryDate?: string;
  items: {
    itemId: string;
    receivedQuantity: number;
    batchNumber: string;
    expiryDate: string;
  }[];
  notes?: string;
}

export interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrder[];
  currentPurchaseOrder: PurchaseOrder | null;
  isLoading: boolean;
  error: string | null;
  totalPurchaseOrders: number;
  totalPages: number;
  currentPage: number;
}
