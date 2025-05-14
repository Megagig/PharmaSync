import axiosInstance from '../axios.config';
import {
  SalesReport,
  InventoryReport,
  PrescriptionReport,
  PatientReport,
} from '@/types/reports.types';

const reportsService = {
  getSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<SalesReport> => {
    let url = '/reports/sales';
    const params = [];
    
    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getInventoryReport: async (): Promise<InventoryReport> => {
    const response = await axiosInstance.get('/reports/inventory');
    return response.data.data;
  },

  getPrescriptionReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<PrescriptionReport> => {
    let url = '/reports/prescriptions';
    const params = [];
    
    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getPatientReport: async (): Promise<PatientReport> => {
    const response = await axiosInstance.get('/reports/patients');
    return response.data.data;
  },
};

export default reportsService;
