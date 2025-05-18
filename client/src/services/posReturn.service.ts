import api from './api';

const PosReturnService = {
  // Get returnable transactions for a customer
  getReturnableTransactions: async (customerId: string, days?: number) => {
    const response = await api.get(`/pos/returns/customer/${customerId}`, {
      params: { days },
    });
    return response.data.data;
  },

  // Get transaction details for return
  getTransactionForReturn: async (transactionId: string) => {
    const response = await api.get(`/pos/returns/transaction/${transactionId}`);
    return response.data.data;
  },

  // Process a full return
  processFullReturn: async (returnData: any) => {
    const response = await api.post('/pos/returns/full', returnData);
    return response.data.data;
  },

  // Process a partial return
  processPartialReturn: async (returnData: any) => {
    const response = await api.post('/pos/returns/partial', returnData);
    return response.data.data;
  },

  // Get return details
  getReturnDetails: async (returnId: string) => {
    const response = await api.get(`/pos/returns/${returnId}`);
    return response.data.data;
  },
};

export default PosReturnService;
