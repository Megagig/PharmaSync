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
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  data?: any;
  link?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  _id: string;
  user: string;
  email: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceUpdateData {
  email?: {
    enabled?: boolean;
    types?: NotificationType[];
  };
  inApp?: {
    enabled?: boolean;
    types?: NotificationType[];
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  isArchived?: boolean;
  type?: NotificationType;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  currentNotification: Notification | null;
  preferences: NotificationPreference | null;
  notificationTypes: NotificationType[];
  isLoading: boolean;
  error: string | null;
  totalNotifications: number;
  totalPages: number;
  currentPage: number;
}
