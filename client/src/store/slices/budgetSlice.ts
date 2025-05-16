import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget, BudgetFormData, BudgetUpdateData, BudgetSummary } from '../../types/budget.types';
import budgetService from '../../services/budget.service';

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  budgetSummary: BudgetSummary | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: BudgetState = {
  budgets: [],
  currentBudget: null,
  budgetSummary: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
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
      const response = await budgetService.getBudgets(page, limit, filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

export const fetchBudgetById = createAsyncThunk(
  'budgets/fetchBudgetById',
  async (id: string, { rejectWithValue }) => {
    try {
      const budget = await budgetService.getBudgetById(id);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: BudgetFormData, { rejectWithValue }) => {
    try {
      const budget = await budgetService.createBudget(budgetData);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: BudgetUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const budget = await budgetService.updateBudget(id, updateData);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete budget');
    }
  }
);

export const activateBudget = createAsyncThunk(
  'budgets/activateBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      const budget = await budgetService.activateBudget(id);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate budget');
    }
  }
);

export const closeBudget = createAsyncThunk(
  'budgets/closeBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      const budget = await budgetService.closeBudget(id);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to close budget');
    }
  }
);

export const updateBudgetActuals = createAsyncThunk(
  'budgets/updateBudgetActuals',
  async (id: string, { rejectWithValue }) => {
    try {
      const budget = await budgetService.updateBudgetActuals(id);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget actuals');
    }
  }
);

export const fetchBudgetSummary = createAsyncThunk(
  'budgets/fetchBudgetSummary',
  async (_, { rejectWithValue }) => {
    try {
      const summary = await budgetService.getBudgetSummary();
      return summary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget summary');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch budget by ID
      .addCase(fetchBudgetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBudget = action.payload;
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = [action.payload, ...state.budgets];
        state.currentBudget = action.payload;
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.map((budget) =>
          budget._id === action.payload._id ? action.payload : budget
        );
        state.currentBudget = action.payload;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter((budget) => budget._id !== action.payload);
        if (state.currentBudget && state.currentBudget._id === action.payload) {
          state.currentBudget = null;
        }
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Activate budget
      .addCase(activateBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.map((budget) =>
          budget._id === action.payload._id ? action.payload : budget
        );
        if (state.currentBudget && state.currentBudget._id === action.payload._id) {
          state.currentBudget = action.payload;
        }
      })
      // Close budget
      .addCase(closeBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.map((budget) =>
          budget._id === action.payload._id ? action.payload : budget
        );
        if (state.currentBudget && state.currentBudget._id === action.payload._id) {
          state.currentBudget = action.payload;
        }
      })
      // Update budget actuals
      .addCase(updateBudgetActuals.fulfilled, (state, action) => {
        state.budgets = state.budgets.map((budget) =>
          budget._id === action.payload._id ? action.payload : budget
        );
        if (state.currentBudget && state.currentBudget._id === action.payload._id) {
          state.currentBudget = action.payload;
        }
      })
      // Fetch budget summary
      .addCase(fetchBudgetSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgetSummary = action.payload;
      })
      .addCase(fetchBudgetSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentBudget, setError } = budgetSlice.actions;

export default budgetSlice.reducer;
