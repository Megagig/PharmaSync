import { Document } from 'mongoose';
import { IDosage } from './medication.interface';

export enum PrescriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IPrescriptionItem {
  medication: string; // Reference to medication ID
  dosage: IDosage;
  quantity: number;
  refills: number;
  refillsRemaining: number;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface IDispensing {
  date: Date;
  quantity: number;
  batchNumber: string;
  dispensedBy: string; // Reference to user ID
  notes?: string;
}

export interface IPrescription extends Document {
  patient: string; // Reference to patient ID
  prescriber: string; // Reference to user ID (pharmacist)
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
