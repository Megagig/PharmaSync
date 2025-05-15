import { Document } from 'mongoose';

export enum AppointmentType {
  FOLLOW_UP = 'follow_up',
  INITIAL_CONSULTATION = 'initial_consultation',
  MEDICATION_REVIEW = 'medication_review',
  COUNSELING = 'counseling',
  OTHER = 'other',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface IAppointment extends Document {
  title: string;
  patientId: string;
  patientName: string;
  startTime: Date;
  endTime: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  description?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
