import { Document } from 'mongoose';

export enum NotificationType {
  FOLLOW_UP_REMINDER = 'follow_up_reminder',
  SOAP_NOTE_FOLLOW_UP_REMINDER = 'soap_note_follow_up_reminder',
  MEDICATION_EXPIRY = 'medication_expiry',
  INVENTORY_LOW = 'inventory_low',
  SYSTEM = 'system',
  PATIENT_ADDED = 'patient_added',
  PATIENT_UPDATED = 'patient_updated',
  MEDICATION_ADDED = 'medication_added',
  MEDICATION_UPDATED = 'medication_updated',
  PRESCRIPTION_ADDED = 'prescription_added',
  PRESCRIPTION_UPDATED = 'prescription_updated',
  DISPENSING_ADDED = 'dispensing_added',
  DISPENSING_UPDATED = 'dispensing_updated',
  CARE_PLAN_ADDED = 'care_plan_added',
  CARE_PLAN_UPDATED = 'care_plan_updated',
  DRUG_THERAPY_PROBLEM_ADDED = 'drug_therapy_problem_added',
  DRUG_THERAPY_PROBLEM_UPDATED = 'drug_therapy_problem_updated',
  DRUG_THERAPY_PROBLEM_RESOLVED = 'drug_therapy_problem_resolved',
}

export interface INotificationData {
  [key: string]: any;
  patientId?: string;
  patientName?: string;
  medicationId?: string;
  medicationName?: string;
  prescriptionId?: string;
  dispensingId?: string;
  carePlanId?: string;
  soapNoteId?: string;
  drugTherapyProblemId?: string;
  followUpDate?: Date;
  expiryDate?: Date;
  quantity?: number;
  threshold?: number;
}

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  data?: INotificationData;
  createdAt: Date;
  updatedAt: Date;
}
