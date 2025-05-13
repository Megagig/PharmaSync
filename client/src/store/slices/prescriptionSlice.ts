import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PrescriptionsState,
  Prescription,
  PrescriptionFormData,
  PrescriptionItemFormData,
  DispensingFormData,
  PrescriptionStatus,
} from '@/types/prescription.types';
import prescriptionService from '@/api/services/prescriptions.service';

const initialState: PrescriptionsState = {
  prescriptions: [],
  currentPrescription: null,
  isLoading: false,
  error: null,
  totalPrescriptions: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchPrescriptions = createAsyncThunk(
  'prescriptions/fetchPrescriptions',
  async (
    {
      page = 1,
      limit = 10,
      patient = '',
      status = '',
      search = '',
      startDate = '',
      endDate = '',
    }: {
      page?: number;
      limit?: number;
      patient?: string;
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await prescriptionService.getAllPrescriptions(
        page,
        limit,
        patient,
        status,
        search,
        startDate,
        endDate
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

export const fetchPrescriptionById = createAsyncThunk(
  'prescriptions/fetchPrescriptionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const prescription = await prescriptionService.getPrescriptionById(id);
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescription');
    }
  }
);

export const createPrescription = createAsyncThunk(
  'prescriptions/createPrescription',
  async (
    prescriptionData: PrescriptionFormData & { items: PrescriptionItemFormData[] },
    { rejectWithValue }
  ) => {
    try {
      const prescription = await prescriptionService.createPrescription(prescriptionData);
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create prescription');
    }
  }
);

export const updatePrescription = createAsyncThunk(
  'prescriptions/updatePrescription',
  async (
    {
      id,
      updateData,
    }: {
      id: string;
      updateData: {
        status?: PrescriptionStatus;
        expiryDate?: string;
        notes?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const prescription = await prescriptionService.updatePrescription(id, updateData);
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prescription');
    }
  }
);

export const cancelPrescription = createAsyncThunk(
  'prescriptions/cancelPrescription',
  async (id: string, { rejectWithValue }) => {
    try {
      const prescription = await prescriptionService.cancelPrescription(id);
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel prescription');
    }
  }
);

export const addPrescriptionItem = createAsyncThunk(
  'prescriptions/addPrescriptionItem',
  async (
    {
      prescriptionId,
      itemData,
    }: {
      prescriptionId: string;
      itemData: PrescriptionItemFormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const prescription = await prescriptionService.addPrescriptionItem(prescriptionId, itemData);
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add prescription item');
    }
  }
);

export const updatePrescriptionItem = createAsyncThunk(
  'prescriptions/updatePrescriptionItem',
  async (
    {
      prescriptionId,
      itemId,
      updateData,
    }: {
      prescriptionId: string;
      itemId: string;
      updateData: Partial<PrescriptionItemFormData & { refillsRemaining?: number }>;
    },
    { rejectWithValue }
  ) => {
    try {
      const prescription = await prescriptionService.updatePrescriptionItem(
        prescriptionId,
        itemId,
        updateData
      );
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prescription item');
    }
  }
);

export const removePrescriptionItem = createAsyncThunk(
  'prescriptions/removePrescriptionItem',
  async (
    { prescriptionId, itemId }: { prescriptionId: string; itemId: string },
    { rejectWithValue }
  ) => {
    try {
      const prescription = await prescriptionService.removePrescriptionItem(prescriptionId, itemId);
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove prescription item');
    }
  }
);

export const dispenseMedication = createAsyncThunk(
  'prescriptions/dispenseMedication',
  async (
    {
      prescriptionId,
      dispensingData,
    }: {
      prescriptionId: string;
      dispensingData: DispensingFormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const prescription = await prescriptionService.dispenseMedication(
        prescriptionId,
        dispensingData
      );
      return prescription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dispense medication');
    }
  }
);

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch prescriptions
      .addCase(fetchPrescriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prescriptions = action.payload.data;
        state.totalPrescriptions = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch prescription by ID
      .addCase(fetchPrescriptionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(fetchPrescriptionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create prescription
      .addCase(createPrescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update prescription
      .addCase(updatePrescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // All other actions follow the same pattern
      .addCase(cancelPrescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(addPrescriptionItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(updatePrescriptionItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(removePrescriptionItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(dispenseMedication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrescription = action.payload;
      });
  },
});

export const { clearCurrentPrescription, setError } = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
