import api from './api';
import { Payment, PaymentFormData, PaymentUpdateData } from '../types/payment.types';

const paymentService = {
  getAllPayments: async (
    page = 1,
    limit = 10,
    direction = '',
    paymentMethod = '',
    customer = '',
    supplier = '',
    invoice = '',
    sale = '',
    purchaseOrder = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Payment[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/payments?page=${page}&limit=${limit}`;
    
    if (direction) {
      url += `&direction=${direction}`;
    }
    
    if (paymentMethod) {
      url += `&paymentMethod=${paymentMethod}`;
    }
    
    if (customer) {
      url += `&customer=${customer}`;
    }
    
    if (supplier) {
      url += `&supplier=${supplier}`;
    }
    
    if (invoice) {
      url += `&invoice=${invoice}`;
    }
    
    if (sale) {
      url += `&sale=${sale}`;
    }
    
    if (purchaseOrder) {
      url += `&purchaseOrder=${purchaseOrder}`;
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

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data;
  },

  createPayment: async (paymentData: PaymentFormData): Promise<Payment> => {
    const response = await api.post('/payments', paymentData);
    return response.data.data;
  },

  updatePayment: async (id: string, updateData: PaymentUpdateData): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}`, updateData);
    return response.data.data;
  },
};

export default paymentService;
