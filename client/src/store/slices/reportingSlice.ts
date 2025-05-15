import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportingService from '@/api/services/reporting.service';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
}

export interface ReportingState {
  demographics: any;
  medicationUsage: any;
  drugTherapyProblems: any;
  patientOutcomes: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportingState = {
  demographics: null,
  medicationUsage: null,
  drugTherapyProblems: null,
  patientOutcomes: null,
  isLoading: false,
  error: null,
};

export const fetchDemographicsReport = createAsyncThunk(
  'reporting/fetchDemographics',
  async (params: ReportParams = {}, { rejectWithValue }) => {
    try {
      const data = await reportingService.getDemographicsReport(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch demographics report'
      );
    }
  }
);

export const fetchMedicationUsageReport = createAsyncThunk(
  'reporting/fetchMedicationUsage',
  async (params: ReportParams = {}, { rejectWithValue }) => {
    try {
      const data = await reportingService.getMedicationUsageReport(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch medication usage report'
      );
    }
  }
);

export const fetchDrugTherapyProblemReport = createAsyncThunk(
  'reporting/fetchDrugTherapyProblems',
  async (params: ReportParams = {}, { rejectWithValue }) => {
    try {
      const data = await reportingService.getDrugTherapyProblemReport(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch drug therapy problem report'
      );
    }
  }
);

export const fetchPatientOutcomesReport = createAsyncThunk(
  'reporting/fetchPatientOutcomes',
  async (params: ReportParams = {}, { rejectWithValue }) => {
    try {
      const data = await reportingService.getPatientOutcomesReport(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patient outcomes report'
      );
    }
  }
);

export const fetchAllReports = createAsyncThunk(
  'reporting/fetchAllReports',
  async (params: ReportParams = {}, { rejectWithValue }) => {
    try {
      const data = await reportingService.getAllReports(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reports'
      );
    }
  }
);

const reportingSlice = createSlice({
  name: 'reporting',
  initialState,
  reducers: {
    clearReportingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Demographics report
      .addCase(fetchDemographicsReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDemographicsReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.demographics = action.payload;
      })
      .addCase(fetchDemographicsReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Medication usage report
      .addCase(fetchMedicationUsageReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicationUsageReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicationUsage = action.payload;
      })
      .addCase(fetchMedicationUsageReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Drug therapy problem report
      .addCase(fetchDrugTherapyProblemReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDrugTherapyProblemReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drugTherapyProblems = action.payload;
      })
      .addCase(fetchDrugTherapyProblemReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Patient outcomes report
      .addCase(fetchPatientOutcomesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientOutcomesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patientOutcomes = action.payload;
      })
      .addCase(fetchPatientOutcomesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // All reports
      .addCase(fetchAllReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.demographics = action.payload.demographics;
        state.medicationUsage = action.payload.medicationUsage;
        state.drugTherapyProblems = action.payload.drugTherapyProblems;
        state.patientOutcomes = action.payload.patientOutcomes;
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReportingError } = reportingSlice.actions;

export default reportingSlice.reducer;
