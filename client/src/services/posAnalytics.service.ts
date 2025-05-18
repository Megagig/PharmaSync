import api from './api';

const PosAnalyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async () => {
    const response = await api.get('/pos/analytics/dashboard');
    return response.data.data;
  },

  // Get sales analytics
  getSalesAnalytics: async (params: {
    startDate?: string;
    endDate?: string;
    period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    location?: string;
  }) => {
    const response = await api.get('/pos/analytics/sales', { params });
    return response.data.data;
  },

  // Get inventory analytics
  getInventoryAnalytics: async (params: {
    location?: string;
    category?: string;
  }) => {
    const response = await api.get('/pos/analytics/inventory', { params });
    return response.data.data;
  },
};

export default PosAnalyticsService;
