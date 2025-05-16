import api from '../api';
import {
  DashboardStats,
  DashboardStatsParams,
} from '@/store/slices/dashboardSlice';

export const getDashboardStats = async (
  params: DashboardStatsParams = {}
): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard/stats', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error; // Propagate the error to be handled by the caller
  }
};
