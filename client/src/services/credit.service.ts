import api from './api';
import { 
  CreditTransaction, 
  CreditSummary, 
  CreditTransactionFormData, 
  CreditLimitUpdateData 
} from '../types/credit.types';

const creditService = {
  getCustomerCreditTransactions: async (
    customerId: string,
    page = 1,
    limit = 10
  ): Promise<{
    data: CreditTransaction[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    const response = await api.get(
      `/customers/${customerId}/credit?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getCustomerCreditSummary: async (customerId: string): Promise<CreditSummary> => {
    const response = await api.get(`/customers/${customerId}/credit/summary`);
    return response.data.data;
  },

  createCreditTransaction: async (
    customerId: string,
    transactionData: CreditTransactionFormData
  ): Promise<CreditTransaction> => {
    const response = await api.post(
      `/customers/${customerId}/credit`,
      transactionData
    );
    return response.data.data;
  },

  updateCreditLimit: async (
    customerId: string,
    updateData: CreditLimitUpdateData
  ): Promise<{
    customerId: string;
    creditLimit: number;
    oldCreditLimit: number;
    currentBalance: number;
    availableCredit: number;
  }> => {
    const response = await api.patch(
      `/customers/${customerId}/credit/limit`,
      updateData
    );
    return response.data.data;
  },
};

export default creditService;
