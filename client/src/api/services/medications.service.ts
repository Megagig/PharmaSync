import axiosInstance from '../axios.config';
import {
  Medication,
  MedicationFormData,
  InventoryItem,
  SideEffect,
  Interaction,
} from '@/types/medication.types';

const medicationService = {
  getAllMedications: async (
    page = 1,
    limit = 10,
    search = '',
    category = '',
    requiresPrescription?: boolean
  ): Promise<{
    data: Medication[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/medications?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${search}`;
    }
    
    if (category) {
      url += `&category=${category}`;
    }
    
    if (requiresPrescription !== undefined) {
      url += `&requiresPrescription=${requiresPrescription}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getMedicationById: async (id: string): Promise<Medication> => {
    const response = await axiosInstance.get(`/medications/${id}`);
    return response.data.data;
  },

  createMedication: async (medicationData: MedicationFormData): Promise<Medication> => {
    const response = await axiosInstance.post('/medications', medicationData);
    return response.data.data;
  },

  updateMedication: async (
    id: string,
    medicationData: Partial<MedicationFormData>
  ): Promise<Medication> => {
    const response = await axiosInstance.patch(`/medications/${id}`, medicationData);
    return response.data.data;
  },

  deleteMedication: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/medications/${id}`);
  },

  // Inventory management
  addInventoryItem: async (
    medicationId: string,
    inventoryData: InventoryItem
  ): Promise<Medication> => {
    const response = await axiosInstance.post(
      `/medications/${medicationId}/inventory`,
      inventoryData
    );
    return response.data.data;
  },

  updateInventoryItem: async (
    medicationId: string,
    itemId: string,
    updateData: Partial<InventoryItem>
  ): Promise<Medication> => {
    const response = await axiosInstance.patch(
      `/medications/${medicationId}/inventory/${itemId}`,
      updateData
    );
    return response.data.data;
  },

  removeInventoryItem: async (medicationId: string, itemId: string): Promise<Medication> => {
    const response = await axiosInstance.delete(
      `/medications/${medicationId}/inventory/${itemId}`
    );
    return response.data.data;
  },

  // Side effects management
  addSideEffect: async (
    medicationId: string,
    sideEffectData: SideEffect
  ): Promise<Medication> => {
    const response = await axiosInstance.post(
      `/medications/${medicationId}/side-effects`,
      sideEffectData
    );
    return response.data.data;
  },

  removeSideEffect: async (medicationId: string, sideEffectId: string): Promise<Medication> => {
    const response = await axiosInstance.delete(
      `/medications/${medicationId}/side-effects/${sideEffectId}`
    );
    return response.data.data;
  },

  // Interactions management
  addInteraction: async (
    medicationId: string,
    interactionData: Interaction
  ): Promise<Medication> => {
    const response = await axiosInstance.post(
      `/medications/${medicationId}/interactions`,
      interactionData
    );
    return response.data.data;
  },

  removeInteraction: async (
    medicationId: string,
    interactionId: string
  ): Promise<Medication> => {
    const response = await axiosInstance.delete(
      `/medications/${medicationId}/interactions/${interactionId}`
    );
    return response.data.data;
  },

  // Contraindications management
  addContraindication: async (
    medicationId: string,
    contraindication: string
  ): Promise<Medication> => {
    const response = await axiosInstance.post(
      `/medications/${medicationId}/contraindications`,
      { contraindication }
    );
    return response.data.data;
  },

  removeContraindication: async (
    medicationId: string,
    contraindication: string
  ): Promise<Medication> => {
    const response = await axiosInstance.delete(
      `/medications/${medicationId}/contraindications`,
      { data: { contraindication } }
    );
    return response.data.data;
  },

  // Special queries
  getLowStockMedications: async (): Promise<Medication[]> => {
    const response = await axiosInstance.get('/medications/low-stock');
    return response.data.data;
  },

  getExpiringMedications: async (days = 90): Promise<Medication[]> => {
    const response = await axiosInstance.get(`/medications/expiring?days=${days}`);
    return response.data.data;
  },
};

export default medicationService;
