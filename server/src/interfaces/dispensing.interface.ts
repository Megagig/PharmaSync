import { Document, Types } from 'mongoose';

export enum DispensingStatus {
  COMPLETED = 'completed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export interface IDispensingItem extends Document {
  medication:
    | Types.ObjectId
    | {
        name: string;
        genericName: string;
        brandName?: string;
        strength: string;
        dosageForm: string;
      }; // Reference to medication ID
  prescriptionItem?: Types.ObjectId; // Reference to prescription item ID
  quantity: number;
  batchNumber: string;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  _id: Types.ObjectId;
}

export interface IDispensing extends Document {
  patient:
    | Types.ObjectId
    | {
        firstName: string;
        lastName: string;
        _id: Types.ObjectId;
      }; // Reference to patient ID
  prescription?: Types.ObjectId; // Reference to prescription ID
  dispensedBy:
    | Types.ObjectId
    | {
        firstName: string;
        lastName: string;
      }; // Reference to user ID (pharmacist)
  dispensingNumber: string;
  dispensingDate: Date;
  status: DispensingStatus;
  items: Types.DocumentArray<IDispensingItem>;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  receiptGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
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
