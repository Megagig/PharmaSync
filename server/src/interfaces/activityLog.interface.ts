import { Document } from 'mongoose';

export enum ActivityType {
  // Authentication activities
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  LOGIN_FAILED = 'login_failed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  EMAIL_VERIFICATION = 'email_verification',
  TWO_FACTOR_SETUP = 'two_factor_setup',
  TWO_FACTOR_LOGIN = 'two_factor_login',

  // User management activities
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_ACTIVATE = 'user_activate',
  USER_DEACTIVATE = 'user_deactivate',
  USER_PROFILE_UPDATE = 'user_profile_update',
  USER_SETTINGS_UPDATE = 'user_settings_update',

  // Role management activities
  ROLE_CREATED = 'role_created',
  ROLE_UPDATED = 'role_updated',
  ROLE_DELETED = 'role_deleted',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',

  // Security activities
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',

  // Patient activities
  PATIENT_CREATE = 'patient_create',
  PATIENT_UPDATE = 'patient_update',
  PATIENT_DELETE = 'patient_delete',

  // Medication activities
  MEDICATION_CREATE = 'medication_create',
  MEDICATION_UPDATE = 'medication_update',
  MEDICATION_DELETE = 'medication_delete',

  // Prescription activities
  PRESCRIPTION_CREATE = 'prescription_create',
  PRESCRIPTION_UPDATE = 'prescription_update',
  PRESCRIPTION_DELETE = 'prescription_delete',

  // Dispensing activities
  DISPENSING_CREATE = 'dispensing_create',
  DISPENSING_UPDATE = 'dispensing_update',
  DISPENSING_DELETE = 'dispensing_delete',

  // Inventory activities
  INVENTORY_ADJUST = 'inventory_adjust',
  INVENTORY_COUNT = 'inventory_count',
  INVENTORY_EXPIRE = 'inventory_expire',

  // Supplier activities
  SUPPLIER_CREATE = 'supplier_create',
  SUPPLIER_UPDATE = 'supplier_update',
  SUPPLIER_DELETE = 'supplier_delete',

  // Purchase order activities
  PURCHASE_ORDER_CREATE = 'purchase_order_create',
  PURCHASE_ORDER_UPDATE = 'purchase_order_update',
  PURCHASE_ORDER_DELETE = 'purchase_order_delete',
  PURCHASE_ORDER_APPROVE = 'purchase_order_approve',
  PURCHASE_ORDER_REJECT = 'purchase_order_reject',
  PURCHASE_ORDER_RECEIVE = 'purchase_order_receive',

  // Schedule activities
  SCHEDULE_CREATE = 'schedule_create',
  SCHEDULE_UPDATE = 'schedule_update',
  SCHEDULE_DELETE = 'schedule_delete',

  // Report activities
  REPORT_GENERATE = 'report_generate',
  REPORT_EXPORT = 'report_export',
  REPORT_SCHEDULE = 'report_schedule',

  // System activities
  SYSTEM_ERROR = 'system_error',
  SYSTEM_WARNING = 'system_warning',
  SYSTEM_INFO = 'system_info',
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  SYSTEM_UPDATE = 'system_update',
}

export interface IActivityLog extends Document {
  user: string; // Reference to user ID
  type: ActivityType;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IActivityLogCreate {
  user: string;
  type: ActivityType;
  description: string;
  metadata?: any;
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
  metadata?: any;
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
