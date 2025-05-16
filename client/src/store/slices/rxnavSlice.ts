import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import rxnavService from '@/api/services/rxnav.service';

interface RxNavState {
  searchResults: any[];
  currentMedication: any | null;
  interactions: any[];
  sideEffects: any[];
  contraindications: any[];
  dosageInfo: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RxNavState = {
  searchResults: [],
  currentMedication: null,
  interactions: [],
  sideEffects: [],
  contraindications: [],
  dosageInfo: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const searchMedications = createAsyncThunk(
  'rxnav/searchMedications',
  async (query: string, { rejectWithValue }) => {
    try {
      const medications = await rxnavService.searchMedications(query);
      return medications;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search medications'
      );
    }
  }
);

export const getMedicationDetails = createAsyncThunk(
  'rxnav/getMedicationDetails',
  async (rxcui: string, { rejectWithValue }) => {
    try {
      const medication = await rxnavService.getMedicationDetails(rxcui);
      return medication;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get medication details'
      );
    }
  }
);

export const importMedication = createAsyncThunk(
  'rxnav/importMedication',
  async (rxcui: string, { rejectWithValue }) => {
    try {
      const medication = await rxnavService.importMedication(rxcui);
      return medication;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to import medication'
      );
    }
  }
);

export const checkDrugInteractions = createAsyncThunk(
  'rxnav/checkDrugInteractions',
  async (rxcuis: string[], { rejectWithValue }) => {
    try {
      const interactions = await rxnavService.checkDrugInteractions(rxcuis);
      return interactions;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check drug interactions'
      );
    }
  }
);

export const getMedicationSideEffects = createAsyncThunk(
  'rxnav/getMedicationSideEffects',
  async (rxcui: string, { rejectWithValue }) => {
    try {
      const sideEffects = await rxnavService.getMedicationSideEffects(rxcui);
      return sideEffects;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get medication side effects'
      );
    }
  }
);

export const getMedicationContraindications = createAsyncThunk(
  'rxnav/getMedicationContraindications',
  async (rxcui: string, { rejectWithValue }) => {
    try {
      const contraindications =
        await rxnavService.getMedicationContraindications(rxcui);
      return contraindications;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to get medication contraindications'
      );
    }
  }
);

export const getMedicationDosage = createAsyncThunk(
  'rxnav/getMedicationDosage',
  async (rxcui: string, { rejectWithValue }) => {
    try {
      const dosageInfo = await rxnavService.getMedicationDosage(rxcui);
      return dosageInfo;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to get medication dosage information'
      );
    }
  }
);

const rxnavSlice = createSlice({
  name: 'rxnav',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentMedication: (state) => {
      state.currentMedication = null;
    },
    clearInteractions: (state) => {
      state.interactions = [];
    },
    clearSideEffects: (state) => {
      state.sideEffects = [];
    },
    clearContraindications: (state) => {
      state.contraindications = [];
    },
    clearDosageInfo: (state) => {
      state.dosageInfo = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAll: (state) => {
      state.searchResults = [];
      state.currentMedication = null;
      state.interactions = [];
      state.sideEffects = [];
      state.contraindications = [];
      state.dosageInfo = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search medications
      .addCase(searchMedications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMedications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMedications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get medication details
      .addCase(getMedicationDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMedicationDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMedication = action.payload;
      })
      .addCase(getMedicationDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Import medication
      .addCase(importMedication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importMedication.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(importMedication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Check drug interactions
      .addCase(checkDrugInteractions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkDrugInteractions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interactions = action.payload;
      })
      .addCase(checkDrugInteractions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get medication side effects
      .addCase(getMedicationSideEffects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMedicationSideEffects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sideEffects = action.payload;
      })
      .addCase(getMedicationSideEffects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get medication contraindications
      .addCase(getMedicationContraindications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMedicationContraindications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contraindications = action.payload;
      })
      .addCase(getMedicationContraindications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get medication dosage information
      .addCase(getMedicationDosage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMedicationDosage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dosageInfo = action.payload;
      })
      .addCase(getMedicationDosage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSearchResults,
  clearCurrentMedication,
  clearInteractions,
  clearSideEffects,
  clearContraindications,
  clearDosageInfo,
  clearError,
  clearAll,
} = rxnavSlice.actions;

export default rxnavSlice.reducer;
