import api from './api';
import {
  PosSession,
  PosSessionFormData,
  PosSessionCloseData,
  PosTransaction,
  PosTransactionFormData,
  PosReceiptData,
} from '../types/pos.types';

// POS Session API calls
const getAllPosSessions = async (
  page = 1,
  limit = 10,
  status = '',
  location = '',
  user = '',
  startDate = '',
  endDate = ''
) => {
  const response = await api.get('/pos/sessions', {
    params: {
      page,
      limit,
      status,
      location,
      user,
      startDate,
      endDate,
    },
  });
  return response.data;
};

const getPosSessionById = async (id: string) => {
  const response = await api.get(`/pos/sessions/${id}`);
  return response.data.data;
};

const getActivePosSession = async (location: string, register: string) => {
  const response = await api.get('/pos/sessions/active', {
    params: {
      location,
      register,
    },
  });
  return response.data.data;
};

const createPosSession = async (sessionData: PosSessionFormData) => {
  const response = await api.post('/pos/sessions', sessionData);
  return response.data.data;
};

const closePosSession = async (id: string, closeData: PosSessionCloseData) => {
  const response = await api.put(`/pos/sessions/${id}/close`, closeData);
  return response.data.data;
};

const deletePosSession = async (id: string) => {
  const response = await api.delete(`/pos/sessions/${id}`);
  return response.data;
};

// POS Transaction API calls
const getAllPosTransactions = async (
  page = 1,
  limit = 10,
  type = '',
  status = '',
  paymentStatus = '',
  customer = '',
  location = '',
  session = '',
  cashier = '',
  search = '',
  startDate = '',
  endDate = ''
) => {
  const response = await api.get('/pos/transactions', {
    params: {
      page,
      limit,
      type,
      status,
      paymentStatus,
      customer,
      location,
      session,
      cashier,
      search,
      startDate,
      endDate,
    },
  });
  return response.data;
};

const getPosTransactionById = async (id: string) => {
  const response = await api.get(`/pos/transactions/${id}`);
  return response.data.data;
};

const createPosTransaction = async (
  transactionData: PosTransactionFormData
) => {
  try {
    console.log('Creating POS transaction with data:', transactionData);
    const response = await api.post('/pos/transactions', transactionData);
    console.log('Transaction response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      'Error creating POS transaction:',
      error.response?.data || error.message
    );
    throw error;
  }
};

const generatePosReceipt = async (id: string) => {
  const response = await api.get(`/pos/transactions/${id}/receipt`);
  return response.data.data;
};

const posService = {
  // Session methods
  getAllPosSessions,
  getPosSessionById,
  getActivePosSession,
  createPosSession,
  closePosSession,
  deletePosSession,

  // Transaction methods
  getAllPosTransactions,
  getPosTransactionById,
  createPosTransaction,
  generatePosReceipt,
};

export default posService;
