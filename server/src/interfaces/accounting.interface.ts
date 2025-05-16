import { Document, Types } from 'mongoose';

/**
 * Account Types
 */
export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

/**
 * Account Categories
 */
export enum AccountCategory {
  // Asset categories
  CURRENT_ASSET = 'current_asset',
  FIXED_ASSET = 'fixed_asset',
  INVENTORY = 'inventory',
  BANK = 'bank',
  CASH = 'cash',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  OTHER_ASSET = 'other_asset',
  
  // Liability categories
  CURRENT_LIABILITY = 'current_liability',
  LONG_TERM_LIABILITY = 'long_term_liability',
  ACCOUNTS_PAYABLE = 'accounts_payable',
  CREDIT_CARD = 'credit_card',
  OTHER_LIABILITY = 'other_liability',
  
  // Equity categories
  EQUITY_GENERAL = 'equity_general',
  RETAINED_EARNINGS = 'retained_earnings',
  OWNER_EQUITY = 'owner_equity',
  
  // Revenue categories
  SALES_REVENUE = 'sales_revenue',
  SERVICE_REVENUE = 'service_revenue',
  INTEREST_REVENUE = 'interest_revenue',
  OTHER_REVENUE = 'other_revenue',
  
  // Expense categories
  COST_OF_GOODS_SOLD = 'cost_of_goods_sold',
  OPERATING_EXPENSE = 'operating_expense',
  PAYROLL_EXPENSE = 'payroll_expense',
  TAX_EXPENSE = 'tax_expense',
  INTEREST_EXPENSE = 'interest_expense',
  DEPRECIATION_EXPENSE = 'depreciation_expense',
  OTHER_EXPENSE = 'other_expense',
}

/**
 * Account Status
 */
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

/**
 * Journal Entry Status
 */
export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  REVERSED = 'reversed',
}

/**
 * Journal Entry Type
 */
export enum JournalEntryType {
  MANUAL = 'manual',
  SYSTEM = 'system',
  RECURRING = 'recurring',
  ADJUSTMENT = 'adjustment',
  CLOSING = 'closing',
}

/**
 * Financial Period Status
 */
export enum FinancialPeriodStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  LOCKED = 'locked',
}

/**
 * Tax Type
 */
export enum TaxType {
  VAT = 'vat',
  SALES_TAX = 'sales_tax',
  INCOME_TAX = 'income_tax',
  WITHHOLDING_TAX = 'withholding_tax',
}

/**
 * Chart of Accounts Interface
 */
export interface IAccount extends Document {
  accountNumber: string;
  name: string;
  description?: string;
  type: AccountType;
  category: AccountCategory;
  parentAccount?: Types.ObjectId;
  isSubAccount: boolean;
  status: AccountStatus;
  balance: number;
  openingBalance: number;
  currentBalance: number;
  isSystemAccount: boolean;
  isLocked: boolean;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

/**
 * Journal Entry Line Item Interface
 */
export interface IJournalEntryItem {
  account: Types.ObjectId;
  description?: string;
  debit: number;
  credit: number;
  _id?: Types.ObjectId;
}

/**
 * Journal Entry Interface
 */
export interface IJournalEntry extends Document {
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  status: JournalEntryStatus;
  type: JournalEntryType;
  items: Types.DocumentArray<IJournalEntryItem>;
  totalDebit: number;
  totalCredit: number;
  isRecurring: boolean;
  recurringInterval?: string;
  recurringEndDate?: Date;
  notes?: string;
  attachments?: string[];
  relatedEntity?: {
    entityType: 'sale' | 'purchase' | 'expense' | 'payment' | 'invoice' | 'other';
    entityId: Types.ObjectId;
  };
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  postedBy?: Types.ObjectId;
  postedAt?: Date;
  reversedBy?: Types.ObjectId;
  reversedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

/**
 * General Ledger Entry Interface
 */
export interface IGeneralLedgerEntry extends Document {
  account: Types.ObjectId;
  journalEntry: Types.ObjectId;
  date: Date;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

/**
 * Financial Period Interface
 */
export interface IFinancialPeriod extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  status: FinancialPeriodStatus;
  isFiscalYear: boolean;
  notes?: string;
  closedBy?: Types.ObjectId;
  closedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

/**
 * Tax Configuration Interface
 */
export interface ITaxConfiguration extends Document {
  name: string;
  type: TaxType;
  rate: number;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  accountId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}
