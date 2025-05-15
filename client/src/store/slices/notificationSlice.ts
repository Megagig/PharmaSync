import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationTypes,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notification.service';
import {
  Notification,
  NotificationFilters,
  NotificationPreference,
  NotificationPreferenceUpdateData,
  NotificationState,
  NotificationType,
} from '@/types/notification.types';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  currentNotification: null,
  preferences: null,
  notificationTypes: [],
  isLoading: false,
  error: null,
  totalNotifications: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filters: NotificationFilters, { rejectWithValue }) => {
    try {
      const response = await getNotifications(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

export const fetchNotificationById = createAsyncThunk(
  'notifications/fetchNotificationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getNotificationById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notification'
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await markNotificationAsRead(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await markAllNotificationsAsRead();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to mark all notifications as read'
      );
    }
  }
);

export const archiveNotificationById = createAsyncThunk(
  'notifications/archiveNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await archiveNotification(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to archive notification'
      );
    }
  }
);

export const deleteNotificationById = createAsyncThunk(
  'notifications/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteNotification(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete notification'
      );
    }
  }
);

export const fetchNotificationTypes = createAsyncThunk(
  'notifications/fetchNotificationTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotificationTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notification types'
      );
    }
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'notifications/fetchNotificationPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotificationPreferences();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch notification preferences'
      );
    }
  }
);

export const updateNotificationPreferencesThunk = createAsyncThunk(
  'notifications/updateNotificationPreferences',
  async (data: NotificationPreferenceUpdateData, { rejectWithValue }) => {
    try {
      const response = await updateNotificationPreferences(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update notification preferences'
      );
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearCurrentNotification: (state) => {
      state.currentNotification = null;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.meta?.unreadCount || 0;
        state.totalNotifications = action.payload.meta?.total || 0;
        state.totalPages = action.payload.meta?.pages || 0;
        state.currentPage = action.payload.meta?.page || 1;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch notification by ID
      .addCase(fetchNotificationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNotification = action.payload.data;
      })
      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update the notification in the list
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload.data._id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload.data;
        }

        // Update current notification if it's the same
        if (
          state.currentNotification &&
          state.currentNotification._id === action.payload.data._id
        ) {
          state.currentNotification = action.payload.data;
        }

        // Update unread count
        if (!action.payload.data.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.unreadCount = 0;

        // Update all notifications in the list
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }));
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Archive notification
      .addCase(archiveNotificationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(archiveNotificationById.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update the notification in the list
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload.data._id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload.data;
        }

        // Update current notification if it's the same
        if (
          state.currentNotification &&
          state.currentNotification._id === action.payload.data._id
        ) {
          state.currentNotification = action.payload.data;
        }
      })
      .addCase(archiveNotificationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete notification
      .addCase(deleteNotificationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNotificationById.fulfilled, (state, action) => {
        state.isLoading = false;

        // Remove the notification from the list
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload
        );

        // Clear current notification if it's the same
        if (
          state.currentNotification &&
          state.currentNotification._id === action.payload
        ) {
          state.currentNotification = null;
        }

        // Update total count
        state.totalNotifications = Math.max(0, state.totalNotifications - 1);
      })
      .addCase(deleteNotificationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch notification types
      .addCase(fetchNotificationTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notificationTypes = action.payload.data;
      })
      .addCase(fetchNotificationTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch notification preferences
      .addCase(fetchNotificationPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.data;
      })
      .addCase(fetchNotificationPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update notification preferences
      .addCase(updateNotificationPreferencesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateNotificationPreferencesThunk.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.preferences = action.payload.data;
        }
      )
      .addCase(updateNotificationPreferencesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentNotification, clearNotificationError } =
  notificationSlice.actions;

export default notificationSlice.reducer;
