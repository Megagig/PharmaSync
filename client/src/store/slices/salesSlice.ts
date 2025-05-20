import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Sale, SaleFormData, SaleUpdateData, SaleReceiptData } from '../../types/sale.types';
import saleService from '../../services/sale.service';

interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  receiptData: SaleReceiptData | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  receiptData: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (
    {
      page = 1,
      limit = 10,
      customer = '',
      status = '',
      paymentStatus = '',
      location = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      customer?: string;
      status?: string;
      paymentStatus?: string;
      location?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await saleService.getAllSales(
        page,
        limit,
        customer,
        status,
        paymentStatus,
        location,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const sale = await saleService.getSaleById(id);
      return sale;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sale');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: SaleFormData, { rejectWithValue }) => {
    try {
      const sale = await saleService.createSale(saleData);
      return sale;
    } catch (error: any) {
      // Extract detailed error information
      let errorMessage = 'Failed to create sale';

      if (error.response && error.response.data) {
        console.error('Error response data in slice:', error.response.data);

        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Check for validation errors
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const errorDetails = error.response.data.errors
            .map((err: any) => `${err.field || err.path}: ${err.message}`)
            .join('\n');
          errorMessage = `Validation errors:\n${errorDetails}`;
        }

        // Try to extract validation errors from stack trace
        if (error.response.data.stack) {
          const validationMatch = error.response.data.stack.match(/Sale validation failed: ([^\n]+)/);
          if (validationMatch && validationMatch[1]) {
            errorMessage = `Validation errors: ${validationMatch[1]}`;
          }
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: SaleUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const sale = await saleService.updateSale(id, updateData);
      return sale;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update sale');
    }
  }
);

export const generateReceipt = createAsyncThunk(
  'sales/generateReceipt',
  async (id: string, { rejectWithValue }) => {
    try {
      const receiptData = await saleService.generateReceipt(id);
      return receiptData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate receipt');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    clearReceiptData: (state) => {
      state.receiptData = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch sale by ID
      .addCase(fetchSaleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSale = action.payload;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSale = action.payload;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update sale
      .addCase(updateSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSale = action.payload;
        // Update in the list if present
        const index = state.sales.findIndex((sale) => sale._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate receipt
      .addCase(generateReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receiptData = action.payload;
      })
      .addCase(generateReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSale, clearReceiptData, setError } = salesSlice.actions;

export default salesSlice.reducer;
