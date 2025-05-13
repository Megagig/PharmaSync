import { Dosage } from './medication.types';

export enum PrescriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface PrescriptionItem {
  _id?: string;
  medication: string;
  dosage: Dosage;
  quantity: number;
  refills: number;
  refillsRemaining: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface DispensingRecord {
  _id?: string;
  date: string;
  quantity: number;
  batchNumber: string;
  dispensedBy: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patient: string;
  prescriber: string;
  prescriptionNumber: string;
  prescriptionDate: string;
  expiryDate: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  dispensingHistory: DispensingRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionFormData {
  patient: string;
  prescriptionDate?: string;
  expiryDate: string;
  notes?: string;
}

export interface PrescriptionItemFormData {
  medication: string;
  dosage: Dosage;
  quantity: number;
  refills: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface DispensingFormData {
  items: {
    itemId: string;
    quantity: number;
    batchNumber: string;
  }[];
  notes?: string;
}

export interface PrescriptionsState {
  prescriptions: Prescription[];
  currentPrescription: Prescription | null;
  isLoading: boolean;
  error: string | null;
  totalPrescriptions: number;
  totalPages: number;
  currentPage: number;
}
