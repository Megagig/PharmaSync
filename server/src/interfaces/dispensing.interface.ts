import { Document } from 'mongoose';

export enum DispensingStatus {
  COMPLETED = 'completed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export interface IDispensingItem {
  medication: string; // Reference to medication ID
  prescriptionItem?: string; // Reference to prescription item ID
  quantity: number;
  batchNumber: string;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface IDispensing extends Document {
  patient: string; // Reference to patient ID
  prescription?: string; // Reference to prescription ID
  dispensedBy: string; // Reference to user ID (pharmacist)
  dispensingNumber: string;
  dispensingDate: Date;
  status: DispensingStatus;
  items: IDispensingItem[];
  paymentMethod: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  receiptGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDispensingCreate {
  patient: string;
  prescription?: string;
  dispensingDate?: Date;
  items: Omit<IDispensingItem, 'subtotal'>[];
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface IDispensingUpdate {
  status?: DispensingStatus;
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  discount?: number;
  tax?: number;
  notes?: string;
  receiptGenerated?: boolean;
}

export interface IDispensingResponse {
  id: string;
  patient: string;
  prescription?: string;
  dispensedBy: string;
  dispensingNumber: string;
  dispensingDate: Date;
  status: DispensingStatus;
  items: IDispensingItem[];
  paymentMethod: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  receiptGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
