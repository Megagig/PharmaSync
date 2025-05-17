import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  InventoryState,
  InventoryAdjustmentData,
} from '@/types/inventory.types';
import inventoryService from '@/api/services/inventory.service';

const initialState: InventoryState = {
  lowStockAlerts: [],
  expiringStockAlerts: [],
  inventoryValuation: null,
  inventoryMovements: [],
  adjustmentResult: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLowStockAlerts = createAsyncThunk(
  'inventory/fetchLowStockAlerts',
  async (threshold: number | undefined = 10, { rejectWithValue }) => {
    try {
      const alerts = await inventoryService.getLowStockAlerts(threshold);
      return alerts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch low stock alerts'
      );
    }
  }
);

export const fetchExpiringStockAlerts = createAsyncThunk(
  'inventory/fetchExpiringStockAlerts',
  async (days: number | undefined = 90, { rejectWithValue }) => {
    try {
      const alerts = await inventoryService.getExpiringStockAlerts(days);
      return alerts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expiring stock alerts'
      );
    }
  }
);

export const fetchInventoryValuation = createAsyncThunk(
  'inventory/fetchInventoryValuation',
  async (_, { rejectWithValue }) => {
    try {
      const valuation = await inventoryService.getInventoryValuation();
      return valuation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch inventory valuation'
      );
    }
  }
);

export const fetchInventoryMovement = createAsyncThunk(
  'inventory/fetchInventoryMovement',
  async (
    {
      medicationId = '',
      startDate = '',
      endDate = '',
    }: {
      medicationId?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const movements = await inventoryService.getInventoryMovement(
        medicationId,
        startDate,
        endDate
      );
      return movements;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch inventory movement'
      );
    }
  }
);

export const adjustInventory = createAsyncThunk(
  'inventory/adjustInventory',
  async (adjustmentData: InventoryAdjustmentData, { rejectWithValue }) => {
    try {
      const result = await inventoryService.adjustInventory(adjustmentData);
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to adjust inventory'
      );
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearAdjustmentResult: (state) => {
      state.adjustmentResult = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch low stock alerts
      .addCase(fetchLowStockAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockAlerts = action.payload;
      })
      .addCase(fetchLowStockAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch expiring stock alerts
      .addCase(fetchExpiringStockAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpiringStockAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expiringStockAlerts = action.payload;
      })
      .addCase(fetchExpiringStockAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch inventory valuation
      .addCase(fetchInventoryValuation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryValuation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryValuation = action.payload;
      })
      .addCase(fetchInventoryValuation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch inventory movement
      .addCase(fetchInventoryMovement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryMovement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryMovements = action.payload;
      })
      .addCase(fetchInventoryMovement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Adjust inventory
      .addCase(adjustInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adjustInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adjustmentResult = action.payload;
      })
      .addCase(adjustInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdjustmentResult, setError } = inventorySlice.actions;

export default inventorySlice.reducer;
