import axiosInstance from '../axios.config';
import {
  Prescription,
  PrescriptionFormData,
  PrescriptionItemFormData,
  DispensingFormData,
  PrescriptionStatus,
} from '@/types/prescription.types';

const prescriptionService = {
  getAllPrescriptions: async (
    page = 1,
    limit = 10,
    patient = '',
    status = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Prescription[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/prescriptions?page=${page}&limit=${limit}`;
    
    if (patient) {
      url += `&patient=${patient}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getPrescriptionById: async (id: string): Promise<Prescription> => {
    const response = await axiosInstance.get(`/prescriptions/${id}`);
    return response.data.data;
  },

  createPrescription: async (
    prescriptionData: PrescriptionFormData & { items: PrescriptionItemFormData[] }
  ): Promise<Prescription> => {
    const response = await axiosInstance.post('/prescriptions', prescriptionData);
    return response.data.data;
  },

  updatePrescription: async (
    id: string,
    updateData: {
      status?: PrescriptionStatus;
      expiryDate?: string;
      notes?: string;
    }
  ): Promise<Prescription> => {
    const response = await axiosInstance.patch(`/prescriptions/${id}`, updateData);
    return response.data.data;
  },

  cancelPrescription: async (id: string): Promise<Prescription> => {
    const response = await axiosInstance.patch(`/prescriptions/${id}/cancel`, {});
    return response.data.data;
  },

  // Prescription items management
  addPrescriptionItem: async (
    prescriptionId: string,
    itemData: PrescriptionItemFormData
  ): Promise<Prescription> => {
    const response = await axiosInstance.post(
      `/prescriptions/${prescriptionId}/items`,
      itemData
    );
    return response.data.data;
  },

  updatePrescriptionItem: async (
    prescriptionId: string,
    itemId: string,
    updateData: Partial<PrescriptionItemFormData & { refillsRemaining?: number }>
  ): Promise<Prescription> => {
    const response = await axiosInstance.patch(
      `/prescriptions/${prescriptionId}/items/${itemId}`,
      updateData
    );
    return response.data.data;
  },

  removePrescriptionItem: async (
    prescriptionId: string,
    itemId: string
  ): Promise<Prescription> => {
    const response = await axiosInstance.delete(
      `/prescriptions/${prescriptionId}/items/${itemId}`
    );
    return response.data.data;
  },

  // Dispensing
  dispenseMedication: async (
    prescriptionId: string,
    dispensingData: DispensingFormData
  ): Promise<Prescription> => {
    const response = await axiosInstance.post(
      `/prescriptions/${prescriptionId}/dispense`,
      dispensingData
    );
    return response.data.data;
  },
};

export default prescriptionService;
