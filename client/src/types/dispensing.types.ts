export enum DispensingStatus {
  COMPLETED = 'completed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export interface DispensingItem {
  _id?: string;
  medication: string;
  prescriptionItem?: string;
  quantity: number;
  batchNumber: string;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Dispensing {
  id: string;
  patient: string;
  prescription?: string;
  dispensedBy: string;
  dispensingNumber: string;
  dispensingDate: string;
  status: DispensingStatus;
  items: DispensingItem[];
  paymentMethod: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  receiptGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DispensingFormData {
  patient: string;
  prescription?: string;
  dispensingDate?: string;
  items: {
    medication: string;
    prescriptionItem?: string;
    quantity: number;
    batchNumber: string;
    unitPrice: number;
    notes?: string;
  }[];
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface ReturnDispensingData {
  reason: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
}

export interface ReceiptData {
  dispensingNumber: string;
  date: string;
  patient: {
    name: string;
    id: string;
  };
  dispensedBy: string;
  items: {
    medication: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export interface DispensingsState {
  dispensings: Dispensing[];
  currentDispensing: Dispensing | null;
  receiptData: ReceiptData | null;
  isLoading: boolean;
  error: string | null;
  totalDispensings: number;
  totalPages: number;
  currentPage: number;
}
