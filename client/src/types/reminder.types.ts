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

export interface Reminder {
  _id: string;
  customer: string | {
    _id: string;
    firstName: string;
    lastName: string;
    customerNumber: string;
    email?: string;
    phone?: string;
  };
  type: ReminderType;
  status: ReminderStatus;
  subject: string;
  message: string;
  scheduledDate: string;
  sentDate?: string;
  invoice?: string | {
    _id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    total: number;
    balance: number;
  };
  payment?: string | {
    _id: string;
    paymentNumber: string;
    paymentDate: string;
    amount: number;
  };
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReminderFormData {
  customer: string;
  type: ReminderType;
  subject: string;
  message: string;
  scheduledDate: string;
  invoice?: string;
  payment?: string;
}

export interface ReminderUpdateData {
  status?: ReminderStatus;
  subject?: string;
  message?: string;
  scheduledDate?: string;
}
