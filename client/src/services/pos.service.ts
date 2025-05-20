import api from './api';
import {
  PosSessionFormData,
  PosSessionCloseData,
  PosTransactionFormData,
  PosSession,
  PosTransaction
} from '../types/pos.types';

class PosServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'PosServiceError';
  }
}

const PosService = {
  // Session endpoints
  getPosSessions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    location?: string;
    user?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await api.get('/pos/sessions', { params });
      return response.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to fetch POS sessions',
        error.response?.data?.code
      );
    }
  },

  getPosSessionById: async (id: string): Promise<PosSession> => {
    try {
      const response = await api.get(`/pos/sessions/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to fetch POS session',
        error.response?.data?.code
      );
    }
  },

  getActivePosSession: async (location: string, register: string): Promise<PosSession | null> => {
    try {
      const response = await api.get('/pos/sessions/active', {
        params: { location, register }
      });
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to fetch active POS session',
        error.response?.data?.code
      );
    }
  },

  createPosSession: async (sessionData: PosSessionFormData): Promise<PosSession> => {
    try {
      const response = await api.post('/pos/sessions', sessionData);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to create POS session',
        error.response?.data?.code
      );
    }
  },

  closePosSession: async (id: string, closeData: PosSessionCloseData): Promise<PosSession> => {
    try {
      const response = await api.put(`/pos/sessions/${id}/close`, closeData);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to close POS session',
        error.response?.data?.code
      );
    }
  },

  deletePosSession: async (id: string): Promise<void> => {
    try {
      await api.delete(`/pos/sessions/${id}`);
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to delete POS session',
        error.response?.data?.code
      );
    }
  },

  // Transaction endpoints
  getPosTransactions: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    paymentStatus?: string;
    customer?: string;
    location?: string;
    session?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await api.get('/pos/transactions', { params });
      return response.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to fetch POS transactions',
        error.response?.data?.code
      );
    }
  },

  getPosTransactionById: async (id: string): Promise<PosTransaction> => {
    try {
      const response = await api.get(`/pos/transactions/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to fetch POS transaction',
        error.response?.data?.code
      );
    }
  },

  createPosTransaction: async (transactionData: PosTransactionFormData): Promise<PosTransaction> => {
    try {
      const response = await api.post('/pos/transactions', transactionData);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to create POS transaction',
        error.response?.data?.code
      );
    }
  },

  generatePosReceipt: async (id: string) => {
    try {
      const response = await api.get(`/pos/transactions/${id}/receipt`);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to generate receipt',
        error.response?.data?.code
      );
    }
  },

  // Product search by barcode
  searchProductByBarcode: async (barcode: string) => {
    try {
      const response = await api.get(`/products?barcode=${barcode}`);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to search product',
        error.response?.data?.code
      );
    }
  },

  // Prescription endpoints
  getPrescriptionByNumber: async (prescriptionNumber: string) => {
    try {
      const response = await api.get(`/prescriptions?prescriptionNumber=${prescriptionNumber}`);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to fetch prescription',
        error.response?.data?.code
      );
    }
  },

  // Email receipt
  sendReceiptEmail: async (transactionId: string, email: string) => {
    try {
      const response = await api.post(`/pos/transactions/${transactionId}/email`, { email });
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to send receipt email',
        error.response?.data?.code
      );
    }
  },

  // Session totals
  updateSessionTotals: async (sessionId: string, totals: {
    totalSales: number;
    totalPayments: number;
    totalReturns?: number;
  }) => {
    try {
      const response = await api.patch(`/pos/sessions/${sessionId}/update-totals`, totals);
      return response.data.data;
    } catch (error: any) {
      throw new PosServiceError(
        error.response?.data?.message || 'Failed to update session totals',
        error.response?.data?.code
      );
    }
  }
};

export default PosService;
