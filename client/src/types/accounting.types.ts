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
 * Account Interface
 */
export interface Account {
  _id: string;
  accountNumber: string;
  name: string;
  description?: string;
  type: AccountType;
  category: AccountCategory;
  parentAccount?: string | {
    _id: string;
    accountNumber: string;
    name: string;
  };
  isSubAccount: boolean;
  status: AccountStatus;
  balance: number;
  openingBalance: number;
  currentBalance: number;
  isSystemAccount: boolean;
  isLocked: boolean;
  notes?: string;
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Account Form Data
 */
export interface AccountFormData {
  accountNumber: string;
  name: string;
  description?: string;
  type: AccountType;
  category: AccountCategory;
  parentAccount?: string;
  isSubAccount?: boolean;
  status?: AccountStatus;
  openingBalance?: number;
  notes?: string;
}

/**
 * Account Update Data
 */
export interface AccountUpdateData {
  name?: string;
  description?: string;
  category?: AccountCategory;
  parentAccount?: string;
  isSubAccount?: boolean;
  status?: AccountStatus;
  notes?: string;
}

/**
 * Journal Entry Item Interface
 */
export interface JournalEntryItem {
  _id?: string;
  account: string | {
    _id: string;
    accountNumber: string;
    name: string;
  };
  description?: string;
  debit: number;
  credit: number;
}

/**
 * Journal Entry Interface
 */
export interface JournalEntry {
  _id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  status: JournalEntryStatus;
  type: JournalEntryType;
  items: JournalEntryItem[];
  totalDebit: number;
  totalCredit: number;
  isRecurring: boolean;
  recurringInterval?: string;
  recurringEndDate?: string;
  notes?: string;
  attachments?: string[];
  relatedEntity?: {
    entityType: 'sale' | 'purchase' | 'expense' | 'payment' | 'invoice' | 'other';
    entityId: string;
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
  postedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  postedAt?: string;
  reversedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reversedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Journal Entry Form Data
 */
export interface JournalEntryFormData {
  date: string;
  description: string;
  reference?: string;
  type?: JournalEntryType;
  items: {
    account: string;
    description?: string;
    debit: number;
    credit: number;
  }[];
  isRecurring?: boolean;
  recurringInterval?: string;
  recurringEndDate?: string;
  notes?: string;
  relatedEntity?: {
    entityType: 'sale' | 'purchase' | 'expense' | 'payment' | 'invoice' | 'other';
    entityId: string;
  };
}

/**
 * Journal Entry Update Data
 */
export interface JournalEntryUpdateData {
  date?: string;
  description?: string;
  reference?: string;
  items?: {
    account: string;
    description?: string;
    debit: number;
    credit: number;
  }[];
  isRecurring?: boolean;
  recurringInterval?: string;
  recurringEndDate?: string;
  notes?: string;
}

/**
 * General Ledger Entry Interface
 */
export interface GeneralLedgerEntry {
  _id: string;
  account: string | {
    _id: string;
    accountNumber: string;
    name: string;
  };
  journalEntry: string | {
    _id: string;
    entryNumber: string;
    description: string;
  };
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Financial Period Interface
 */
export interface FinancialPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: FinancialPeriodStatus;
  isFiscalYear: boolean;
  notes?: string;
  closedBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  closedAt?: string;
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Financial Period Form Data
 */
export interface FinancialPeriodFormData {
  name: string;
  startDate: string;
  endDate: string;
  isFiscalYear?: boolean;
  notes?: string;
}

/**
 * Financial Period Update Data
 */
export interface FinancialPeriodUpdateData {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: FinancialPeriodStatus;
  isFiscalYear?: boolean;
  notes?: string;
}

/**
 * Tax Configuration Interface
 */
export interface TaxConfiguration {
  _id: string;
  name: string;
  type: TaxType;
  rate: number;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  accountId?: string | {
    _id: string;
    accountNumber: string;
    name: string;
  };
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Tax Configuration Form Data
 */
export interface TaxConfigurationFormData {
  name: string;
  type: TaxType;
  rate: number;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  accountId?: string;
}

/**
 * Tax Configuration Update Data
 */
export interface TaxConfigurationUpdateData {
  name?: string;
  type?: TaxType;
  rate?: number;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  accountId?: string;
}
