import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
} from '../../types/accounting.types';
import accountingService from '../../services/accounting.service';

interface AccountingState {
  // Chart of Accounts
  accounts: Account[];
  currentAccount: Account | null;

  // Journal Entries
  journalEntries: JournalEntry[];
  currentJournalEntry: JournalEntry | null;

  // General Ledger
  generalLedgerEntries: GeneralLedgerEntry[];
  accountStatement: {
    account: Account | null;
    openingBalance: number;
    closingBalance: number;
    transactions: GeneralLedgerEntry[];
  };
  trialBalance: {
    asOfDate: string;
    trialBalance: {
      account: Partial<Account>;
      debit: number;
      credit: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  } | null;

  // Financial Periods
  financialPeriods: FinancialPeriod[];
  currentFinancialPeriod: FinancialPeriod | null;

  // Tax Configurations
  taxConfigurations: TaxConfiguration[];
  currentTaxConfiguration: TaxConfiguration | null;

  // Financial Reports
  balanceSheet: any | null;
  incomeStatement: any | null;
  cashFlowStatement: any | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: AccountingState = {
  // Chart of Accounts
  accounts: [],
  currentAccount: null,

  // Journal Entries
  journalEntries: [],
  currentJournalEntry: null,

  // General Ledger
  generalLedgerEntries: [],
  accountStatement: {
    account: null,
    openingBalance: 0,
    closingBalance: 0,
    transactions: [],
  },
  trialBalance: null,

  // Financial Periods
  financialPeriods: [],
  currentFinancialPeriod: null,

  // Tax Configurations
  taxConfigurations: [],
  currentTaxConfiguration: null,

  // Financial Reports
  balanceSheet: null,
  incomeStatement: null,
  cashFlowStatement: null,

  // UI State
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

// Chart of Accounts Thunks
export const fetchAccounts = createAsyncThunk(
  'accounting/fetchAccounts',
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) => {
    return await accountingService.getAccounts(page, limit, filters);
  }
);

export const fetchAccountById = createAsyncThunk(
  'accounting/fetchAccountById',
  async (id: string) => {
    return await accountingService.getAccountById(id);
  }
);

export const createAccount = createAsyncThunk(
  'accounting/createAccount',
  async (accountData: AccountFormData) => {
    return await accountingService.createAccount(accountData);
  }
);

export const updateAccount = createAsyncThunk(
  'accounting/updateAccount',
  async ({ id, updateData }: { id: string; updateData: AccountUpdateData }) => {
    return await accountingService.updateAccount(id, updateData);
  }
);

export const deleteAccount = createAsyncThunk(
  'accounting/deleteAccount',
  async (id: string) => {
    await accountingService.deleteAccount(id);
    return id;
  }
);

// Journal Entries Thunks
export const fetchJournalEntries = createAsyncThunk(
  'accounting/fetchJournalEntries',
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) => {
    return await accountingService.getJournalEntries(page, limit, filters);
  }
);

export const fetchJournalEntryById = createAsyncThunk(
  'accounting/fetchJournalEntryById',
  async (id: string) => {
    return await accountingService.getJournalEntryById(id);
  }
);

export const createJournalEntry = createAsyncThunk(
  'accounting/createJournalEntry',
  async (entryData: JournalEntryFormData) => {
    return await accountingService.createJournalEntry(entryData);
  }
);

export const updateJournalEntry = createAsyncThunk(
  'accounting/updateJournalEntry',
  async ({
    id,
    updateData,
  }: {
    id: string;
    updateData: JournalEntryUpdateData;
  }) => {
    return await accountingService.updateJournalEntry(id, updateData);
  }
);

export const deleteJournalEntry = createAsyncThunk(
  'accounting/deleteJournalEntry',
  async (id: string) => {
    await accountingService.deleteJournalEntry(id);
    return id;
  }
);

export const postJournalEntry = createAsyncThunk(
  'accounting/postJournalEntry',
  async (id: string) => {
    return await accountingService.postJournalEntry(id);
  }
);

export const reverseJournalEntry = createAsyncThunk(
  'accounting/reverseJournalEntry',
  async ({ id, reason }: { id: string; reason: string }) => {
    return await accountingService.reverseJournalEntry(id, reason);
  }
);

// General Ledger Thunks
export const fetchGeneralLedgerEntries = createAsyncThunk(
  'accounting/fetchGeneralLedgerEntries',
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) => {
    return await accountingService.getGeneralLedgerEntries(
      page,
      limit,
      filters
    );
  }
);

