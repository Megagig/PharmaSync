import api from './api';

const LoyaltyService = {
  // Customer loyalty endpoints
  getCustomerLoyalty: async (customerId: string) => {
    const response = await api.get(`/loyalty/customers/${customerId}`);
    return response.data.data;
  },

  addLoyaltyPoints: async (customerId: string, points: number, description?: string) => {
    const response = await api.post(`/loyalty/customers/${customerId}/add`, {
      points,
      description,
    });
    return response.data.data;
  },

  redeemLoyaltyPoints: async (customerId: string, points: number, transactionId?: string) => {
    const response = await api.post(`/loyalty/customers/${customerId}/redeem`, {
      points,
      transactionId,
    });
    return response.data.data;
  },

  // Loyalty program endpoints (admin)
  getLoyaltyProgram: async () => {
    const response = await api.get('/loyalty/program');
    return response.data.data;
  },

  createLoyaltyProgram: async (programData: any) => {
    const response = await api.post('/loyalty/program', programData);
    return response.data.data;
  },

  updateLoyaltyProgram: async (id: string, programData: any) => {
    const response = await api.patch(`/loyalty/program/${id}`, programData);
    return response.data.data;
  },

  // Loyalty tier endpoints (admin)
  getLoyaltyTiers: async () => {
    const response = await api.get('/loyalty/tiers');
    return response.data.data;
  },

  createLoyaltyTier: async (tierData: any) => {
    const response = await api.post('/loyalty/tiers', tierData);
    return response.data.data;
  },

  updateLoyaltyTier: async (id: string, tierData: any) => {
    const response = await api.patch(`/loyalty/tiers/${id}`, tierData);
    return response.data.data;
  },

  // Process expired points (admin)
  processExpiredPoints: async () => {
    const response = await api.post('/loyalty/process-expired');
    return response.data.data;
  },
};

export default LoyaltyService;
