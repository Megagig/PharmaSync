export enum ExpenseCategory {
  RENT = 'rent',
  UTILITIES = 'utilities',
  SALARIES = 'salaries',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  TRANSPORTATION = 'transportation',
  PROFESSIONAL_SERVICES = 'professional_services',
  TRAINING = 'training',
  SOFTWARE = 'software',
  MISCELLANEOUS = 'miscellaneous',
  OTHER = 'other',
  INVENTORY = 'inventory',
  SALARY = 'salary',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHEQUE = 'cheque',
  MOBILE_MONEY = 'mobile_money',
}

export enum RecurrenceInterval {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export interface ExpenseAttachment {
  _id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
  size: number;
}

export interface Expense {
  _id: string;
  expenseNumber: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  subcategory?: string;
  date: string;
  dueDate?: string;
  status: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  paymentReference?: string;
  supplier?:
    | string
    | {
        _id: string;
        name: string;
        supplierCode: string;
      };
  location?:
    | string
    | {
        _id: string;
        name: string;
      };
  attachments?: ExpenseAttachment[];
  notes?: string;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: string;
  parentExpense?:
    | string
    | {
        _id: string;
        expenseNumber: string;
      };
  createdBy:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
      };
  approvedBy?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
      };
  approvedAt?: string;
  rejectedBy?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
      };
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  subcategory?: string;
  date: string;
  dueDate?: string;
  status?: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  paymentReference?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: string;
  parentExpense?: string;
}

export interface ExpenseUpdateData {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  subcategory?: string;
  date?: string;
  dueDate?: string;
  status?: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  paymentReference?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  pendingExpenses: number;
  paidExpenses: number;
  expensesByCategory: {
    category: ExpenseCategory | string;
    amount: number;
    percentage: number;
  }[];
  recentExpenses: Expense[];
}
