import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseFormData, ExpenseUpdateData, ExpenseSummary } from '../../types/expense.types';
import expenseService from '../../services/expense.service';

interface ExpenseState {
  expenses: Expense[];
  currentExpense: Expense | null;
  expenseSummary: ExpenseSummary | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: ExpenseState = {
  expenses: [],
  currentExpense: null,
  expenseSummary: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (
    {
      page = 1,
      limit = 10,
      filters = {},
    }: {
      page?: number;
      limit?: number;
      filters?: Record<string, any>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await expenseService.getExpenses(page, limit, filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  'expenses/fetchExpenseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const expense = await expenseService.getExpenseById(id);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: ExpenseFormData, { rejectWithValue }) => {
    try {
      const expense = await expenseService.createExpense(expenseData);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: ExpenseUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const expense = await expenseService.updateExpense(id, updateData);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

export const approveExpense = createAsyncThunk(
  'expenses/approveExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      const expense = await expenseService.approveExpense(id);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve expense');
    }
  }
);

export const rejectExpense = createAsyncThunk(
  'expenses/rejectExpense',
  async (
    {
      id,
      rejectionReason,
    }: {
      id: string;
      rejectionReason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const expense = await expenseService.rejectExpense(id, rejectionReason);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject expense');
    }
  }
);

export const markExpenseAsPaid = createAsyncThunk(
  'expenses/markExpenseAsPaid',
  async (
    {
      id,
      paymentData,
    }: {
      id: string;
      paymentData: {
        paymentMethod: string;
        paymentDate?: string;
        paymentReference?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const expense = await expenseService.markExpenseAsPaid(id, paymentData);
      return expense;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark expense as paid');
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchExpenseSummary',
  async (
    {
      startDate,
      endDate,
    }: {
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const summary = await expenseService.getExpenseSummary(startDate, endDate);
      return summary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense summary');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch expense by ID
      .addCase(fetchExpenseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpense = action.payload;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = [action.payload, ...state.expenses];
        state.currentExpense = action.payload;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        );
        state.currentExpense = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = state.expenses.filter((expense) => expense._id !== action.payload);
        if (state.currentExpense && state.currentExpense._id === action.payload) {
          state.currentExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Approve expense
      .addCase(approveExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        );
        if (state.currentExpense && state.currentExpense._id === action.payload._id) {
          state.currentExpense = action.payload;
        }
      })
      // Reject expense
      .addCase(rejectExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        );
        if (state.currentExpense && state.currentExpense._id === action.payload._id) {
          state.currentExpense = action.payload;
        }
      })
      // Mark expense as paid
      .addCase(markExpenseAsPaid.fulfilled, (state, action) => {
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        );
        if (state.currentExpense && state.currentExpense._id === action.payload._id) {
          state.currentExpense = action.payload;
        }
      })
      // Fetch expense summary
      .addCase(fetchExpenseSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenseSummary = action.payload;
      })
      .addCase(fetchExpenseSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentExpense, setError } = expenseSlice.actions;

export default expenseSlice.reducer;