export const fetchAccountStatement = createAsyncThunk(
  'accounting/fetchAccountStatement',
  async ({
    accountId,
    startDate,
    endDate,
  }: {
    accountId: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return await accountingService.getAccountStatement(
      accountId,
      startDate,
      endDate
    );
  }
);

export const fetchTrialBalance = createAsyncThunk(
  'accounting/fetchTrialBalance',
  async (asOfDate?: string) => {
    return await accountingService.getTrialBalance(asOfDate);
  }
);

// Financial Periods Thunks
export const fetchFinancialPeriods = createAsyncThunk(
  'accounting/fetchFinancialPeriods',
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) => {
    return await accountingService.getFinancialPeriods(page, limit, filters);
  }
);

export const fetchFinancialPeriodById = createAsyncThunk(
  'accounting/fetchFinancialPeriodById',
  async (id: string) => {
    return await accountingService.getFinancialPeriodById(id);
  }
);

export const createFinancialPeriod = createAsyncThunk(
  'accounting/createFinancialPeriod',
  async (periodData: FinancialPeriodFormData) => {
    return await accountingService.createFinancialPeriod(periodData);
  }
);

export const updateFinancialPeriod = createAsyncThunk(
  'accounting/updateFinancialPeriod',
  async ({
    id,
    updateData,
  }: {
    id: string;
    updateData: FinancialPeriodUpdateData;
  }) => {
    return await accountingService.updateFinancialPeriod(id, updateData);
  }
);

export const deleteFinancialPeriod = createAsyncThunk(
  'accounting/deleteFinancialPeriod',
  async (id: string) => {
    await accountingService.deleteFinancialPeriod(id);
    return id;
  }
);

export const closeFinancialPeriod = createAsyncThunk(
  'accounting/closeFinancialPeriod',
  async (id: string) => {
    return await accountingService.closeFinancialPeriod(id);
  }
);

export const lockFinancialPeriod = createAsyncThunk(
  'accounting/lockFinancialPeriod',
  async (id: string) => {
    return await accountingService.lockFinancialPeriod(id);
  }
);

// Tax Configurations Thunks
export const fetchTaxConfigurations = createAsyncThunk(
  'accounting/fetchTaxConfigurations',
  async ({
    page = 1,
    limit = 10,
    filters = {},
  }: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) => {
    return await accountingService.getTaxConfigurations(page, limit, filters);
  }
);

export const fetchTaxConfigurationById = createAsyncThunk(
  'accounting/fetchTaxConfigurationById',
  async (id: string) => {
    return await accountingService.getTaxConfigurationById(id);
  }
);

export const createTaxConfiguration = createAsyncThunk(
  'accounting/createTaxConfiguration',
  async (taxData: TaxConfigurationFormData) => {
    return await accountingService.createTaxConfiguration(taxData);
  }
);

export const updateTaxConfiguration = createAsyncThunk(
  'accounting/updateTaxConfiguration',
  async ({
    id,
    updateData,
  }: {
    id: string;
    updateData: TaxConfigurationUpdateData;
  }) => {
    return await accountingService.updateTaxConfiguration(id, updateData);
  }
);

export const deleteTaxConfiguration = createAsyncThunk(
  'accounting/deleteTaxConfiguration',
  async (id: string) => {
    await accountingService.deleteTaxConfiguration(id);
    return id;
  }
);

// Financial Reports Thunks
export const fetchBalanceSheet = createAsyncThunk(
  'accounting/fetchBalanceSheet',
  async (asOfDate?: string) => {
    return await accountingService.getBalanceSheet(asOfDate);
  }
);

export const fetchIncomeStatement = createAsyncThunk(
  'accounting/fetchIncomeStatement',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    return await accountingService.getIncomeStatement(startDate, endDate);
  }
);

export const fetchCashFlowStatement = createAsyncThunk(
  'accounting/fetchCashFlowStatement',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    return await accountingService.getCashFlowStatement(startDate, endDate);
  }
);

