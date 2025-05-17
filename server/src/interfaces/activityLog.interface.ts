import { Document, Types } from 'mongoose';

export enum ActivityType {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  TWO_FACTOR_ENABLE = 'two_factor_enable',
  TWO_FACTOR_DISABLE = 'two_factor_disable',

  // User Management
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REMOVE = 'role_remove',

  // Role Management
  ROLE_CREATED = 'role_created',
  ROLE_UPDATED = 'role_updated',
  ROLE_DELETED = 'role_deleted',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',

  // Patient Management
  PATIENT_CREATE = 'patient_create',
  PATIENT_UPDATE = 'patient_update',
  PATIENT_DELETE = 'patient_delete',
  PATIENT_ALLERGY_ADD = 'patient_allergy_add',
  PATIENT_ALLERGY_UPDATE = 'patient_allergy_update',
  PATIENT_ALLERGY_REMOVE = 'patient_allergy_remove',

  // Inventory Management
  PRODUCT_CREATE = 'product_create',
  PRODUCT_UPDATE = 'product_update',
  PRODUCT_DELETE = 'product_delete',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_COUNT = 'stock_count',

  // Sales Management
  SALE_CREATE = 'sale_create',
  SALE_UPDATE = 'sale_update',
  SALE_VOID = 'sale_void',
  SALE_REFUND = 'sale_refund',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_REFUNDED = 'payment_refunded',

  // Schedule Management
  SCHEDULE_CREATE = 'schedule_create',
  SCHEDULE_UPDATE = 'schedule_update',
  SCHEDULE_DELETE = 'schedule_delete',

  // System
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  SETTINGS_UPDATE = 'settings_update',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  ERROR = 'error',
}

export interface ActivityMetadata {
  [key: string]: any; // Allow any type for metadata
}

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: ActivityType;
  description: string;
  metadata?: ActivityMetadata;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLogCreate {
  user: string;
  type: ActivityType;
  description: string;
  metadata?: ActivityMetadata;
  ipAddress?: string;
  userAgent?: string;
}

export interface IActivityLogResponse {
  id: string;
  user:
    | string
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
  type: ActivityType;
  description: string;
  metadata?: ActivityMetadata;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// For backward compatibility
export interface ILegacyActivityLog extends Document {
  user: string;
  activityType: ActivityType;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
