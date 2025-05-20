import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PosSession,
  PosSessionFormData,
  PosSessionCloseData,
  PosTransaction,
  PosTransactionFormData,
  PosReceiptData,
} from '../../types/pos.types';
import PosService from '@/services/pos.service';

interface PosState {
  sessions: PosSession[];
  currentSession: PosSession | null;
  activeSession: PosSession | null;
  transactions: PosTransaction[];
  currentTransaction: PosTransaction | null;
  receiptData: PosReceiptData | null;
  isLoading: boolean;
  error: string | null;
  sessionsMeta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  transactionsMeta: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const initialState: PosState = {
  sessions: [],
  currentSession: null,
  activeSession: null,
  transactions: [],
  currentTransaction: null,
  receiptData: null,
  isLoading: false,
  error: null,
  sessionsMeta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
  transactionsMeta: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
};

// Session Thunks
export const fetchPosSessions = createAsyncThunk(
  'pos/fetchSessions',
  async (params: {
    page?: number;
    limit?: number;
    status?: string;
    location?: string;
    user?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await PosService.getPosSessions(params);
    return response;
  }
);

export const fetchPosSessionById = createAsyncThunk(
  'pos/fetchSessionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await PosService.getPosSessionById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch POS session'
      );
    }
  }
);

export const fetchActivePosSession = createAsyncThunk(
  'pos/fetchActiveSession',
  async ({ location, register }: { location: string; register: string }) => {
    const response = await PosService.getActivePosSession(location, register);
    return response;
  }
);

export const createPosSession = createAsyncThunk(
  'pos/createSession',
  async (sessionData: PosSessionFormData) => {
    const response = await PosService.createPosSession(sessionData);
    return response;
  }
);

export const closePosSession = createAsyncThunk(
  'pos/closeSession',
  async (
    { id, closeData }: { id: string; closeData: PosSessionCloseData },
    { rejectWithValue }
  ) => {
    try {
      const response = await PosService.closePosSession(id, closeData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to close POS session'
      );
    }
  }
);

export const deletePosSession = createAsyncThunk(
  'pos/deleteSession',
  async (id: string, { rejectWithValue }) => {
    try {
      await PosService.deletePosSession(id);
      return id; // Return the ID for removing from state
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete POS session'
      );
    }
  }
);

// Transaction Thunks
export const fetchPosTransactions = createAsyncThunk(
  'pos/fetchTransactions',
  async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    paymentStatus?: string;
    customer?: string;
    location?: string;
    session?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await PosService.getPosTransactions(params);
    return response;
  }
);

export const fetchPosTransactionById = createAsyncThunk(
  'pos/fetchTransactionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await PosService.getPosTransactionById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch POS transaction'
      );
    }
  }
);

export const createPosTransaction = createAsyncThunk(
  'pos/createTransaction',
  async (transactionData: PosTransactionFormData) => {
    const response = await PosService.createPosTransaction(transactionData);
    return response;
  }
);

export const generatePosReceipt = createAsyncThunk(
  'pos/generateReceipt',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await PosService.generatePosReceipt(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to generate receipt'
      );
    }
  }
);

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    clearPosError: (state) => {
      state.error = null;
    },
    clearReceiptData: (state) => {
      state.receiptData = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearActiveSession: (state) => {
      state.activeSession = null;
    },
  },
  extraReducers: (builder) => {
    // Session reducers
    builder
      .addCase(fetchPosSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.data;
        state.sessionsMeta = action.payload.meta;
      })
      .addCase(fetchPosSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })
      .addCase(fetchPosSessionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosSessionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchPosSessionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchActivePosSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivePosSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = action.payload;
      })
      .addCase(fetchActivePosSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch active session';
      })
      .addCase(createPosSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPosSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = action.payload;
        state.sessions.unshift(action.payload);
      })
      .addCase(createPosSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create session';
      })
      .addCase(closePosSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(closePosSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = null;
        state.currentSession = action.payload;
        state.sessions = state.sessions.map((session) =>
          session._id === action.payload._id ? action.payload : session
        );
      })
      .addCase(closePosSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePosSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePosSession.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the deleted session from the sessions array
        state.sessions = state.sessions.filter(
          (session) => session._id !== action.payload
        );
        // If the current session is the one being deleted, clear it
        if (
          state.currentSession &&
          state.currentSession._id === action.payload
        ) {
          state.currentSession = null;
        }
      })
      .addCase(deletePosSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Transaction reducers
      .addCase(fetchPosTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.transactionsMeta = {
          total: action.payload.total,
          pages: action.payload.pages,
          page: action.payload.page,
          limit: action.payload.limit
        };
      })
      .addCase(fetchPosTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(fetchPosTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchPosTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPosTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPosTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
        state.transactions.unshift(action.payload);
      })
      .addCase(createPosTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })
      .addCase(generatePosReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generatePosReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receiptData = action.payload;
      })
      .addCase(generatePosReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPosError, clearReceiptData, setError, clearActiveSession } = posSlice.actions;

export default posSlice.reducer;
