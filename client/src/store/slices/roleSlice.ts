import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  resetRolePermissions,
  getRoleUsers,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUserRolesByUserId,
  assignRoleToUserById,
  removeRoleFromUserById,
  getUserPermissions,
} from '@/services/role.service';
import {
  IRoleState,
  IRole,
  IRoleCreate,
  IRoleUpdate,
  IUserRole,
} from '@/types/role.types';

const initialState: IRoleState = {
  roles: [],
  currentRole: null,
  userRoles: [],
  userPermissions: null,
  isLoading: false,
  error: null,
  totalRoles: 0,
  totalUserRoles: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks for roles
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (
    params: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      isDefault?: boolean;
      type?: string;
      name?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getRoles(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch roles'
      );
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'role/fetchRoleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getRoleById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch role'
      );
    }
  }
);

export const createNewRole = createAsyncThunk(
  'role/createRole',
  async (data: IRoleCreate, { rejectWithValue }) => {
    try {
      const response = await createRole(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create role'
      );
    }
  }
);

export const updateRoleById = createAsyncThunk(
  'role/updateRole',
  async (
    { id, data }: { id: string; data: IRoleUpdate },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateRole(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update role'
      );
    }
  }
);

export const deleteRoleById = createAsyncThunk(
  'role/deleteRole',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteRole(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete role'
      );
    }
  }
);

export const resetRolePermissionsById = createAsyncThunk(
  'role/resetPermissions',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await resetRolePermissions(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset role permissions'
      );
    }
  }
);

// Async thunks for role users
export const fetchRoleUsers = createAsyncThunk(
  'role/fetchRoleUsers',
  async (
    { id, params }: { id: string; params?: { page?: number; limit?: number } },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRoleUsers(id, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch role users'
      );
    }
  }
);

export const assignUserToRole = createAsyncThunk(
  'role/assignUserToRole',
  async (
    { id, userId }: { id: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await assignRoleToUser(id, userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign user to role'
      );
    }
  }
);

export const removeUserFromRole = createAsyncThunk(
  'role/removeUserFromRole',
  async (
    { id, userId }: { id: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await removeRoleFromUser(id, userId);
      return { roleId: id, userId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove user from role'
      );
    }
  }
);

// Async thunks for user roles
export const fetchUserRoles = createAsyncThunk(
  'role/fetchUserRoles',
  async (
    params: {
      page?: number;
      limit?: number;
      user?: string;
      role?: string;
      assignedBy?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getUserRoles(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user roles'
      );
    }
  }
);

export const fetchUserRolesByUserId = createAsyncThunk(
  'role/fetchUserRolesByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getUserRolesByUserId(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user roles'
      );
    }
  }
);

export const assignRoleToUserByIds = createAsyncThunk(
  'role/assignRoleToUserByIds',
  async (
    { userId, roleId }: { userId: string; roleId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await assignRoleToUserById(userId, roleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign role to user'
      );
    }
  }
);

export const removeRoleFromUserByIds = createAsyncThunk(
  'role/removeRoleFromUserByIds',
  async (
    { userId, roleId }: { userId: string; roleId: string },
    { rejectWithValue }
  ) => {
    try {
      await removeRoleFromUserById(userId, roleId);
      return { userId, roleId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove role from user'
      );
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'role/fetchUserPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getUserPermissions(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user permissions'
      );
    }
  }
);

// Slice
const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
    clearRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.data;
        state.totalRoles = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch role by ID
      .addCase(fetchRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRole = action.payload.data;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create role
      .addCase(createNewRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = [action.payload.data, ...state.roles];
        state.currentRole = action.payload.data;
        state.totalRoles += 1;
      })
      .addCase(createNewRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update role
      .addCase(updateRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoleById.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update in the list
        const index = state.roles.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload.data;
        }

        // Update current role if it's the same
        if (
          state.currentRole &&
          state.currentRole.id === action.payload.data.id
        ) {
          state.currentRole = action.payload.data;
        }
      })
      .addCase(updateRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete role
      .addCase(deleteRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRoleById.fulfilled, (state, action) => {
        state.isLoading = false;

        // Remove from the list
        state.roles = state.roles.filter((r) => r.id !== action.payload);

        // Clear current role if it's the same
        if (state.currentRole && state.currentRole.id === action.payload) {
          state.currentRole = null;
        }

        state.totalRoles -= 1;
      })
      .addCase(deleteRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reset role permissions
      .addCase(resetRolePermissionsById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetRolePermissionsById.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update in the list
        const index = state.roles.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload.data;
        }

        // Update current role if it's the same
        if (
          state.currentRole &&
          state.currentRole.id === action.payload.data.id
        ) {
          state.currentRole = action.payload.data;
        }
      })
      .addCase(resetRolePermissionsById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch user roles
      .addCase(fetchUserRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRoles = action.payload.data;
        state.totalUserRoles = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentRole, clearRoleError } = roleSlice.actions;

export default roleSlice.reducer;
