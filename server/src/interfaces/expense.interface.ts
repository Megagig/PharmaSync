import { Document, Types } from 'mongoose';

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

export interface IExpenseAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
  size: number;
  _id?: Types.ObjectId;
}

export interface IExpense extends Document {
  expenseNumber: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  subcategory?: string;
  date: Date;
  dueDate?: Date;
  status: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  paymentReference?: string;
  supplier?: Types.ObjectId;
  location?: Types.ObjectId;
  attachments?: Types.DocumentArray<IExpenseAttachment>;
  notes?: string;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: Date;
  parentExpense?: Types.ObjectId;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IExpenseCreate {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  subcategory?: string;
  date: Date;
  dueDate?: Date;
  status?: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  paymentReference?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: Date;
  parentExpense?: string;
}

export interface IExpenseUpdate {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  subcategory?: string;
  date?: Date;
  dueDate?: Date;
  status?: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  paymentReference?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: Date;
}
