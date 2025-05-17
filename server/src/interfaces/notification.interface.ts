import { Document, Types } from 'mongoose';

export enum NotificationType {
  // System notifications
  SYSTEM = 'system',
  MAINTENANCE = 'maintenance',

  // User notifications
  USER_MENTION = 'user_mention',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_UPDATE = 'account_update',

  // Inventory notifications
  LOW_STOCK = 'low_stock',
  STOCK_EXPIRING = 'stock_expiring',
  REORDER_POINT = 'reorder_point',

  // Order notifications
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_APPROVED = 'order_approved',
  ORDER_REJECTED = 'order_rejected',
  ORDER_RECEIVED = 'order_received',

  // Prescription notifications
  PRESCRIPTION_CREATED = 'prescription_created',
  PRESCRIPTION_UPDATED = 'prescription_updated',
  PRESCRIPTION_FILLED = 'prescription_filled',
  PRESCRIPTION_REFILL_DUE = 'prescription_refill_due',

  // Patient notifications
  PATIENT_APPOINTMENT = 'patient_appointment',
  PATIENT_BIRTHDAY = 'patient_birthday',

  // Schedule notifications
  SHIFT_ASSIGNED = 'shift_assigned',
  SHIFT_UPDATED = 'shift_updated',
  SHIFT_REMINDER = 'shift_reminder',
  TIME_OFF_REQUEST = 'time_off_request',
  TIME_OFF_APPROVED = 'time_off_approved',
  TIME_OFF_REJECTED = 'time_off_rejected',

  // Message notifications
  NEW_MESSAGE = 'new_message',

  // Follow-up notifications
  FOLLOW_UP_REMINDER = 'follow_up_reminder',
  SOAP_NOTE_FOLLOW_UP_REMINDER = 'soap_note_follow_up_reminder',

  // Drug therapy problem notifications
  DRUG_THERAPY_PROBLEM_ADDED = 'drug_therapy_problem_added',
  DRUG_THERAPY_PROBLEM_UPDATED = 'drug_therapy_problem_updated',
  DRUG_THERAPY_PROBLEM_RESOLVED = 'drug_therapy_problem_resolved',

  // Care plan notifications
  CARE_PLAN_ADDED = 'care_plan_added',
  CARE_PLAN_UPDATED = 'care_plan_updated',

  // New types
  USER = 'user',
  INVENTORY = 'inventory',
  ORDER = 'order',
  PRESCRIPTION = 'prescription',
  PAYMENT = 'payment',
  APPOINTMENT = 'appointment',
  REMINDER = 'reminder'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  data?: NotificationData;
  link?: string;
  createdAt: Date;
  readAt?: Date;
  updatedAt: Date;
}

export interface INotificationCreate {
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: NotificationData;
  link?: string;
}

export interface INotificationUpdate {
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  isRead?: boolean;
  isArchived?: boolean;
  data?: NotificationData;
  link?: string;
  readAt?: Date;
}

export interface INotificationResponse {
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  data?: NotificationData;
  link?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface INotificationPreference extends Document {
  user: string; // Reference to user ID
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationPreferenceCreate {
  user: string;
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
}

export interface INotificationPreferenceUpdate {
  email?: {
    enabled?: boolean;
    types?: NotificationType[];
  };
  inApp?: {
    enabled?: boolean;
    types?: NotificationType[];
  };
}

export interface INotificationPreferenceResponse {
  id: string;
  user: string;
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
  createdAt: Date;
  updatedAt: Date;
}
