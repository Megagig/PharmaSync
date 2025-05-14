import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Permission {
  resource: string;
  action: string;
}

interface RoleState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  permissions: [],
  loading: false,
  error: null,
};

export const fetchUserPermissions = createAsyncThunk(
  'role/fetchUserPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      // This is a placeholder - in a real app, you would call your API service
      // const response = await roleService.getUserPermissions(userId);
      // return response.data;
      return [
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' },
      ];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user permissions');
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.permissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPermissions } = roleSlice.actions;

export default roleSlice.reducer;
