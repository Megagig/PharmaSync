import axiosInstance from '../axios.config';
import { ActivityLog, ActivityType, ActivityStats } from '@/types/activityLog.types';

const activityLogService = {
  getAllActivityLogs: async (
    page = 1,
    limit = 20,
    user = '',
    activityType = '',
    startDate = '',
    endDate = '',
    search = ''
  ): Promise<{
    data: ActivityLog[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/activity-logs?page=${page}&limit=${limit}`;
    
    if (user) {
      url += `&user=${user}`;
    }
    
    if (activityType) {
      url += `&activityType=${activityType}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getActivityLogById: async (id: string): Promise<ActivityLog> => {
    const response = await axiosInstance.get(`/activity-logs/${id}`);
    return response.data.data;
  },

  getUserActivityLogs: async (
    userId: string,
    page = 1,
    limit = 20,
    activityType = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: ActivityLog[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/activity-logs/user/${userId}?page=${page}&limit=${limit}`;
    
    if (activityType) {
      url += `&activityType=${activityType}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getMyActivityLogs: async (
    page = 1,
    limit = 20,
    activityType = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: ActivityLog[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/activity-logs/me?page=${page}&limit=${limit}`;
    
    if (activityType) {
      url += `&activityType=${activityType}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getActivityTypes: async (): Promise<ActivityType[]> => {
    const response = await axiosInstance.get('/activity-logs/types');
    return response.data.data;
  },

  getActivityStats: async (
    startDate = '',
    endDate = ''
  ): Promise<ActivityStats> => {
    let url = '/activity-logs/stats';
    
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  },
};

export default activityLogService;
