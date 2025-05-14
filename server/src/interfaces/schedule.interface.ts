import { Document } from 'mongoose';

export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  FULL_DAY = 'full_day',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface IScheduleShift extends Document {
  user: string; // Reference to user ID
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  notes?: string;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  createdBy: string; // Reference to user ID
  updatedBy?: string; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IScheduleShiftCreate {
  user: string;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  notes?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  createdBy: string;
}

export interface IScheduleShiftUpdate {
  shiftType?: ShiftType;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  updatedBy: string;
}

export interface IScheduleShiftResponse {
  id: string;
  user: string;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  notes?: string;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: Date;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeOffRequest extends Document {
  user: string; // Reference to user ID
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approvedBy?: string; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeOffRequestCreate {
  user: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  notes?: string;
}

export interface ITimeOffRequestUpdate {
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approvedBy?: string;
}

export interface ITimeOffRequestResponse {
  id: string;
  user: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
