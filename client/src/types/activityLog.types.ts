export enum ActivityType {
  // Authentication activities
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  
  // User management activities
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  
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
  
  // Supplier activities
  SUPPLIER_CREATE = 'supplier_create',
  SUPPLIER_UPDATE = 'supplier_update',
  SUPPLIER_DELETE = 'supplier_delete',
  
  // Purchase order activities
  PURCHASE_ORDER_CREATE = 'purchase_order_create',
  PURCHASE_ORDER_UPDATE = 'purchase_order_update',
  PURCHASE_ORDER_DELETE = 'purchase_order_delete',
  PURCHASE_ORDER_APPROVE = 'purchase_order_approve',
  PURCHASE_ORDER_RECEIVE = 'purchase_order_receive',
  
  // Schedule activities
  SCHEDULE_CREATE = 'schedule_create',
  SCHEDULE_UPDATE = 'schedule_update',
  SCHEDULE_DELETE = 'schedule_delete',
  
  // System activities
  SYSTEM_ERROR = 'system_error',
  SYSTEM_WARNING = 'system_warning',
  SYSTEM_INFO = 'system_info',
}

export interface ActivityLogUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ActivityLog {
  id: string;
  user: string | ActivityLogUser;
  activityType: ActivityType;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ActivityByType {
  _id: ActivityType;
  count: number;
}

export interface ActivityByUser {
  userId: string;
  userName: string;
  userEmail: string;
  count: number;
}

export interface ActivityByDay {
  date: string;
  count: number;
}

export interface ActivityStats {
  activityByType: ActivityByType[];
  activityByUser: ActivityByUser[];
  activityByDay: ActivityByDay[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface ActivityLogsState {
  activityLogs: ActivityLog[];
  currentActivityLog: ActivityLog | null;
  activityTypes: ActivityType[];
  activityStats: ActivityStats | null;
  isLoading: boolean;
  error: string | null;
  totalActivityLogs: number;
  totalPages: number;
  currentPage: number;
}
