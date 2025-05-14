import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ScheduleState,
  ScheduleShiftFormData,
  TimeOffRequestFormData,
  TimeOffRequestUpdateData,
} from '@/types/schedule.types';
import scheduleService from '@/api/services/schedule.service';

const initialState: ScheduleState = {
  shifts: [],
  currentShift: null,
  timeOffRequests: [],
  currentTimeOffRequest: null,
  isLoading: false,
  error: null,
  totalShifts: 0,
  totalShiftPages: 0,
  currentShiftPage: 1,
  totalTimeOffRequests: 0,
  totalTimeOffRequestPages: 0,
  currentTimeOffRequestPage: 1,
};

// Shift async thunks
export const fetchShifts = createAsyncThunk(
  'schedule/fetchShifts',
  async (
    {
      page = 1,
      limit = 50,
      user = '',
      shiftType = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      user?: string;
      shiftType?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await scheduleService.getAllShifts(
        page,
        limit,
        user,
        shiftType,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shifts');
    }
  }
);

export const fetchShiftById = createAsyncThunk(
  'schedule/fetchShiftById',
  async (id: string, { rejectWithValue }) => {
    try {
      const shift = await scheduleService.getShiftById(id);
      return shift;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shift');
    }
  }
);

export const createShift = createAsyncThunk(
  'schedule/createShift',
  async (shiftData: ScheduleShiftFormData, { rejectWithValue }) => {
    try {
      const shift = await scheduleService.createShift(shiftData);
      return shift;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create shift');
    }
  }
);

export const updateShift = createAsyncThunk(
  'schedule/updateShift',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: Partial<ScheduleShiftFormData>;
    },
    { rejectWithValue }
  ) => {
    try {
      const shift = await scheduleService.updateShift(id, updateData);
      return shift;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update shift');
    }
  }
);

export const deleteShift = createAsyncThunk(
  'schedule/deleteShift',
  async (id: string, { rejectWithValue }) => {
    try {
      await scheduleService.deleteShift(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete shift');
    }
  }
);

// Time off request async thunks
export const fetchTimeOffRequests = createAsyncThunk(
  'schedule/fetchTimeOffRequests',
  async (
    {
      page = 1,
      limit = 20,
      user = '',
      status = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      user?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await scheduleService.getAllTimeOffRequests(
        page,
        limit,
        user,
        status,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch time off requests');
    }
  }
);

export const fetchTimeOffRequestById = createAsyncThunk(
  'schedule/fetchTimeOffRequestById',
  async (id: string, { rejectWithValue }) => {
    try {
      const timeOffRequest = await scheduleService.getTimeOffRequestById(id);
      return timeOffRequest;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch time off request');
    }
  }
);

export const createTimeOffRequest = createAsyncThunk(
  'schedule/createTimeOffRequest',
  async (requestData: TimeOffRequestFormData, { rejectWithValue }) => {
    try {
      const timeOffRequest = await scheduleService.createTimeOffRequest(requestData);
      return timeOffRequest;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create time off request');
    }
  }
);

export const updateTimeOffRequestStatus = createAsyncThunk(
  'schedule/updateTimeOffRequestStatus',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: TimeOffRequestUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const timeOffRequest = await scheduleService.updateTimeOffRequestStatus(id, updateData);
      return timeOffRequest;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update time off request status'
      );
    }
  }
);

export const deleteTimeOffRequest = createAsyncThunk(
  'schedule/deleteTimeOffRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      await scheduleService.deleteTimeOffRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete time off request');
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearCurrentShift: (state) => {
      state.currentShift = null;
    },
    clearCurrentTimeOffRequest: (state) => {
      state.currentTimeOffRequest = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shifts
      .addCase(fetchShifts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shifts = action.payload.data;
        state.totalShifts = action.payload.meta.total;
        state.totalShiftPages = action.payload.meta.pages;
        state.currentShiftPage = action.payload.meta.page;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch shift by ID
      .addCase(fetchShiftById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShiftById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShift = action.payload;
      })
      .addCase(fetchShiftById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create shift
      .addCase(createShift.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShift = action.payload;
        state.shifts.push(action.payload);
      })
      .addCase(createShift.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update shift
      .addCase(updateShift.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShift = action.payload;
        
        // Update in the list if present
        const index = state.shifts.findIndex((shift) => shift.id === action.payload.id);
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete shift
      .addCase(deleteShift.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from the list if present
        state.shifts = state.shifts.filter((shift) => shift.id !== action.payload);
        
        // Clear current shift if it's the one that was deleted
        if (state.currentShift && state.currentShift.id === action.payload) {
          state.currentShift = null;
        }
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch time off requests
      .addCase(fetchTimeOffRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeOffRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeOffRequests = action.payload.data;
        state.totalTimeOffRequests = action.payload.meta.total;
        state.totalTimeOffRequestPages = action.payload.meta.pages;
        state.currentTimeOffRequestPage = action.payload.meta.page;
      })
      .addCase(fetchTimeOffRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch time off request by ID
      .addCase(fetchTimeOffRequestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeOffRequestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimeOffRequest = action.payload;
      })
      .addCase(fetchTimeOffRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create time off request
      .addCase(createTimeOffRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTimeOffRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimeOffRequest = action.payload;
        state.timeOffRequests.push(action.payload);
      })
      .addCase(createTimeOffRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update time off request status
      .addCase(updateTimeOffRequestStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTimeOffRequestStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTimeOffRequest = action.payload;
        
        // Update in the list if present
        const index = state.timeOffRequests.findIndex((request) => request.id === action.payload.id);
        if (index !== -1) {
          state.timeOffRequests[index] = action.payload;
        }
      })
      .addCase(updateTimeOffRequestStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete time off request
      .addCase(deleteTimeOffRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTimeOffRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from the list if present
        state.timeOffRequests = state.timeOffRequests.filter(
          (request) => request.id !== action.payload
        );
        
        // Clear current time off request if it's the one that was deleted
        if (state.currentTimeOffRequest && state.currentTimeOffRequest.id === action.payload) {
          state.currentTimeOffRequest = null;
        }
      })
      .addCase(deleteTimeOffRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentShift, clearCurrentTimeOffRequest, setError } = scheduleSlice.actions;

export default scheduleSlice.reducer;
