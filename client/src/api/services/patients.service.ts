import axiosInstance from '../axios.config';
import {
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

const patientService = {
  getAllPatients: async (
    page = 1,
    limit = 10,
    search = ''
  ): Promise<{
    data: Patient[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    const response = await axiosInstance.get(
      `/patients?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await axiosInstance.get(`/patients/${id}`);
    return response.data.data;
  },

  createPatient: async (patientData: PatientFormData): Promise<Patient> => {
    const response = await axiosInstance.post('/patients', patientData);
    return response.data.data;
  },

  updatePatient: async (
    id: string,
    patientData: Partial<PatientFormData>
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(`/patients/${id}`, patientData);
    return response.data.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/patients/${id}`);
  },

  // Allergy management
  addAllergy: async (
    patientId: string,
    allergyData: Allergy
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/allergies`,
      allergyData
    );
    return response.data.data;
  },

  updateAllergy: async (
    patientId: string,
    allergyId: string,
    allergyData: Allergy
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/allergies/${allergyId}`,
      allergyData
    );
    return response.data.data;
  },

  removeAllergy: async (
    patientId: string,
    allergyId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/allergies/${allergyId}`
    );
    return response.data.data;
  },

  // Medical condition management
  addMedicalCondition: async (
    patientId: string,
    conditionData: MedicalCondition
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/conditions`,
      conditionData
    );
    return response.data.data;
  },

  updateMedicalCondition: async (
    patientId: string,
    conditionId: string,
    conditionData: MedicalCondition
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/conditions/${conditionId}`,
      conditionData
    );
    return response.data.data;
  },

  removeMedicalCondition: async (
    patientId: string,
    conditionId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/conditions/${conditionId}`
    );
    return response.data.data;
  },

  // Medication management
  addMedication: async (
    patientId: string,
    medicationId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/medications`,
      {
        medicationId,
      }
    );
    return response.data.data;
  },

  removeMedication: async (
    patientId: string,
    medicationId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/medications/${medicationId}`
    );
    return response.data.data;
  },

  // Medication history management
  addMedicationHistory: async (
    patientId: string,
    medicationData: MedicationHistory
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/medication-history`,
      medicationData
    );
    return response.data.data;
  },

  updateMedicationHistory: async (
    patientId: string,
    medicationId: string,
    medicationData: MedicationHistory
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/medication-history/${medicationId}`,
      medicationData
    );
    return response.data.data;
  },

  removeMedicationHistory: async (
    patientId: string,
    medicationId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/medication-history/${medicationId}`
    );
    return response.data.data;
  },

  // Clinical assessment management
  addClinicalAssessment: async (
    patientId: string,
    assessmentData: ClinicalAssessment
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/clinical-assessments`,
      assessmentData
    );
    return response.data.data;
  },

  updateClinicalAssessment: async (
    patientId: string,
    assessmentId: string,
    assessmentData: ClinicalAssessment
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/clinical-assessments/${assessmentId}`,
      assessmentData
    );
    return response.data.data;
  },

  removeClinicalAssessment: async (
    patientId: string,
    assessmentId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/clinical-assessments/${assessmentId}`
    );
    return response.data.data;
  },

  // Laboratory finding management
  addLaboratoryFinding: async (
    patientId: string,
    findingData: LaboratoryFinding
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/laboratory-findings`,
      findingData
    );
    return response.data.data;
  },

  updateLaboratoryFinding: async (
    patientId: string,
    findingId: string,
    findingData: LaboratoryFinding
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/laboratory-findings/${findingId}`,
      findingData
    );
    return response.data.data;
  },

  removeLaboratoryFinding: async (
    patientId: string,
    findingId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/laboratory-findings/${findingId}`
    );
    return response.data.data;
  },

  // Drug therapy problem management
  addDrugTherapyProblem: async (
    patientId: string,
    problemData: DrugTherapyProblem
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/drug-therapy-problems`,
      problemData
    );
    return response.data.data;
  },

  updateDrugTherapyProblem: async (
    patientId: string,
    problemId: string,
    problemData: DrugTherapyProblem
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/drug-therapy-problems/${problemId}`,
      problemData
    );
    return response.data.data;
  },

  removeDrugTherapyProblem: async (
    patientId: string,
    problemId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/drug-therapy-problems/${problemId}`
    );
    return response.data.data;
  },

  // Care plan management
  addCarePlan: async (
    patientId: string,
    planData: CarePlan
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/care-plans`,
      planData
    );
    return response.data.data;
  },

  updateCarePlan: async (
    patientId: string,
    planId: string,
    planData: CarePlan
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/care-plans/${planId}`,
      planData
    );
    return response.data.data;
  },

  removeCarePlan: async (
    patientId: string,
    planId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/care-plans/${planId}`
    );
    return response.data.data;
  },

  // SOAP note management
  addSoapNote: async (
    patientId: string,
    noteData: SoapNote
  ): Promise<Patient> => {
    const response = await axiosInstance.post(
      `/patients/${patientId}/soap-notes`,
      noteData
    );
    return response.data.data;
  },

  updateSoapNote: async (
    patientId: string,
    noteId: string,
    noteData: SoapNote
  ): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/soap-notes/${noteId}`,
      noteData
    );
    return response.data.data;
  },

  removeSoapNote: async (
    patientId: string,
    noteId: string
  ): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/soap-notes/${noteId}`
    );
    return response.data.data;
  },
};

export default patientService;
