import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PatientsState,
  Patient,
  PatientFormData,
  Allergy,
  MedicalCondition,
  MedicationHistory,
  ClinicalAssessment,
  LaboratoryFinding,
  DrugTherapyProblem,
  CarePlan,
  SoapNote,
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
  async (
    {
      page = 1,
      limit = 10,
      search = '',
    }: { page?: number; limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await patientService.getAllPatients(page, limit, search);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patients'
      );
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patient'
      );
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create patient'
      );
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async (
    { id, patientData }: { id: string; patientData: Partial<PatientFormData> },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updatePatient(id, patientData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update patient'
      );
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete patient'
      );
    }
  }
);

export const addAllergy = createAsyncThunk(
  'patients/addAllergy',
  async (
    { patientId, allergyData }: { patientId: string; allergyData: Allergy },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addAllergy(patientId, allergyData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add allergy'
      );
    }
  }
);

export const updateAllergy = createAsyncThunk(
  'patients/updateAllergy',
  async (
    {
      patientId,
      allergyId,
      allergyData,
    }: { patientId: string; allergyId: string; allergyData: Allergy },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateAllergy(
        patientId,
        allergyId,
        allergyData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update allergy'
      );
    }
  }
);

export const removeAllergy = createAsyncThunk(
  'patients/removeAllergy',
  async (
    { patientId, allergyId }: { patientId: string; allergyId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeAllergy(patientId, allergyId);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove allergy'
      );
    }
  }
);

export const addMedicalCondition = createAsyncThunk(
  'patients/addMedicalCondition',
  async (
    {
      patientId,
      conditionData,
    }: { patientId: string; conditionData: MedicalCondition },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addMedicalCondition(
        patientId,
        conditionData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add medical condition'
      );
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
    }: {
      patientId: string;
      conditionId: string;
      conditionData: MedicalCondition;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateMedicalCondition(
        patientId,
        conditionId,
        conditionData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update medical condition'
      );
    }
  }
);

export const removeMedicalCondition = createAsyncThunk(
  'patients/removeMedicalCondition',
  async (
    { patientId, conditionId }: { patientId: string; conditionId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeMedicalCondition(
        patientId,
        conditionId
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove medical condition'
      );
    }
  }
);

export const addMedicationHistory = createAsyncThunk(
  'patients/addMedicationHistory',
  async (
    {
      patientId,
      medicationData,
    }: { patientId: string; medicationData: MedicationHistory },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addMedicationHistory(
        patientId,
        medicationData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add medication history'
      );
    }
  }
);

export const updateMedicationHistory = createAsyncThunk(
  'patients/updateMedicationHistory',
  async (
    {
      patientId,
      medicationId,
      medicationData,
    }: {
      patientId: string;
      medicationId: string;
      medicationData: MedicationHistory;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateMedicationHistory(
        patientId,
        medicationId,
        medicationData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update medication history'
      );
    }
  }
);

export const removeMedicationHistory = createAsyncThunk(
  'patients/removeMedicationHistory',
  async (
    { patientId, medicationId }: { patientId: string; medicationId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeMedicationHistory(
        patientId,
        medicationId
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove medication history'
      );
    }
  }
);

export const addClinicalAssessment = createAsyncThunk(
  'patients/addClinicalAssessment',
  async (
    {
      patientId,
      assessmentData,
    }: { patientId: string; assessmentData: ClinicalAssessment },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addClinicalAssessment(
        patientId,
        assessmentData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add clinical assessment'
      );
    }
  }
);

export const updateClinicalAssessment = createAsyncThunk(
  'patients/updateClinicalAssessment',
  async (
    {
      patientId,
      assessmentId,
      assessmentData,
    }: {
      patientId: string;
      assessmentId: string;
      assessmentData: ClinicalAssessment;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateClinicalAssessment(
        patientId,
        assessmentId,
        assessmentData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update clinical assessment'
      );
    }
  }
);

export const removeClinicalAssessment = createAsyncThunk(
  'patients/removeClinicalAssessment',
  async (
    { patientId, assessmentId }: { patientId: string; assessmentId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeClinicalAssessment(
        patientId,
        assessmentId
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove clinical assessment'
      );
    }
  }
);

export const addLaboratoryFinding = createAsyncThunk(
  'patients/addLaboratoryFinding',
  async (
    {
      patientId,
      findingData,
    }: { patientId: string; findingData: LaboratoryFinding },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addLaboratoryFinding(
        patientId,
        findingData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add laboratory finding'
      );
    }
  }
);

