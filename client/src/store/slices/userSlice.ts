import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  UsersState,
  // User is used in return types but TypeScript doesn't recognize this pattern
  // User,
  UserFormData,
  UserProfileUpdateData,
  PasswordChangeData,
  // These types are not used directly in this file
  // TwoFactorSetupData,
  // TwoFactorVerifyData,
  // EmailVerificationData,
} from '@/types/user.types';
import {
  getUsers,
  getUserById,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  // These functions are not used directly in this file
  // verifyEmail,
  // resendEmailVerification,
  // setupTwoFactor,
  // verifyTwoFactor,
  // getTwoFactorBackupCodes,
  // generateTwoFactorBackupCodes,
  // disableTwoFactor,
  // getUserActivityLogs,
  changeUserPassword as changeUserPasswordApi,
} from '@/services/user.service';
import { getUserPermissions } from '@/services/role.service';

const initialState: UsersState = {
  users: [],
  currentUser: null,
  userPermissions: null,
  isLoading: false,
  error: null,
  totalUsers: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (
    params: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      isEmailVerified?: boolean;
      role?: string;
      roleType?: string;
      search?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getUsers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getUserById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserFormData, { rejectWithValue }) => {
    try {
      const response = await createUserApi(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: Partial<UserFormData>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateUserApi(id, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteUserApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'users/changeUserPassword',
  async (
    { id, password }: { id: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      await changeUserPasswordApi(id, password);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change user password'
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'users/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async (updateData: UserProfileUpdateData, { rejectWithValue }) => {
    try {
      const response = await updateCurrentUser(updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user profile'
      );
    }
  }
);

export const changeUserProfilePassword = createAsyncThunk(
  'users/changeUserProfilePassword',
  async (passwordData: PasswordChangeData, { rejectWithValue }) => {
    try {
      const response = await changePassword(passwordData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'users/fetchUserPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getUserPermissions(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user permissions'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;

        // Update in the list if present
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;

        // Remove from the list if present
        state.users = state.users.filter((user) => user.id !== action.payload);

        // Clear current user if it's the one that was deleted
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Change user password
      .addCase(changeUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Change user profile password
      .addCase(changeUserProfilePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserProfilePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changeUserProfilePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch user permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPermissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentUser, setError } = userSlice.actions;

export default userSlice.reducer;
