import axiosInstance from '../axios.config';
import { 
  Patient, 
  PatientFormData, 
  Allergy, 
  MedicalCondition 
} from '@/types/patient.types';

const patientService = {
  getAllPatients: async (page = 1, limit = 10, search = ''): Promise<{
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

  updatePatient: async (id: string, patientData: Partial<PatientFormData>): Promise<Patient> => {
    const response = await axiosInstance.patch(`/patients/${id}`, patientData);
    return response.data.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/patients/${id}`);
  },

  // Allergy management
  addAllergy: async (patientId: string, allergyData: Allergy): Promise<Patient> => {
    const response = await axiosInstance.post(`/patients/${patientId}/allergies`, allergyData);
    return response.data.data;
  },

  updateAllergy: async (patientId: string, allergyId: string, allergyData: Allergy): Promise<Patient> => {
    const response = await axiosInstance.patch(
      `/patients/${patientId}/allergies/${allergyId}`,
      allergyData
    );
    return response.data.data;
  },

  removeAllergy: async (patientId: string, allergyId: string): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/allergies/${allergyId}`
    );
    return response.data.data;
  },

  // Medical condition management
  addMedicalCondition: async (patientId: string, conditionData: MedicalCondition): Promise<Patient> => {
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

  removeMedicalCondition: async (patientId: string, conditionId: string): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/conditions/${conditionId}`
    );
    return response.data.data;
  },

  // Medication management
  addMedication: async (patientId: string, medicationId: string): Promise<Patient> => {
    const response = await axiosInstance.post(`/patients/${patientId}/medications`, {
      medicationId,
    });
    return response.data.data;
  },

  removeMedication: async (patientId: string, medicationId: string): Promise<Patient> => {
    const response = await axiosInstance.delete(
      `/patients/${patientId}/medications/${medicationId}`
    );
    return response.data.data;
  },
};

export default patientService;