export const updateLaboratoryFinding = createAsyncThunk(
  'patients/updateLaboratoryFinding',
  async (
    {
      patientId,
      findingId,
      findingData,
    }: {
      patientId: string;
      findingId: string;
      findingData: LaboratoryFinding;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateLaboratoryFinding(
        patientId,
        findingId,
        findingData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update laboratory finding'
      );
    }
  }
);

export const removeLaboratoryFinding = createAsyncThunk(
  'patients/removeLaboratoryFinding',
  async (
    { patientId, findingId }: { patientId: string; findingId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeLaboratoryFinding(
        patientId,
        findingId
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove laboratory finding'
      );
    }
  }
);

export const addDrugTherapyProblem = createAsyncThunk(
  'patients/addDrugTherapyProblem',
  async (
    {
      patientId,
      problemData,
    }: { patientId: string; problemData: DrugTherapyProblem },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addDrugTherapyProblem(
        patientId,
        problemData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add drug therapy problem'
      );
    }
  }
);

export const updateDrugTherapyProblem = createAsyncThunk(
  'patients/updateDrugTherapyProblem',
  async (
    {
      patientId,
      problemId,
      problemData,
    }: {
      patientId: string;
      problemId: string;
      problemData: DrugTherapyProblem;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateDrugTherapyProblem(
        patientId,
        problemId,
        problemData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update drug therapy problem'
      );
    }
  }
);

export const removeDrugTherapyProblem = createAsyncThunk(
  'patients/removeDrugTherapyProblem',
  async (
    { patientId, problemId }: { patientId: string; problemId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeDrugTherapyProblem(
        patientId,
        problemId
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove drug therapy problem'
      );
    }
  }
);

export const addCarePlan = createAsyncThunk(
  'patients/addCarePlan',
  async (
    { patientId, planData }: { patientId: string; planData: CarePlan },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addCarePlan(patientId, planData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add care plan'
      );
    }
  }
);

export const updateCarePlan = createAsyncThunk(
  'patients/updateCarePlan',
  async (
    {
      patientId,
      planId,
      planData,
    }: {
      patientId: string;
      planId: string;
      planData: CarePlan;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateCarePlan(
        patientId,
        planId,
        planData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update care plan'
      );
    }
  }
);

export const removeCarePlan = createAsyncThunk(
  'patients/removeCarePlan',
  async (
    { patientId, planId }: { patientId: string; planId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeCarePlan(patientId, planId);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove care plan'
      );
    }
  }
);

export const addSoapNote = createAsyncThunk(
  'patients/addSoapNote',
  async (
    { patientId, noteData }: { patientId: string; noteData: SoapNote },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.addSoapNote(patientId, noteData);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add SOAP note'
      );
    }
  }
);

export const updateSoapNote = createAsyncThunk(
  'patients/updateSoapNote',
  async (
    {
      patientId,
      noteId,
      noteData,
    }: {
      patientId: string;
      noteId: string;
      noteData: SoapNote;
    },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.updateSoapNote(
        patientId,
        noteId,
        noteData
      );
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update SOAP note'
      );
    }
  }
);

export const removeSoapNote = createAsyncThunk(
  'patients/removeSoapNote',
  async (
    { patientId, noteId }: { patientId: string; noteId: string },
    { rejectWithValue }
  ) => {
    try {
      const patient = await patientService.removeSoapNote(patientId, noteId);
      return patient;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove SOAP note'
      );
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

        const index = state.patients.findIndex(
          (patient) => patient.id === action.payload.id
        );
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
        state.patients = state.patients.filter(
          (patient) => patient.id !== action.payload
        );
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
      })
      .addCase(addMedicationHistory.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateMedicationHistory.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeMedicationHistory.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(addClinicalAssessment.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateClinicalAssessment.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeClinicalAssessment.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(addLaboratoryFinding.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateLaboratoryFinding.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeLaboratoryFinding.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(addDrugTherapyProblem.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateDrugTherapyProblem.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeDrugTherapyProblem.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(addCarePlan.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateCarePlan.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeCarePlan.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(addSoapNote.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(updateSoapNote.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })
      .addCase(removeSoapNote.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      });
  },
});

export const { clearCurrentPatient, setError } = patientSlice.actions;

export default patientSlice.reducer;
