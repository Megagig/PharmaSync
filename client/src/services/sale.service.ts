import api from './api';
import { Sale, SaleFormData, SaleUpdateData, SaleReceiptData } from '../types/sale.types';

const saleService = {
  getAllSales: async (
    page = 1,
    limit = 10,
    customer = '',
    status = '',
    paymentStatus = '',
    location = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Sale[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/sales?page=${page}&limit=${limit}`;
    
    if (customer) {
      url += `&customer=${customer}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }
    
    if (location) {
      url += `&location=${location}`;
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

  getSaleById: async (id: string): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`);
    return response.data.data;
  },

  createSale: async (saleData: SaleFormData): Promise<Sale> => {
    const response = await api.post('/sales', saleData);
    return response.data.data;
  },

  updateSale: async (id: string, updateData: SaleUpdateData): Promise<Sale> => {
    const response = await api.patch(`/sales/${id}`, updateData);
    return response.data.data;
  },

  generateReceipt: async (id: string): Promise<SaleReceiptData> => {
    const response = await api.post(`/sales/${id}/receipt`);
    return response.data.data;
  },
};

export default saleService;
