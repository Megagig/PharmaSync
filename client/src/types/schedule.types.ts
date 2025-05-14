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

export interface ScheduleUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ScheduleShift {
  id: string;
  user: string | ScheduleUser;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  notes?: string;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
  createdBy: string | ScheduleUser;
  updatedBy?: string | ScheduleUser;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleShiftFormData {
  user: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
}

export interface TimeOffRequest {
  id: string;
  user: string | ScheduleUser;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approvedBy?: string | ScheduleUser;
  createdAt: string;
  updatedAt: string;
}

export interface TimeOffRequestFormData {
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
}

export interface TimeOffRequestUpdateData {
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface ScheduleState {
  shifts: ScheduleShift[];
  currentShift: ScheduleShift | null;
  timeOffRequests: TimeOffRequest[];
  currentTimeOffRequest: TimeOffRequest | null;
  isLoading: boolean;
  error: string | null;
  totalShifts: number;
  totalShiftPages: number;
  currentShiftPage: number;
  totalTimeOffRequests: number;
  totalTimeOffRequestPages: number;
  currentTimeOffRequestPage: number;
}
