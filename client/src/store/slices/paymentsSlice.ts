import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Payment, PaymentFormData, PaymentUpdateData } from '../../types/payment.types';
import paymentService from '../../services/payment.service';

interface PaymentsState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (
    {
      page = 1,
      limit = 10,
      direction = '',
      paymentMethod = '',
      customer = '',
      supplier = '',
      invoice = '',
      sale = '',
      purchaseOrder = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      direction?: string;
      paymentMethod?: string;
      customer?: string;
      supplier?: string;
      invoice?: string;
      sale?: string;
      purchaseOrder?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await paymentService.getAllPayments(
        page,
        limit,
        direction,
        paymentMethod,
        customer,
        supplier,
        invoice,
        sale,
        purchaseOrder,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const payment = await paymentService.getPaymentById(id);
      return payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData: PaymentFormData, { rejectWithValue }) => {
    try {
      const payment = await paymentService.createPayment(paymentData);
      return payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
    }
  }
);

export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: PaymentUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const payment = await paymentService.updatePayment(id, updateData);
      return payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
        // Update in the list if present
        const index = state.payments.findIndex((payment) => payment._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPayment, setError } = paymentsSlice.actions;

export default paymentsSlice.reducer;
