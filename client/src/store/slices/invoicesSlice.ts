import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Invoice, InvoiceFormData, InvoiceUpdateData } from '../../types/invoice.types';
import invoiceService from '../../services/invoice.service';

interface InvoicesState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: InvoicesState = {
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (
    {
      page = 1,
      limit = 10,
      type = '',
      status = '',
      customer = '',
      supplier = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      customer?: string;
      supplier?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await invoiceService.getAllInvoices(
        page,
        limit,
        type,
        status,
        customer,
        supplier,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const invoice = await invoiceService.getInvoiceById(id);
      return invoice;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: InvoiceFormData, { rejectWithValue }) => {
    try {
      const invoice = await invoiceService.createInvoice(invoiceData);
      return invoice;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: InvoiceUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const invoice = await invoiceService.updateInvoice(id, updateData);
      return invoice;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch invoice by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
        // Update in the list if present
        const index = state.invoices.findIndex((invoice) => invoice._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentInvoice, setError } = invoicesSlice.actions;

export default invoicesSlice.reducer;
