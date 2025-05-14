import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReportsState } from '@/types/reports.types';
import reportsService from '@/api/services/reports.service';

const initialState: ReportsState = {
  salesReport: null,
  inventoryReport: null,
  prescriptionReport: null,
  patientReport: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const report = await reportsService.getSalesReport(startDate, endDate);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchInventoryReport = createAsyncThunk(
  'reports/fetchInventoryReport',
  async (_, { rejectWithValue }) => {
    try {
      const report = await reportsService.getInventoryReport();
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory report');
    }
  }
);

export const fetchPrescriptionReport = createAsyncThunk(
  'reports/fetchPrescriptionReport',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const report = await reportsService.getPrescriptionReport(startDate, endDate);
      return report;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch prescription report'
      );
    }
  }
);

export const fetchPatientReport = createAsyncThunk(
  'reports/fetchPatientReport',
  async (_, { rejectWithValue }) => {
    try {
      const report = await reportsService.getPatientReport();
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReports: (state) => {
      state.salesReport = null;
      state.inventoryReport = null;
      state.prescriptionReport = null;
      state.patientReport = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales report
      .addCase(fetchSalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch inventory report
      .addCase(fetchInventoryReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryReport = action.payload;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch prescription report
      .addCase(fetchPrescriptionReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptionReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prescriptionReport = action.payload;
      })
      .addCase(fetchPrescriptionReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch patient report
      .addCase(fetchPatientReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patientReport = action.payload;
      })
      .addCase(fetchPatientReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReports, setError } = reportsSlice.actions;

export default reportsSlice.reducer;
