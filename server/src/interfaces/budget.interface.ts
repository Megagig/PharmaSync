import { Document, Types } from 'mongoose';
import { ExpenseCategory } from './expense.interface';

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export interface IBudgetItem {
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  notes?: string;
  _id?: Types.ObjectId;
}

export interface IBudgetActual {
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  variance: number;
  variancePercentage: number;
  _id?: Types.ObjectId;
}

export interface IBudget extends Document {
  budgetNumber: string;
  title: string;
  description?: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  status: BudgetStatus;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  items: Types.DocumentArray<IBudgetItem>;
  actuals?: Types.DocumentArray<IBudgetActual>;
  notes?: string;
  location?: Types.ObjectId;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  closedBy?: Types.ObjectId;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IBudgetCreate {
  title: string;
  description?: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  status?: BudgetStatus;
  items: Omit<IBudgetItem, '_id'>[];
  notes?: string;
  location?: string;
}

export interface IBudgetUpdate {
  title?: string;
  description?: string;
  period?: BudgetPeriod;
  startDate?: Date;
  endDate?: Date;
  status?: BudgetStatus;
  items?: Omit<IBudgetItem, '_id'>[];
  notes?: string;
  location?: string;
}

export interface IBudgetItemUpdate {
  category?: ExpenseCategory;
  subcategory?: string;
  amount?: number;
  notes?: string;
}
