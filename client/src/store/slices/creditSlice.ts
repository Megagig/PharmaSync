import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  CreditTransaction, 
  CreditSummary, 
  CreditTransactionFormData, 
  CreditLimitUpdateData 
} from '../../types/credit.types';
import creditService from '../../services/credit.service';

interface CreditState {
  transactions: CreditTransaction[];
  creditSummary: CreditSummary | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: CreditState = {
  transactions: [],
  creditSummary: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchCustomerCreditTransactions = createAsyncThunk(
  'credit/fetchCustomerCreditTransactions',
  async (
    {
      customerId,
      page = 1,
      limit = 10,
    }: {
      customerId: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await creditService.getCustomerCreditTransactions(
        customerId,
        page,
        limit
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credit transactions');
    }
  }
);

export const fetchCustomerCreditSummary = createAsyncThunk(
  'credit/fetchCustomerCreditSummary',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const creditSummary = await creditService.getCustomerCreditSummary(customerId);
      return creditSummary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credit summary');
    }
  }
);

export const createCreditTransaction = createAsyncThunk(
  'credit/createCreditTransaction',
  async (
    {
      customerId,
      transactionData,
    }: {
      customerId: string;
      transactionData: CreditTransactionFormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const transaction = await creditService.createCreditTransaction(
        customerId,
        transactionData
      );
      return transaction;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create credit transaction');
    }
  }
);

export const updateCreditLimit = createAsyncThunk(
  'credit/updateCreditLimit',
  async (
    {
      customerId,
      updateData,
    }: {
      customerId: string;
      updateData: CreditLimitUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await creditService.updateCreditLimit(customerId, updateData);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update credit limit');
    }
  }
);

const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    clearCreditSummary: (state) => {
      state.creditSummary = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch credit transactions
      .addCase(fetchCustomerCreditTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerCreditTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCustomerCreditTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch credit summary
      .addCase(fetchCustomerCreditSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerCreditSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creditSummary = action.payload;
      })
      .addCase(fetchCustomerCreditSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create credit transaction
      .addCase(createCreditTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCreditTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = [action.payload, ...state.transactions];
        
        // Update credit summary if available
        if (state.creditSummary) {
          state.creditSummary.currentBalance = action.payload.balance;
          state.creditSummary.availableCredit = 
            state.creditSummary.creditLimit - action.payload.balance;
          state.creditSummary.lastTransactionDate = action.payload.createdAt;
          state.creditSummary.transactions = [
            action.payload,
            ...state.creditSummary.transactions.slice(0, 4),
          ];
        }
      })
      .addCase(createCreditTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update credit limit
      .addCase(updateCreditLimit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCreditLimit.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update credit summary if available
        if (state.creditSummary) {
          state.creditSummary.creditLimit = action.payload.creditLimit;
          state.creditSummary.availableCredit = action.payload.availableCredit;
        }
      })
      .addCase(updateCreditLimit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCreditSummary, setError } = creditSlice.actions;

export default creditSlice.reducer;
