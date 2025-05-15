import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dashboardService from '@/api/services/dashboard.service';

export interface DashboardStats {
  totalPatients: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  ageDistribution: {
    children: number; // 0-18
    youngAdults: number; // 19-35
    middleAged: number; // 36-50
    seniors: number; // 51-65
    elderly: number; // 65+
  };
  recordsDistribution: {
    withAllergies: number;
    withMedicalConditions: number;
    withMedicationHistory: number;
    withClinicalAssessments: number;
    withLaboratoryFindings: number;
    withDrugTherapyProblems: number;
    withCarePlans: number;
    withSoapNotes: number;
  };
  upcomingFollowUps: Array<{
    patientId: string;
    patientName: string;
    date: string;
    type: string;
  }>;
  recentActivities: Array<{
    type: string;
    date: string;
    patientId: string;
    patientName: string;
    description: string;
  }>;
  medicationStats?: {
    categoriesDistribution: Array<{
      name: string;
      count: number;
    }>;
    frequentMedications: Array<{
      name: string;
      count: number;
    }>;
  };
  dtpStats?: {
    totalDTPs: number;
    resolvedDTPs: number;
    inProgressDTPs: number;
    unresolvedDTPs: number;
    categoriesDistribution: Array<{
      name: string;
      count: number;
    }>;
  };
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export interface DashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (params: DashboardStatsParams = {}, { rejectWithValue }) => {
    try {
      const stats = await dashboardService.getDashboardStats(params);
      return stats;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard statistics'
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
