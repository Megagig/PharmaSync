import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  DispensingsState,
  Dispensing,
  DispensingFormData,
  ReturnDispensingData,
} from '@/types/dispensing.types';
import dispensingService from '@/api/services/dispensing.service';

const initialState: DispensingsState = {
  dispensings: [],
  currentDispensing: null,
  receiptData: null,
  isLoading: false,
  error: null,
  totalDispensings: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchDispensings = createAsyncThunk(
  'dispensings/fetchDispensings',
  async (
    {
      page = 1,
      limit = 10,
      patient = '',
      status = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      patient?: string;
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await dispensingService.getAllDispensings(
        page,
        limit,
        patient,
        status,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dispensings');
    }
  }
);

export const fetchDispensingById = createAsyncThunk(
  'dispensings/fetchDispensingById',
  async (id: string, { rejectWithValue }) => {
    try {
      const dispensing = await dispensingService.getDispensingById(id);
      return dispensing;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dispensing');
    }
  }
);

export const createDispensing = createAsyncThunk(
  'dispensings/createDispensing',
  async (dispensingData: DispensingFormData, { rejectWithValue }) => {
    try {
      const dispensing = await dispensingService.createDispensing(dispensingData);
      return dispensing;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create dispensing');
    }
  }
);

export const updateDispensing = createAsyncThunk(
  'dispensings/updateDispensing',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        status?: string;
        paymentMethod?: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
        discount?: number;
        tax?: number;
        notes?: string;
        receiptGenerated?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const dispensing = await dispensingService.updateDispensing(id, updateData);
      return dispensing;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update dispensing');
    }
  }
);

export const generateReceipt = createAsyncThunk(
  'dispensings/generateReceipt',
  async (id: string, { rejectWithValue }) => {
    try {
      const receiptData = await dispensingService.generateReceipt(id);
      return receiptData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate receipt');
    }
  }
);

export const returnDispensing = createAsyncThunk(
  'dispensings/returnDispensing',
  async (
    {
      id,
      returnData,
    }: {
      id: string;
      returnData: ReturnDispensingData;
    },
    { rejectWithValue }
  ) => {
    try {
      const dispensing = await dispensingService.returnDispensing(id, returnData);
      return dispensing;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to return dispensing');
    }
  }
);

const dispensingSlice = createSlice({
  name: 'dispensings',
  initialState,
  reducers: {
    clearCurrentDispensing: (state) => {
      state.currentDispensing = null;
    },
    clearReceiptData: (state) => {
      state.receiptData = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dispensings
      .addCase(fetchDispensings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDispensings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dispensings = action.payload.data;
        state.totalDispensings = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchDispensings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch dispensing by ID
      .addCase(fetchDispensingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDispensingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDispensing = action.payload;
      })
      .addCase(fetchDispensingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create dispensing
      .addCase(createDispensing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDispensing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDispensing = action.payload;
      })
      .addCase(createDispensing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update dispensing
      .addCase(updateDispensing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDispensing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDispensing = action.payload;
      })
      .addCase(updateDispensing.rejected, (state, action) => {
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
      })
      
      // Return dispensing
      .addCase(returnDispensing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(returnDispensing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDispensing = action.payload;
      })
      .addCase(returnDispensing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentDispensing, clearReceiptData, setError } = dispensingSlice.actions;

export default dispensingSlice.reducer;
