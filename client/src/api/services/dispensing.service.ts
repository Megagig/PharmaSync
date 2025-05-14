import axiosInstance from '../axios.config';
import {
  Dispensing,
  DispensingFormData,
  ReturnDispensingData,
  ReceiptData,
} from '@/types/dispensing.types';

const dispensingService = {
  getAllDispensings: async (
    page = 1,
    limit = 10,
    patient = '',
    status = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Dispensing[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/dispensing?page=${page}&limit=${limit}`;
    
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

  getDispensingById: async (id: string): Promise<Dispensing> => {
    const response = await axiosInstance.get(`/dispensing/${id}`);
    return response.data.data;
  },

  createDispensing: async (dispensingData: DispensingFormData): Promise<Dispensing> => {
    const response = await axiosInstance.post('/dispensing', dispensingData);
    return response.data.data;
  },

  updateDispensing: async (
    id: string,
    updateData: {
      status?: string;
      paymentMethod?: 'cash' | 'card' | 'insurance' | 'credit' | 'other';
      discount?: number;
      tax?: number;
      notes?: string;
      receiptGenerated?: boolean;
    }
  ): Promise<Dispensing> => {
    const response = await axiosInstance.patch(`/dispensing/${id}`, updateData);
    return response.data.data;
  },

  generateReceipt: async (id: string): Promise<ReceiptData> => {
    const response = await axiosInstance.post(`/dispensing/${id}/receipt`);
    return response.data.data;
  },

  returnDispensing: async (
    id: string,
    returnData: ReturnDispensingData
  ): Promise<Dispensing> => {
    const response = await axiosInstance.post(`/dispensing/${id}/return`, returnData);
    return response.data.data;
  },
};

export default dispensingService;
