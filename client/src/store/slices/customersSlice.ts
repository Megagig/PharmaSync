import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Customer,
  CustomerFormData,
  CustomerUpdateData,
} from '@/types/customer.types';
import customerService from '@/api/services/customers.service';

interface CustomersState {
  customers: Customer[];
  currentCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
}

const initialState: CustomersState = {
  customers: [],
  currentCustomer: null,
  isLoading: false,
  error: null,
  totalCustomers: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (
    params: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      type?: string;
      search?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await customerService.getAllCustomers(
        params.page,
        params.limit,
        params.isActive,
        params.type,
        params.search
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customers'
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customer'
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: CustomerFormData, { rejectWithValue }) => {
    try {
      const response = await customerService.createCustomer(customerData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create customer'
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async (
    { id, customerData }: { id: string; customerData: CustomerUpdateData },
    { rejectWithValue }
  ) => {
    try {
      const response = await customerService.updateCustomer(id, customerData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update customer'
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await customerService.deleteCustomer(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete customer'
      );
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearCustomersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.totalCustomers = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.push(action.payload);
        state.totalCustomers += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
        state.totalCustomers -= 1;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCustomer, clearCustomersError } =
  customersSlice.actions;

export default customersSlice.reducer;
