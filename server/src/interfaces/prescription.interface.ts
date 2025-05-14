import { Document, Types } from 'mongoose';
import { IDosage } from './medication.interface';

export enum PrescriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IPrescriptionItem extends Document {
  medication: Types.ObjectId; // Reference to medication ID
  dosage: IDosage;
  quantity: number;
  refills: number;
  refillsRemaining: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  _id: Types.ObjectId;
}

export interface IDispensing extends Document {
  date: Date;
  quantity: number;
  batchNumber: string;
  dispensedBy: Types.ObjectId; // Reference to user ID
  notes?: string;
  _id: Types.ObjectId;
}

export interface IPrescription extends Document {
  patient: Types.ObjectId; // Reference to patient ID
  prescriber: Types.ObjectId; // Reference to user ID (pharmacist)
  prescriptionNumber: string;
  prescriptionDate: Date;
  expiryDate: Date;
  status: PrescriptionStatus;
  items: Types.DocumentArray<IPrescriptionItem>;
  dispensingHistory: Types.DocumentArray<IDispensing>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IPrescriptionCreate {
  patient: string;
  prescriptionDate: Date;
  expiryDate: Date;
  items: Omit<IPrescriptionItem, 'refillsRemaining'>[];
  notes?: string;
}

export interface IPrescriptionUpdate {
  status?: PrescriptionStatus;
  expiryDate?: Date;
  notes?: string;
}

export interface IPrescriptionResponse {
  id: string;
  patient: string;
  prescriber: string;
  prescriptionNumber: string;
  prescriptionDate: Date;
  expiryDate: Date;
  status: PrescriptionStatus;
  items: IPrescriptionItem[];
  dispensingHistory: IDispensing[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
