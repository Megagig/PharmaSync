import { Document, Types } from 'mongoose';

export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  CANCELLED = 'cancelled',
}

export enum ReminderType {
  INVOICE_DUE = 'invoice_due',
  INVOICE_OVERDUE = 'invoice_overdue',
  PAYMENT_THANK_YOU = 'payment_thank_you',
  CUSTOM = 'custom',
}

export interface IReminder extends Document {
  customer: Types.ObjectId;
  type: ReminderType;
  status: ReminderStatus;
  subject: string;
  message: string;
  scheduledDate: Date;
  sentDate?: Date;
  invoice?: Types.ObjectId;
  payment?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IReminderCreate {
  customer: string;
  type: ReminderType;
  subject: string;
  message: string;
  scheduledDate: Date;
  invoice?: string;
  payment?: string;
}

export interface IReminderUpdate {
  status?: ReminderStatus;
  subject?: string;
  message?: string;
  scheduledDate?: Date;
}

export interface IReminderResponse {
  id: string;
  customer: string;
  type: ReminderType;
  status: ReminderStatus;
  subject: string;
  message: string;
  scheduledDate: Date;
  sentDate?: Date;
  invoice?: string;
  payment?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
