import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SuppliersState, Supplier, SupplierFormData } from '@/types/supplier.types';
import supplierService from '@/api/services/suppliers.service';

const initialState: SuppliersState = {
  suppliers: [],
  currentSupplier: null,
  isLoading: false,
  error: null,
  totalSuppliers: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (
    {
      page = 1,
      limit = 10,
      isActive = '',
      preferredSupplier = '',
      search = '',
      category = '',
    }: {
      page?: number;
      limit?: number;
      isActive?: string;
      preferredSupplier?: string;
      search?: string;
      category?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await supplierService.getAllSuppliers(
        page,
        limit,
        isActive,
        preferredSupplier,
        search,
        category
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id: string, { rejectWithValue }) => {
    try {
      const supplier = await supplierService.getSupplierById(id);
      return supplier;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch supplier');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData: SupplierFormData, { rejectWithValue }) => {
    try {
      const supplier = await supplierService.createSupplier(supplierData);
      return supplier;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: Partial<SupplierFormData>;
    },
    { rejectWithValue }
  ) => {
    try {
      const supplier = await supplierService.updateSupplier(id, updateData);
      return supplier;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id: string, { rejectWithValue }) => {
    try {
      await supplierService.deleteSupplier(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier');
    }
  }
);

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearCurrentSupplier: (state) => {
      state.currentSupplier = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload.data;
        state.totalSuppliers = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch supplier by ID
      .addCase(fetchSupplierById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSupplier = action.payload;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSupplier = action.payload;
        
        // Update in the list if present
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from the list if present
        state.suppliers = state.suppliers.filter((supplier) => supplier.id !== action.payload);
        
        // Clear current supplier if it's the one that was deleted
        if (state.currentSupplier && state.currentSupplier.id === action.payload) {
          state.currentSupplier = null;
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSupplier, setError } = supplierSlice.actions;

export default supplierSlice.reducer;
