import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Reminder, 
  ReminderFormData, 
  ReminderUpdateData 
} from '../../types/reminder.types';
import reminderService from '../../services/reminder.service';

interface RemindersState {
  reminders: Reminder[];
  currentReminder: Reminder | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: RemindersState = {
  reminders: [],
  currentReminder: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchReminders = createAsyncThunk(
  'reminders/fetchReminders',
  async (
    {
      page = 1,
      limit = 10,
      customer = '',
      type = '',
      status = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      customer?: string;
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await reminderService.getAllReminders(
        page,
        limit,
        customer,
        type,
        status,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reminders');
    }
  }
);

export const fetchReminderById = createAsyncThunk(
  'reminders/fetchReminderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const reminder = await reminderService.getReminderById(id);
      return reminder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reminder');
    }
  }
);

export const createReminder = createAsyncThunk(
  'reminders/createReminder',
  async (reminderData: ReminderFormData, { rejectWithValue }) => {
    try {
      const reminder = await reminderService.createReminder(reminderData);
      return reminder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reminder');
    }
  }
);

export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: ReminderUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const reminder = await reminderService.updateReminder(id, updateData);
      return reminder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reminder');
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      await reminderService.deleteReminder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reminder');
    }
  }
);

export const sendReminder = createAsyncThunk(
  'reminders/sendReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      const reminder = await reminderService.sendReminder(id);
      return reminder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reminder');
    }
  }
);

export const generateInvoiceDueReminders = createAsyncThunk(
  'reminders/generateInvoiceDueReminders',
  async (_, { rejectWithValue }) => {
    try {
      const result = await reminderService.generateInvoiceDueReminders();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice due reminders');
    }
  }
);

export const generateInvoiceOverdueReminders = createAsyncThunk(
  'reminders/generateInvoiceOverdueReminders',
  async (_, { rejectWithValue }) => {
    try {
      const result = await reminderService.generateInvoiceOverdueReminders();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice overdue reminders');
    }
  }
);

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    clearCurrentReminder: (state) => {
      state.currentReminder = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reminders
      .addCase(fetchReminders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reminders = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch reminder by ID
      .addCase(fetchReminderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReminderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReminder = action.payload;
      })
      .addCase(fetchReminderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create reminder
      .addCase(createReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReminder = action.payload;
        state.reminders.unshift(action.payload);
      })
      .addCase(createReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update reminder
      .addCase(updateReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReminder = action.payload;
        
        // Update in the list if present
        const index = state.reminders.findIndex((reminder) => reminder._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(updateReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete reminder
      .addCase(deleteReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reminders = state.reminders.filter(
          (reminder) => reminder._id !== action.payload
        );
        if (state.currentReminder && state.currentReminder._id === action.payload) {
          state.currentReminder = null;
        }
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send reminder
      .addCase(sendReminder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReminder = action.payload;
        
        // Update in the list if present
        const index = state.reminders.findIndex((reminder) => reminder._id === action.payload._id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(sendReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate invoice due reminders
      .addCase(generateInvoiceDueReminders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInvoiceDueReminders.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new reminders to the list
        state.reminders = [...action.payload.reminders, ...state.reminders];
      })
      .addCase(generateInvoiceDueReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate invoice overdue reminders
      .addCase(generateInvoiceOverdueReminders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInvoiceOverdueReminders.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new reminders to the list
        state.reminders = [...action.payload.reminders, ...state.reminders];
      })
      .addCase(generateInvoiceOverdueReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentReminder, setError } = remindersSlice.actions;

export default remindersSlice.reducer;
