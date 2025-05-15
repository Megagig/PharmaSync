import api from './api';
import { 
  Return, 
  ReturnFormData, 
  ReturnUpdateData, 
  ReturnApproveData, 
  ReturnRefundData 
} from '../types/return.types';

const returnService = {
  getAllReturns: async (
    page = 1,
    limit = 10,
    customer = '',
    status = '',
    refundStatus = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Return[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/returns?page=${page}&limit=${limit}`;
    
    if (customer) {
      url += `&customer=${customer}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (refundStatus) {
      url += `&refundStatus=${refundStatus}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  getReturnById: async (id: string): Promise<Return> => {
    const response = await api.get(`/returns/${id}`);
    return response.data.data;
  },

  createReturn: async (returnData: ReturnFormData): Promise<Return> => {
    const response = await api.post('/returns', returnData);
    return response.data.data;
  },

  updateReturn: async (id: string, updateData: ReturnUpdateData): Promise<Return> => {
    const response = await api.patch(`/returns/${id}`, updateData);
    return response.data.data;
  },

  approveReturn: async (id: string, approveData: ReturnApproveData): Promise<Return> => {
    const response = await api.patch(`/returns/${id}/approve`, approveData);
    return response.data.data;
  },

  processRefund: async (id: string, refundData: ReturnRefundData): Promise<Return> => {
    const response = await api.patch(`/returns/${id}/refund`, refundData);
    return response.data.data;
  },
};

export default returnService;
