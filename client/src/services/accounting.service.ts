import api from './api';
import {
  Account,
  AccountFormData,
  AccountUpdateData,
  JournalEntry,
  JournalEntryFormData,
  JournalEntryUpdateData,
  GeneralLedgerEntry,
  FinancialPeriod,
  FinancialPeriodFormData,
  FinancialPeriodUpdateData,
  TaxConfiguration,
  TaxConfigurationFormData,
  TaxConfigurationUpdateData,
} from '../types/accounting.types';

class AccountingService {
  // Chart of Accounts
  async getAccounts(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: Account[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/accounting/accounts?${queryParams.toString()}`);
    return response.data;
  }

  async getAccountById(id: string): Promise<Account> {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response.data.data;
  }

  async createAccount(accountData: AccountFormData): Promise<Account> {
    const response = await api.post('/accounting/accounts', accountData);
    return response.data.data;
  }

  async updateAccount(id: string, updateData: AccountUpdateData): Promise<Account> {
    const response = await api.patch(`/accounting/accounts/${id}`, updateData);
    return response.data.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await api.delete(`/accounting/accounts/${id}`);
  }

  // Journal Entries
  async getJournalEntries(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: JournalEntry[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/accounting/journal-entries?${queryParams.toString()}`);
    return response.data;
  }

  async getJournalEntryById(id: string): Promise<JournalEntry> {
    const response = await api.get(`/accounting/journal-entries/${id}`);
    return response.data.data;
  }

  async createJournalEntry(entryData: JournalEntryFormData): Promise<JournalEntry> {
    const response = await api.post('/accounting/journal-entries', entryData);
    return response.data.data;
  }

  async updateJournalEntry(id: string, updateData: JournalEntryUpdateData): Promise<JournalEntry> {
    const response = await api.patch(`/accounting/journal-entries/${id}`, updateData);
    return response.data.data;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await api.delete(`/accounting/journal-entries/${id}`);
  }

  async postJournalEntry(id: string): Promise<JournalEntry> {
    const response = await api.patch(`/accounting/journal-entries/${id}/post`);
    return response.data.data;
  }

  async reverseJournalEntry(id: string, reason: string): Promise<{ originalEntry: JournalEntry; reversingEntry: JournalEntry }> {
    const response = await api.patch(`/accounting/journal-entries/${id}/reverse`, { reason });
    return response.data.data;
  }

  // General Ledger
  async getGeneralLedgerEntries(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: GeneralLedgerEntry[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/accounting/general-ledger?${queryParams.toString()}`);
    return response.data;
  }

  async getAccountStatement(
    accountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ account: Account; openingBalance: number; closingBalance: number; transactions: GeneralLedgerEntry[] }> {
    const queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate);
    }
    
    const response = await api.get(
      `/accounting/general-ledger/account/${accountId}?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async getTrialBalance(asOfDate?: string): Promise<{
    asOfDate: string;
    trialBalance: { account: Partial<Account>; debit: number; credit: number }[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  }> {
    const queryParams = new URLSearchParams();
    
    if (asOfDate) {
      queryParams.append('asOfDate', asOfDate);
    }
    
    const response = await api.get(
      `/accounting/general-ledger/trial-balance?${queryParams.toString()}`
    );
    return response.data.data;
  }

  // Financial Periods
  async getFinancialPeriods(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: FinancialPeriod[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/accounting/financial-periods?${queryParams.toString()}`);
    return response.data;
  }

  async getFinancialPeriodById(id: string): Promise<FinancialPeriod> {
    const response = await api.get(`/accounting/financial-periods/${id}`);
    return response.data.data;
  }

  async createFinancialPeriod(periodData: FinancialPeriodFormData): Promise<FinancialPeriod> {
    const response = await api.post('/accounting/financial-periods', periodData);
    return response.data.data;
  }

  async updateFinancialPeriod(id: string, updateData: FinancialPeriodUpdateData): Promise<FinancialPeriod> {
    const response = await api.patch(`/accounting/financial-periods/${id}`, updateData);
    return response.data.data;
  }

  async deleteFinancialPeriod(id: string): Promise<void> {
    await api.delete(`/accounting/financial-periods/${id}`);
  }

  async closeFinancialPeriod(id: string): Promise<FinancialPeriod> {
    const response = await api.patch(`/accounting/financial-periods/${id}/close`);
    return response.data.data;
  }

  async lockFinancialPeriod(id: string): Promise<FinancialPeriod> {
    const response = await api.patch(`/accounting/financial-periods/${id}/lock`);
    return response.data.data;
  }

  // Tax Configurations
  async getTaxConfigurations(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: TaxConfiguration[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/accounting/taxes?${queryParams.toString()}`);
    return response.data;
  }

  async getTaxConfigurationById(id: string): Promise<TaxConfiguration> {
    const response = await api.get(`/accounting/taxes/${id}`);
    return response.data.data;
  }

  async createTaxConfiguration(taxData: TaxConfigurationFormData): Promise<TaxConfiguration> {
    const response = await api.post('/accounting/taxes', taxData);
    return response.data.data;
  }

  async updateTaxConfiguration(id: string, updateData: TaxConfigurationUpdateData): Promise<TaxConfiguration> {
    const response = await api.patch(`/accounting/taxes/${id}`, updateData);
    return response.data.data;
  }

  async deleteTaxConfiguration(id: string): Promise<void> {
    await api.delete(`/accounting/taxes/${id}`);
  }

  // Financial Reports
  async getBalanceSheet(asOfDate?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (asOfDate) {
      queryParams.append('asOfDate', asOfDate);
    }
    
    const response = await api.get(
      `/accounting/reports/balance-sheet?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async getIncomeStatement(startDate?: string, endDate?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate);
    }
    
    const response = await api.get(
      `/accounting/reports/income-statement?${queryParams.toString()}`
    );
    return response.data.data;
  }

  async getCashFlowStatement(startDate?: string, endDate?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate);
    }
    
    const response = await api.get(
      `/accounting/reports/cash-flow?${queryParams.toString()}`
    );
    return response.data.data;
  }
}

export default new AccountingService();
