import { ExpenseCategory } from './expense.types';

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

export interface BudgetItem {
  _id?: string;
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  notes?: string;
}

export interface BudgetActual {
  _id?: string;
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  variance: number;
  variancePercentage: number;
}

export interface Budget {
  _id: string;
  budgetNumber: string;
  title: string;
  description?: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  items: BudgetItem[];
  actuals?: BudgetActual[];
  notes?: string;
  location?: string | {
    _id: string;
    name: string;
  };
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  closedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  title: string;
  description?: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  status?: BudgetStatus;
  items: Omit<BudgetItem, '_id'>[];
  notes?: string;
  location?: string;
}

export interface BudgetUpdateData {
  title?: string;
  description?: string;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  status?: BudgetStatus;
  items?: Omit<BudgetItem, '_id'>[];
  notes?: string;
  location?: string;
}

export interface BudgetItemUpdateData {
  category?: ExpenseCategory;
  subcategory?: string;
  amount?: number;
  notes?: string;
}

export interface BudgetSummary {
  totalBudgets: number;
  activeBudgets: number;
  totalBudgeted: number;
  totalSpent: number;
  budgetUtilization: number;
  budgetsByPeriod: {
    period: BudgetPeriod;
    count: number;
    totalBudgeted: number;
  }[];
  recentBudgets: Budget[];
}
