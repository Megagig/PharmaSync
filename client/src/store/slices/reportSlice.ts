import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getReportConfigurations,
  getReportConfigurationById,
  createReportConfiguration,
  updateReportConfiguration,
  deleteReportConfiguration,
  generateReportFromConfiguration,
  generateReport,
  getReportExecutions,
  downloadReport,
  getReportSchedules,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
} from '@/services/report.service';
import {
  ReportState,
  ReportConfiguration,
  ReportConfigurationCreate,
  ReportConfigurationUpdate,
  ReportSchedule,
  ReportScheduleCreate,
  ReportScheduleUpdate,
  ReportExecution,
  ReportRequest,
  ReportFormat,
} from '@/types/report.types';

const initialState: ReportState = {
  configurations: [],
  currentConfiguration: null,
  schedules: [],
  executions: [],
  reportData: null,
  isLoading: false,
  error: null,
  totalConfigurations: 0,
  totalSchedules: 0,
  totalExecutions: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks for report configurations
export const fetchReportConfigurations = createAsyncThunk(
  'report/fetchConfigurations',
  async (params: { page?: number; limit?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await getReportConfigurations(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report configurations');
    }
  }
);

export const fetchReportConfigurationById = createAsyncThunk(
  'report/fetchConfigurationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getReportConfigurationById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report configuration');
    }
  }
);

export const createNewReportConfiguration = createAsyncThunk(
  'report/createConfiguration',
  async (data: ReportConfigurationCreate, { rejectWithValue }) => {
    try {
      const response = await createReportConfiguration(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create report configuration');
    }
  }
);

export const updateReportConfigurationById = createAsyncThunk(
  'report/updateConfiguration',
  async ({ id, data }: { id: string; data: ReportConfigurationUpdate }, { rejectWithValue }) => {
    try {
      const response = await updateReportConfiguration(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update report configuration');
    }
  }
);

export const deleteReportConfigurationById = createAsyncThunk(
  'report/deleteConfiguration',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteReportConfiguration(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete report configuration');
    }
  }
);

// Async thunks for report generation
export const generateReportFromConfig = createAsyncThunk(
  'report/generateFromConfig',
  async ({ id, format }: { id: string; format: ReportFormat }, { rejectWithValue }) => {
    try {
      const response = await generateReportFromConfiguration(id, format);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

export const generateCustomReport = createAsyncThunk(
  'report/generateCustom',
  async (data: ReportRequest, { rejectWithValue }) => {
    try {
      const response = await generateReport(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

// Async thunks for report executions
export const fetchReportExecutions = createAsyncThunk(
  'report/fetchExecutions',
  async (params: { page?: number; limit?: number; report?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await getReportExecutions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report executions');
    }
  }
);

export const downloadReportFile = createAsyncThunk(
  'report/downloadReport',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await downloadReport(id);
      return { id, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download report');
    }
  }
);

// Async thunks for report schedules
export const fetchReportSchedules = createAsyncThunk(
  'report/fetchSchedules',
  async (params: { page?: number; limit?: number; report?: string; isActive?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await getReportSchedules(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report schedules');
    }
  }
);

export const createNewReportSchedule = createAsyncThunk(
  'report/createSchedule',
  async (data: ReportScheduleCreate, { rejectWithValue }) => {
    try {
      const response = await createReportSchedule(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create report schedule');
    }
  }
);

export const updateReportScheduleById = createAsyncThunk(
  'report/updateSchedule',
  async ({ id, data }: { id: string; data: ReportScheduleUpdate }, { rejectWithValue }) => {
    try {
      const response = await updateReportSchedule(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update report schedule');
    }
  }
);

export const deleteReportScheduleById = createAsyncThunk(
  'report/deleteSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteReportSchedule(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete report schedule');
    }
  }
);

// Slice
const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearCurrentConfiguration: (state) => {
      state.currentConfiguration = null;
    },
    clearReportData: (state) => {
      state.reportData = null;
    },
    clearReportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch report configurations
      .addCase(fetchReportConfigurations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportConfigurations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configurations = action.payload.data;
        state.totalConfigurations = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchReportConfigurations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch report configuration by ID
      .addCase(fetchReportConfigurationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportConfigurationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConfiguration = action.payload.data;
      })
      .addCase(fetchReportConfigurationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create report configuration
      .addCase(createNewReportConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewReportConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configurations = [action.payload.data, ...state.configurations];
        state.currentConfiguration = action.payload.data;
        state.totalConfigurations += 1;
      })
      .addCase(createNewReportConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update report configuration
      .addCase(updateReportConfigurationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReportConfigurationById.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update in the list
        const index = state.configurations.findIndex(c => c.id === action.payload.data.id);
        if (index !== -1) {
          state.configurations[index] = action.payload.data;
        }
        
        // Update current configuration if it's the same
        if (state.currentConfiguration && state.currentConfiguration.id === action.payload.data.id) {
          state.currentConfiguration = action.payload.data;
        }
      })
      .addCase(updateReportConfigurationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete report configuration
      .addCase(deleteReportConfigurationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReportConfigurationById.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from the list
        state.configurations = state.configurations.filter(c => c.id !== action.payload);
        
        // Clear current configuration if it's the same
        if (state.currentConfiguration && state.currentConfiguration.id === action.payload) {
          state.currentConfiguration = null;
        }
        
        state.totalConfigurations -= 1;
      })
      .addCase(deleteReportConfigurationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Generate report from configuration
      .addCase(generateReportFromConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReportFromConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportData = action.payload.data;
      })
      .addCase(generateReportFromConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Generate custom report
      .addCase(generateCustomReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportData = action.payload.data;
      })
      .addCase(generateCustomReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch report executions
      .addCase(fetchReportExecutions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportExecutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.executions = action.payload.data;
        state.totalExecutions = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchReportExecutions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Download report
      .addCase(downloadReportFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(downloadReportFile.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(downloadReportFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch report schedules
      .addCase(fetchReportSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = action.payload.data;
        state.totalSchedules = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchReportSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create report schedule
      .addCase(createNewReportSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewReportSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = [action.payload.data, ...state.schedules];
        state.totalSchedules += 1;
      })
      .addCase(createNewReportSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update report schedule
      .addCase(updateReportScheduleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReportScheduleById.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update in the list
        const index = state.schedules.findIndex(s => s.id === action.payload.data.id);
        if (index !== -1) {
          state.schedules[index] = action.payload.data;
        }
      })
      .addCase(updateReportScheduleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete report schedule
      .addCase(deleteReportScheduleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReportScheduleById.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from the list
        state.schedules = state.schedules.filter(s => s.id !== action.payload);
        state.totalSchedules -= 1;
      })
      .addCase(deleteReportScheduleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentConfiguration, clearReportData, clearReportError } = reportSlice.actions;

export default reportSlice.reducer;
