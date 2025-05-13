import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  PatientsState, 
  Patient, 
  PatientFormData, 
  Allergy, 
  MedicalCondition 
} from '@/types/patient.types';
import patientService from '@/api/services/patients.service';

const initialState: PatientsState = {
  patients: [],
  currentPatient: null,
  isLoading: false,
  error: null,
  totalPatients: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await patientService.getAllPatients(page, limit, search);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (id: string, { rejectWithValue }) => {
    try {
      const patient = await patientService.getPatientById(id);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData: PatientFormData, { rejectWithValue }) => {
    try {
      const patient = await patientService.createPatient(patientData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create patient');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, patientData }: { id: string; patientData: Partial<PatientFormData> }, { rejectWithValue }) => {
    try {
      const patient = await patientService.updatePatient(id, patientData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update patient');
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (id: string, { rejectWithValue }) => {
    try {
      await patientService.deletePatient(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete patient');
    }
  }
);

export const addAllergy = createAsyncThunk(
  'patients/addAllergy',
  async ({ patientId, allergyData }: { patientId: string; allergyData: Allergy }, { rejectWithValue }) => {
    try {
      const patient = await patientService.addAllergy(patientId, allergyData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add allergy');
    }
  }
);

export const updateAllergy = createAsyncThunk(
  'patients/updateAllergy',
  async (
    { patientId, allergyId, allergyData }: { patientId: string; allergyId: string; allergyData: Allergy },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateAllergy(patientId, allergyId, allergyData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update allergy');
    }
  }
);

export const removeAllergy = createAsyncThunk(
  'patients/removeAllergy',
  async ({ patientId, allergyId }: { patientId: string; allergyId: string }, { rejectWithValue }) => {
    try {
      const patient = await patientService.removeAllergy(patientId, allergyId);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove allergy');
    }
  }
);

export const addMedicalCondition = createAsyncThunk(
  'patients/addMedicalCondition',
  async (
    { patientId, conditionData }: { patientId: string; conditionData: MedicalCondition },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addMedicalCondition(patientId, conditionData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add medical condition');
    }
  }
);

export const updateMedicalCondition = createAsyncThunk(
  'patients/updateMedicalCondition',
  async (
    {
      patientId,
      conditionId,
      conditionData,
    }: { patientId: string; conditionId: string; conditionData: MedicalCondition },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateMedicalCondition(patientId, conditionId, conditionData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update medical condition');
    }
  }
);

export const removeMedicalCondition = createAsyncThunk(
  'patients/removeMedicalCondition',
  async ({ patientId, conditionId }: { patientId: string; conditionId: string }, { rejectWithValue }) => {
    try {
      const patient = await patientService.removeMedicalCondition(patientId, conditionId);
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove medical condition');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch patients
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload.data;
        state.totalPatients = action.payload.meta.total;
        state.totalPages = action.payload.meta.pages;
        state.currentPage = action.payload.meta.page;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch patient by ID
      .addCase(fetchPatientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create patient
      .addCase(createPatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients.unshift(action.payload);
        state.totalPatients += 1;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update patient
      .addCase(updatePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPatient = action.payload;
        
        const index = state.patients.findIndex((patient) => patient.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete patient
      .addCase(deletePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = state.patients.filter((patient) => patient.id !== action.payload);
        state.totalPatients -= 1;
        if (state.currentPatient?.id === action.payload) {
          state.currentPatient = null;
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Handle all patient detail updates (allergies, conditions, etc.)
      .addCase(addAllergy.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateAllergy.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeAllergy.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(addMedicalCondition.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateMedicalCondition.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeMedicalCondition.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      });
  },
});

export const { clearCurrentPatient, setError } = patientSlice.actions;

export default patientSlice.reducer;