const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {
    clearAccountingErrors: (state) => {
      state.error = null;
    },
    resetAccountingState: () => initialState,
  },
  extraReducers: (builder) => {
    // Handle all async thunks
    builder
      // Chart of Accounts
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAccount = action.payload;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts.push(action.payload);
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.accounts.findIndex(
          (account) => account._id === action.payload._id
        );
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (
          state.currentAccount &&
          state.currentAccount._id === action.payload._id
        ) {
          state.currentAccount = action.payload;
        }
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = state.accounts.filter(
          (account) => account._id !== action.payload
        );
        if (
          state.currentAccount &&
          state.currentAccount._id === action.payload
        ) {
          state.currentAccount = null;
        }
      })

      // Journal Entries
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journalEntries = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchJournalEntryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJournalEntry = action.payload;
      })
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journalEntries.push(action.payload);
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.journalEntries.findIndex(
          (entry) => entry._id === action.payload._id
        );
        if (index !== -1) {
          state.journalEntries[index] = action.payload;
        }
        if (
          state.currentJournalEntry &&
          state.currentJournalEntry._id === action.payload._id
        ) {
          state.currentJournalEntry = action.payload;
        }
      })
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journalEntries = state.journalEntries.filter(
          (entry) => entry._id !== action.payload
        );
        if (
          state.currentJournalEntry &&
          state.currentJournalEntry._id === action.payload
        ) {
          state.currentJournalEntry = null;
        }
      })
      .addCase(postJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.journalEntries.findIndex(
          (entry) => entry._id === action.payload._id
        );
        if (index !== -1) {
          state.journalEntries[index] = action.payload;
        }
        if (
          state.currentJournalEntry &&
          state.currentJournalEntry._id === action.payload._id
        ) {
          state.currentJournalEntry = action.payload;
        }
      })
      .addCase(reverseJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update original entry
        const originalIndex = state.journalEntries.findIndex(
          (entry) => entry._id === action.payload.originalEntry._id
        );
        if (originalIndex !== -1) {
          state.journalEntries[originalIndex] = action.payload.originalEntry;
        }
        // Add reversing entry
        state.journalEntries.push(action.payload.reversingEntry);
        // Update current entry if needed
        if (
          state.currentJournalEntry &&
          state.currentJournalEntry._id === action.payload.originalEntry._id
        ) {
          state.currentJournalEntry = action.payload.originalEntry;
        }
      })

      // General Ledger
      .addCase(fetchGeneralLedgerEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.generalLedgerEntries = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAccountStatement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accountStatement = action.payload;
      })
      .addCase(fetchTrialBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trialBalance = action.payload;
      })

      // Financial Periods
      .addCase(fetchFinancialPeriods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.financialPeriods = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchFinancialPeriodById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFinancialPeriod = action.payload;
      })
      .addCase(createFinancialPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.financialPeriods.push(action.payload);
      })
      .addCase(updateFinancialPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.financialPeriods.findIndex(
          (period) => period._id === action.payload._id
        );
        if (index !== -1) {
          state.financialPeriods[index] = action.payload;
        }
        if (
          state.currentFinancialPeriod &&
          state.currentFinancialPeriod._id === action.payload._id
        ) {
          state.currentFinancialPeriod = action.payload;
        }
      })
      .addCase(deleteFinancialPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.financialPeriods = state.financialPeriods.filter(
          (period) => period._id !== action.payload
        );
        if (
          state.currentFinancialPeriod &&
          state.currentFinancialPeriod._id === action.payload
        ) {
          state.currentFinancialPeriod = null;
        }
      })
      .addCase(closeFinancialPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.financialPeriods.findIndex(
          (period) => period._id === action.payload._id
        );
        if (index !== -1) {
          state.financialPeriods[index] = action.payload;
        }
        if (
          state.currentFinancialPeriod &&
          state.currentFinancialPeriod._id === action.payload._id
        ) {
          state.currentFinancialPeriod = action.payload;
        }
      })
      .addCase(lockFinancialPeriod.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.financialPeriods.findIndex(
          (period) => period._id === action.payload._id
        );
        if (index !== -1) {
          state.financialPeriods[index] = action.payload;
        }
        if (
          state.currentFinancialPeriod &&
          state.currentFinancialPeriod._id === action.payload._id
        ) {
          state.currentFinancialPeriod = action.payload;
        }
      })

      // Tax Configurations
      .addCase(fetchTaxConfigurations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taxConfigurations = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTaxConfigurationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaxConfiguration = action.payload;
      })
      .addCase(createTaxConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taxConfigurations.push(action.payload);
      })
      .addCase(updateTaxConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.taxConfigurations.findIndex(
          (tax) => tax._id === action.payload._id
        );
        if (index !== -1) {
          state.taxConfigurations[index] = action.payload;
        }
        if (
          state.currentTaxConfiguration &&
          state.currentTaxConfiguration._id === action.payload._id
        ) {
          state.currentTaxConfiguration = action.payload;
        }
      })
      .addCase(deleteTaxConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taxConfigurations = state.taxConfigurations.filter(
          (tax) => tax._id !== action.payload
        );
        if (
          state.currentTaxConfiguration &&
          state.currentTaxConfiguration._id === action.payload
        ) {
          state.currentTaxConfiguration = null;
        }
      })

      // Financial Reports
      .addCase(fetchBalanceSheet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balanceSheet = action.payload;
      })
      .addCase(fetchIncomeStatement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incomeStatement = action.payload;
      })
      .addCase(fetchCashFlowStatement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cashFlowStatement = action.payload;
      })

      // Generic loading and error handling for all thunks
      .addMatcher(
        (action) =>
          action.type.startsWith('accounting/') &&
          action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('accounting/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || 'An error occurred';
        }
      );
  },
});

export const { clearAccountingErrors, resetAccountingState } =
  accountingSlice.actions;

export default accountingSlice.reducer;
