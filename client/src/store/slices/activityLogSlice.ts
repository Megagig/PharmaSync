import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ActivityLogsState, ActivityType } from '@/types/activityLog.types';
import activityLogService from '@/api/services/activityLogs.service';

const initialState: ActivityLogsState = {
  activityLogs: [],
  currentActivityLog: null,
  activityTypes: [],
  activityStats: null,
  isLoading: false,
  error: null,
  totalActivityLogs: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchActivityLogs = createAsyncThunk(
  'activityLogs/fetchActivityLogs',
  async (
    {
      page = 1,
      limit = 20,
      user = '',
      activityType = '',
      startDate = '',
      endDate = '',
      search = '',
    }: {
      page?: number;
      limit?: number;
      user?: string;
      activityType?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await activityLogService.getAllActivityLogs(
        page,
        limit,
        user,
        activityType,
        startDate,
        endDate,
        search
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

export const fetchActivityLogById = createAsyncThunk(
  'activityLogs/fetchActivityLogById',
  async (id: string, { rejectWithValue }) => {
    try {
      const activityLog = await activityLogService.getActivityLogById(id);
      return activityLog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity log');
    }
  }
);

export const fetchUserActivityLogs = createAsyncThunk(
  'activityLogs/fetchUserActivityLogs',
  async (
    {
      userId,
      page = 1,
      limit = 20,
      activityType = '',
      startDate = '',
      endDate = '',
    }: {
      userId: string;
      page?: number;
      limit?: number;
      activityType?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await activityLogService.getUserActivityLogs(
        userId,
        page,
        limit,
        activityType,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user activity logs');
    }
  }
);

export const fetchMyActivityLogs = createAsyncThunk(
  'activityLogs/fetchMyActivityLogs',
  async (
    {
      page = 1,
      limit = 20,
      activityType = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      activityType?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await activityLogService.getMyActivityLogs(
        page,
        limit,
        activityType,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my activity logs');
    }
  }
);

export const fetchActivityTypes = createAsyncThunk(
  'activityLogs/fetchActivityTypes',
  async (_, { rejectWithValue }) => {
    try {
      const activityTypes = await activityLogService.getActivityTypes();
      return activityTypes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity types');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'activityLogs/fetchActivityStats',
  async (
    { startDate = '', endDate = '' }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const stats = await activityLogService.getActivityStats(startDate, endDate);
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity stats');
    }
  }
);

const activityLogSlice = createSlice({
  name: 'activityLogs',
  initialState,
  reducers: {
    clearCurrentActivityLog: (state) => {
      state.currentActivityLog = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activity logs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activityLogs = action.payload.data;
        state.totalActivityLogs = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch activity log by ID
      .addCase(fetchActivityLogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentActivityLog = action.payload;
      })
      .addCase(fetchActivityLogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user activity logs
      .addCase(fetchUserActivityLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserActivityLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activityLogs = action.payload.data;
        state.totalActivityLogs = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchUserActivityLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch my activity logs
      .addCase(fetchMyActivityLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyActivityLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activityLogs = action.payload.data;
        state.totalActivityLogs = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchMyActivityLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch activity types
      .addCase(fetchActivityTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activityTypes = action.payload;
      })
      .addCase(fetchActivityTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch activity stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activityStats = action.payload;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentActivityLog, setError } = activityLogSlice.actions;

export default activityLogSlice.reducer;
