import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  MedicationsState,
  Medication,
  MedicationFormData,
  InventoryItem,
  SideEffect,
  Interaction,
} from '@/types/medication.types';
import medicationService from '@/api/services/medications.service';

const initialState: MedicationsState = {
  medications: [],
  currentMedication: null,
  isLoading: false,
  error: null,
  totalMedications: 0,
  totalPages: 0,
  currentPage: 1,
  lowStockMedications: [],
  expiringMedications: [],
};

// Async thunks
export const fetchMedications = createAsyncThunk(
  'medications/fetchMedications',
  async (
    {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      requiresPrescription,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      requiresPrescription?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await medicationService.getAllMedications(
        page,
        limit,
        search,
        category,
        requiresPrescription
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medications');
    }
  }
);

export const fetchMedicationById = createAsyncThunk(
  'medications/fetchMedicationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const medication = await medicationService.getMedicationById(id);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medication');
    }
  }
);

export const createMedication = createAsyncThunk(
  'medications/createMedication',
  async (medicationData: MedicationFormData, { rejectWithValue }) => {
    try {
      const medication = await medicationService.createMedication(medicationData);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create medication');
    }
  }
);

export const updateMedication = createAsyncThunk(
  'medications/updateMedication',
  async (
    { id, medicationData }: { id: string; medicationData: Partial<MedicationFormData> },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.updateMedication(id, medicationData);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update medication');
    }
  }
);

export const deleteMedication = createAsyncThunk(
  'medications/deleteMedication',
  async (id: string, { rejectWithValue }) => {
    try {
      await medicationService.deleteMedication(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete medication');
    }
  }
);

export const addInventoryItem = createAsyncThunk(
  'medications/addInventoryItem',
  async (
    { medicationId, inventoryData }: { medicationId: string; inventoryData: InventoryItem },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.addInventoryItem(medicationId, inventoryData);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add inventory item');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'medications/updateInventoryItem',
  async (
    {
      medicationId,
      itemId,
      updateData,
    }: { medicationId: string; itemId: string; updateData: Partial<InventoryItem> },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.updateInventoryItem(
        medicationId,
        itemId,
        updateData
      );
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

export const removeInventoryItem = createAsyncThunk(
  'medications/removeInventoryItem',
  async (
    { medicationId, itemId }: { medicationId: string; itemId: string },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.removeInventoryItem(medicationId, itemId);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove inventory item');
    }
  }
);

export const addSideEffect = createAsyncThunk(
  'medications/addSideEffect',
  async (
    { medicationId, sideEffectData }: { medicationId: string; sideEffectData: SideEffect },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.addSideEffect(medicationId, sideEffectData);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add side effect');
    }
  }
);

export const removeSideEffect = createAsyncThunk(
  'medications/removeSideEffect',
  async (
    { medicationId, sideEffectId }: { medicationId: string; sideEffectId: string },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.removeSideEffect(medicationId, sideEffectId);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove side effect');
    }
  }
);

export const addInteraction = createAsyncThunk(
  'medications/addInteraction',
  async (
    { medicationId, interactionData }: { medicationId: string; interactionData: Interaction },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.addInteraction(medicationId, interactionData);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add interaction');
    }
  }
);

export const removeInteraction = createAsyncThunk(
  'medications/removeInteraction',
  async (
    { medicationId, interactionId }: { medicationId: string; interactionId: string },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.removeInteraction(medicationId, interactionId);
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove interaction');
    }
  }
);

export const addContraindication = createAsyncThunk(
  'medications/addContraindication',
  async (
    { medicationId, contraindication }: { medicationId: string; contraindication: string },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.addContraindication(
        medicationId,
        contraindication
      );
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add contraindication');
    }
  }
);

export const removeContraindication = createAsyncThunk(
  'medications/removeContraindication',
  async (
    { medicationId, contraindication }: { medicationId: string; contraindication: string },
    { rejectWithValue }
  ) => {
    try {
      const medication = await medicationService.removeContraindication(
        medicationId,
        contraindication
      );
      return medication;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove contraindication');
    }
  }
);

export const fetchLowStockMedications = createAsyncThunk(
  'medications/fetchLowStockMedications',
  async (_, { rejectWithValue }) => {
    try {
      const medications = await medicationService.getLowStockMedications();
      return medications;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch low stock medications'
      );
    }
  }
);

export const fetchExpiringMedications = createAsyncThunk(
  'medications/fetchExpiringMedications',
  async (days: number = 90, { rejectWithValue }) => {
    try {
      const medications = await medicationService.getExpiringMedications(days);
      return medications;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expiring medications'
      );
    }
  }
);

const medicationSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    clearCurrentMedication: (state) => {
      state.currentMedication = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch medications
      .addCase(fetchMedications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medications = action.payload.data;
        state.totalMedications = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchMedications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch medication by ID
      .addCase(fetchMedicationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMedication = action.payload;
      })
      .addCase(fetchMedicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create medication
      .addCase(createMedication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMedication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medications.unshift(action.payload);
        state.totalMedications += 1;
      })
      .addCase(createMedication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update medication
      .addCase(updateMedication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMedication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMedication = action.payload;
        
        const index = state.medications.findIndex((medication) => medication.id === action.payload.id);
        if (index !== -1) {
          state.medications[index] = action.payload;
        }
      })
      .addCase(updateMedication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete medication
      .addCase(deleteMedication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medications = state.medications.filter((medication) => medication.id !== action.payload);
        state.totalMedications -= 1;
        if (state.currentMedication?.id === action.payload) {
          state.currentMedication = null;
        }
      })
      .addCase(deleteMedication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch low stock medications
      .addCase(fetchLowStockMedications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockMedications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockMedications = action.payload;
      })
      .addCase(fetchLowStockMedications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch expiring medications
      .addCase(fetchExpiringMedications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpiringMedications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expiringMedications = action.payload;
      })
      .addCase(fetchExpiringMedications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Handle all medication detail updates
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(removeInventoryItem.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(addSideEffect.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(removeSideEffect.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(addInteraction.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(removeInteraction.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(addContraindication.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      })
      .addCase(removeContraindication.fulfilled, (state, action) => {
        state.currentMedication = action.payload;
      });
  },
});

export const { clearCurrentMedication, setError } = medicationSlice.actions;

export default medicationSlice.reducer;
