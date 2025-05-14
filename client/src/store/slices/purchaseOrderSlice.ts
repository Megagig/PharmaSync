import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PurchaseOrdersState,
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseOrderReceiveData,
  PurchaseOrderStatus,
} from '@/types/purchaseOrder.types';
import purchaseOrderService from '@/api/services/purchaseOrders.service';

const initialState: PurchaseOrdersState = {
  purchaseOrders: [],
  currentPurchaseOrder: null,
  isLoading: false,
  error: null,
  totalPurchaseOrders: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchPurchaseOrders = createAsyncThunk(
  'purchaseOrders/fetchPurchaseOrders',
  async (
    {
      page = 1,
      limit = 10,
      supplier = '',
      status = '',
      paymentStatus = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      supplier?: string;
      status?: string;
      paymentStatus?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await purchaseOrderService.getAllPurchaseOrders(
        page,
        limit,
        supplier,
        status,
        paymentStatus,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  }
);

export const fetchPurchaseOrderById = createAsyncThunk(
  'purchaseOrders/fetchPurchaseOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(id);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase order');
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'purchaseOrders/createPurchaseOrder',
  async (purchaseOrderData: PurchaseOrderFormData, { rejectWithValue }) => {
    try {
      const purchaseOrder = await purchaseOrderService.createPurchaseOrder(purchaseOrderData);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create purchase order');
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  'purchaseOrders/updatePurchaseOrder',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        expectedDeliveryDate?: string;
        status?: PurchaseOrderStatus;
        discount?: number;
        tax?: number;
        shippingCost?: number;
        paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
        paymentStatus?: 'unpaid' | 'partial' | 'paid';
        notes?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(id, updateData);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update purchase order');
    }
  }
);

export const addPurchaseOrderItem = createAsyncThunk(
  'purchaseOrders/addPurchaseOrderItem',
  async (
    {
      purchaseOrderId,
      itemData,
    }: {
      purchaseOrderId: string;
      itemData: {
        medication: string;
        quantity: number;
        unitPrice: number;
        notes?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const purchaseOrder = await purchaseOrderService.addPurchaseOrderItem(
        purchaseOrderId,
        itemData
      );
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add purchase order item');
    }
  }
);

export const updatePurchaseOrderItem = createAsyncThunk(
  'purchaseOrders/updatePurchaseOrderItem',
  async (
    {
      purchaseOrderId,
      itemId,
      updateData,
    }: {
      purchaseOrderId: string;
      itemId: string;
      updateData: {
        quantity?: number;
        unitPrice?: number;
        notes?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const purchaseOrder = await purchaseOrderService.updatePurchaseOrderItem(
        purchaseOrderId,
        itemId,
        updateData
      );
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update purchase order item'
      );
    }
  }
);

export const removePurchaseOrderItem = createAsyncThunk(
  'purchaseOrders/removePurchaseOrderItem',
  async (
    { purchaseOrderId, itemId }: { purchaseOrderId: string; itemId: string },
    { rejectWithValue }
  ) => {
    try {
      const purchaseOrder = await purchaseOrderService.removePurchaseOrderItem(
        purchaseOrderId,
        itemId
      );
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove purchase order item'
      );
    }
  }
);

export const approvePurchaseOrder = createAsyncThunk(
  'purchaseOrders/approvePurchaseOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const purchaseOrder = await purchaseOrderService.approvePurchaseOrder(id);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve purchase order');
    }
  }
);

export const markAsOrdered = createAsyncThunk(
  'purchaseOrders/markAsOrdered',
  async (id: string, { rejectWithValue }) => {
    try {
      const purchaseOrder = await purchaseOrderService.markAsOrdered(id);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark purchase order as ordered'
      );
    }
  }
);

export const receivePurchaseOrder = createAsyncThunk(
  'purchaseOrders/receivePurchaseOrder',
  async (
    { id, receiveData }: { id: string; receiveData: PurchaseOrderReceiveData },
    { rejectWithValue }
  ) => {
    try {
      const purchaseOrder = await purchaseOrderService.receivePurchaseOrder(id, receiveData);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to receive purchase order');
    }
  }
);

export const cancelPurchaseOrder = createAsyncThunk(
  'purchaseOrders/cancelPurchaseOrder',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const purchaseOrder = await purchaseOrderService.cancelPurchaseOrder(id, reason);
      return purchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel purchase order');
    }
  }
);

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    clearCurrentPurchaseOrder: (state) => {
      state.currentPurchaseOrder = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch purchase orders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchaseOrders = action.payload.data;
        state.totalPurchaseOrders = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch purchase order by ID
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create purchase order
      .addCase(createPurchaseOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update purchase order
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // All other actions follow the same pattern
      .addCase(addPurchaseOrderItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(updatePurchaseOrderItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(removePurchaseOrderItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(approvePurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
        
        // Update in the list if present
        const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })
      .addCase(markAsOrdered.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
        
        // Update in the list if present
        const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })
      .addCase(receivePurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
        
        // Update in the list if present
        const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })
      .addCase(cancelPurchaseOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPurchaseOrder = action.payload;
        
        // Update in the list if present
        const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentPurchaseOrder, setError } = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;
