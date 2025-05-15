export enum CreditTransactionType {
  CREDIT_INCREASE = 'credit_increase',  // Increase credit limit
  CREDIT_DECREASE = 'credit_decrease',  // Decrease credit limit
  SALE_ON_CREDIT = 'sale_on_credit',    // Sale made on credit
  PAYMENT = 'payment',                  // Payment made against credit
  CREDIT_ADJUSTMENT = 'credit_adjustment', // Manual adjustment
}

export enum CreditStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
}

export interface CreditTransaction {
  _id: string;
  customer: string | {
    _id: string;
    firstName: string;
    lastName: string;
    customerNumber: string;
  };
  transactionType: CreditTransactionType;
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  sale?: string | {
    _id: string;
    saleNumber: string;
    saleDate: string;
  };
  payment?: string | {
    _id: string;
    paymentNumber: string;
    paymentDate: string;
  };
  invoice?: string | {
    _id: string;
    invoiceNumber: string;
    invoiceDate: string;
  };
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreditSummary {
  customer: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  lastTransactionDate: string | null;
  transactions: CreditTransaction[];
}

export interface CreditTransactionFormData {
  transactionType: CreditTransactionType;
  amount: number;
  description: string;
  reference?: string;
  sale?: string;
  payment?: string;
  invoice?: string;
}

export interface CreditLimitUpdateData {
  creditLimit: number;
  reason: string;
}
