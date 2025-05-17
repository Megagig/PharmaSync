import { Document, Types } from 'mongoose';

export enum PrescriptionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export interface IDosageInstructions {
  frequency: string;
  duration: string;
  instructions: string;
  timing?: string;
  route?: string;
  additionalNotes?: string;
}

export interface IPrescriptionItem {
  _id?: Types.ObjectId;
  medication: Types.ObjectId;
  dosage: string;
  quantity: number;
  refills: number;
  refillsRemaining: number;
  startDate?: Date;
  endDate?: Date;
  dosageInstructions: IDosageInstructions;
  notes?: string;
  isNew?: boolean; // Used in Mongoose pre-save hook
}

export interface IDispensing {
  date: Date;
  quantity: number;
  batchNumber: string;
  dispensedBy: Types.ObjectId; // Reference to user ID
  notes?: string;
  _id?: Types.ObjectId;
}

export interface IPrescription extends Document {
  _id: Types.ObjectId;
  patient: Types.ObjectId;
  prescriber: Types.ObjectId;
  prescriptionNumber: string;
  prescriptionDate: Date;
  expiryDate: Date;
  items: IPrescriptionItem[];
  status: PrescriptionStatus;
  issuedDate: Date;
  validUntil: Date;
  dispensingHistory: IDispensing[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionCreate {
  patient: Types.ObjectId;
  prescriber: Types.ObjectId;
  items: IPrescriptionItem[];
  status?: PrescriptionStatus;
  issuedDate?: Date;
  validUntil?: Date;
  notes?: string;
}

export interface IPrescriptionUpdate {
  items?: IPrescriptionItem[];
  status?: PrescriptionStatus;
  validUntil?: Date;
  notes?: string;
}

export interface IPrescriptionResponse {
  id: string;
  patient: string;
  prescriber: string;
  prescriptionNumber: string;
  prescriptionDate: Date;
  expiryDate: Date;
  items: Array<{
    id?: string;
    medication: string;
    dosage: string;
    quantity: number;
    refills: number;
    refillsRemaining: number;
    startDate?: Date;
    endDate?: Date;
    dosageInstructions: IDosageInstructions;
    notes?: string;
  }>;
  status: PrescriptionStatus;
  issuedDate: Date;
  validUntil: Date;
  dispensingHistory: Array<{
    id: string;
    date: Date;
    quantity: number;
    batchNumber: string;
    dispensedBy: string;
    notes?: string;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
