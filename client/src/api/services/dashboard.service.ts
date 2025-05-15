import api from '../api';
import {
  DashboardStats,
  DashboardStatsParams,
} from '@/store/slices/dashboardSlice';

export const getDashboardStats = async (
  params: DashboardStatsParams = {}
): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats', { params });
  return response.data.data;
};
