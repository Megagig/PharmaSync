import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import comprehensiveReportsService from '@/api/services/comprehensive-reports.service';
import { ReportFormat } from '@/types/report.types';

interface ComprehensiveReportsState {
  patientReport: any | null;
  medicationReport: any | null;
  inventoryReport: any | null;
  salesReport: any | null;
  financialReport: any | null;
  administrativeReport: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ComprehensiveReportsState = {
  patientReport: null,
  medicationReport: null,
  inventoryReport: null,
  salesReport: null,
  financialReport: null,
  administrativeReport: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPatientReport = createAsyncThunk(
  'comprehensiveReports/fetchPatientReport',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.getPatientReport(startDate, endDate);
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient report');
    }
  }
);

export const fetchMedicationReport = createAsyncThunk(
  'comprehensiveReports/fetchMedicationReport',
  async (
    { 
      startDate, 
      endDate, 
      medicationType 
    }: { 
      startDate?: string; 
      endDate?: string; 
      medicationType?: string 
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.getMedicationReport(
        startDate, 
        endDate, 
        medicationType
      );
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medication report');
    }
  }
);

export const fetchInventoryReport = createAsyncThunk(
  'comprehensiveReports/fetchInventoryReport',
  async (
    { 
      startDate, 
      endDate, 
      location,
      reportType
    }: { 
      startDate?: string; 
      endDate?: string; 
      location?: string;
      reportType?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.getInventoryReport(
        startDate, 
        endDate, 
        location,
        reportType
      );
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory report');
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  'comprehensiveReports/fetchSalesReport',
  async (
    { 
      startDate, 
      endDate, 
      location,
      groupBy
    }: { 
      startDate?: string; 
      endDate?: string; 
      location?: string;
      groupBy?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.getSalesReport(
        startDate, 
        endDate, 
        location,
        groupBy
      );
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchFinancialReport = createAsyncThunk(
  'comprehensiveReports/fetchFinancialReport',
  async (
    { 
      startDate, 
      endDate, 
      reportType,
      period
    }: { 
      startDate?: string; 
      endDate?: string; 
      reportType?: string;
      period?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.getFinancialReport(
        startDate, 
        endDate, 
        reportType,
        period
      );
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial report');
    }
  }
);

export const fetchAdministrativeReport = createAsyncThunk(
  'comprehensiveReports/fetchAdministrativeReport',
  async (
    { 
      startDate, 
      endDate, 
      reportType,
      userRole
    }: { 
      startDate?: string; 
      endDate?: string; 
      reportType?: string;
      userRole?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.getAdministrativeReport(
        startDate, 
        endDate, 
        reportType,
        userRole
      );
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch administrative report');
    }
  }
);

export const downloadReport = createAsyncThunk(
  'comprehensiveReports/downloadReport',
  async (
    { 
      reportType, 
      params, 
      format 
    }: { 
      reportType: 'patient' | 'medication' | 'inventory' | 'sales' | 'financial' | 'administrative'; 
      params: any; 
      format: ReportFormat 
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await comprehensiveReportsService.downloadReport(
        reportType, 
        params, 
        format
      );
      return report;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download report');
    }
  }
);

const comprehensiveReportsSlice = createSlice({
  name: 'comprehensiveReports',
  initialState,
  reducers: {
    clearReports: (state) => {
      state.patientReport = null;
      state.medicationReport = null;
      state.inventoryReport = null;
      state.salesReport = null;
      state.financialReport = null;
      state.administrativeReport = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Patient report
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
      })
      
      // Medication report
      .addCase(fetchMedicationReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicationReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicationReport = action.payload;
      })
      .addCase(fetchMedicationReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Inventory report
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
      
      // Sales report
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
      
      // Financial report
      .addCase(fetchFinancialReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.financialReport = action.payload;
      })
      .addCase(fetchFinancialReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Administrative report
      .addCase(fetchAdministrativeReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdministrativeReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.administrativeReport = action.payload;
      })
      .addCase(fetchAdministrativeReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Download report
      .addCase(downloadReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(downloadReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReports, setError } = comprehensiveReportsSlice.actions;

export default comprehensiveReportsSlice.reducer;
