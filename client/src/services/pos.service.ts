import api from './api';
import {
  PosSessionFormData,
  PosSessionCloseData,
  PosTransactionFormData
} from '../types/pos.types';

const PosService = {
  // Session endpoints
  getPosSessions: async (params: any) => {
    const response = await api.get('/pos/sessions', { params });
    return response.data;
  },

  getPosSessionById: async (id: string) => {
    const response = await api.get(`/pos/sessions/${id}`);
    return response.data.data;
  },

  getActivePosSession: async () => {
    const response = await api.get('/pos/sessions/active');
    return response.data.data;
  },

  createPosSession: async (sessionData: PosSessionFormData) => {
    const response = await api.post('/pos/sessions', sessionData);
    return response.data.data;
  },

  closePosSession: async (id: string, closeData: PosSessionCloseData) => {
    const response = await api.post(`/pos/sessions/${id}/close`, closeData);
    return response.data.data;
  },

  deletePosSession: async (id: string) => {
    const response = await api.delete(`/pos/sessions/${id}`);
    return response.data.data;
  },

  // Transaction endpoints
  getPosTransactions: async (params: any) => {
    const response = await api.get('/pos/transactions', { params });
    return response.data;
  },

  getPosTransactionById: async (id: string) => {
    const response = await api.get(`/pos/transactions/${id}`);
    return response.data.data;
  },

  createPosTransaction: async (transactionData: PosTransactionFormData) => {
    const response = await api.post('/pos/transactions', transactionData);
    return response.data.data;
  },

  generatePosReceipt: async (id: string) => {
    const response = await api.get(`/pos/transactions/${id}/receipt`);
    return response.data.data;
  },

  // Product search by barcode
  searchProductByBarcode: async (barcode: string) => {
    const response = await api.get(`/products?barcode=${barcode}`);
    return response.data.data;
  },

  // Prescription endpoints
  getPrescriptionByNumber: async (prescriptionNumber: string) => {
    const response = await api.get(`/prescriptions?prescriptionNumber=${prescriptionNumber}`);
    return response.data.data;
  },

  // Email receipt
  sendReceiptEmail: async (transactionId: string, email: string) => {
    const response = await api.post(`/pos/transactions/${transactionId}/email`, { email });
    return response.data.data;
  },
};

export default PosService;
