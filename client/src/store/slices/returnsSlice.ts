import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Return, 
  ReturnFormData, 
  ReturnUpdateData, 
  ReturnApproveData, 
  ReturnRefundData 
} from '../../types/return.types';
import returnService from '../../services/return.service';

interface ReturnsState {
  returns: Return[];
  currentReturn: Return | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: ReturnsState = {
  returns: [],
  currentReturn: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

export const fetchReturns = createAsyncThunk(
  'returns/fetchReturns',
  async (
    {
      page = 1,
      limit = 10,
      customer = '',
      status = '',
      refundStatus = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      customer?: string;
      status?: string;
      refundStatus?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await returnService.getAllReturns(
        page,
        limit,
        customer,
        status,
        refundStatus,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch returns');
    }
  }
);

export const fetchReturnById = createAsyncThunk(
  'returns/fetchReturnById',
  async (id: string, { rejectWithValue }) => {
    try {
      const returnData = await returnService.getReturnById(id);
      return returnData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch return');
    }
  }
);

export const createReturn = createAsyncThunk(
  'returns/createReturn',
  async (returnData: ReturnFormData, { rejectWithValue }) => {
    try {
      const returnDoc = await returnService.createReturn(returnData);
      return returnDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create return');
    }
  }
);

export const updateReturn = createAsyncThunk(
  'returns/updateReturn',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: ReturnUpdateData;
    },
    { rejectWithValue }
  ) => {
    try {
      const returnDoc = await returnService.updateReturn(id, updateData);
      return returnDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update return');
    }
  }
);

export const approveReturn = createAsyncThunk(
  'returns/approveReturn',
  async (
    {
      id,
      approveData,
    }: {
      id: string;
      approveData: ReturnApproveData;
    },
    { rejectWithValue }
  ) => {
    try {
      const returnDoc = await returnService.approveReturn(id, approveData);
      return returnDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve return');
    }
  }
);

export const processRefund = createAsyncThunk(
  'returns/processRefund',
  async (
    {
      id,
      refundData,
    }: {
      id: string;
      refundData: ReturnRefundData;
    },
    { rejectWithValue }
  ) => {
    try {
      const returnDoc = await returnService.processRefund(id, refundData);
      return returnDoc;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
    }
  }
);

const returnsSlice = createSlice({
  name: 'returns',
  initialState,
  reducers: {
    clearCurrentReturn: (state) => {
      state.currentReturn = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch returns
      .addCase(fetchReturns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.returns = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch return by ID
      .addCase(fetchReturnById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReturnById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReturn = action.payload;
      })
      .addCase(fetchReturnById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create return
      .addCase(createReturn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReturn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReturn = action.payload;
      })
      .addCase(createReturn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update return
      .addCase(updateReturn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReturn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReturn = action.payload;
        // Update in the list if present
        const index = state.returns.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
      })
      .addCase(updateReturn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Approve return
      .addCase(approveReturn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveReturn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReturn = action.payload;
        // Update in the list if present
        const index = state.returns.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
      })
      .addCase(approveReturn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Process refund
      .addCase(processRefund.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReturn = action.payload;
        // Update in the list if present
        const index = state.returns.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentReturn, setError } = returnsSlice.actions;

export default returnsSlice.reducer;
