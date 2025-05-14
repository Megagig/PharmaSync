import axiosInstance from '../axios.config';
import {
  ScheduleShift,
  ScheduleShiftFormData,
  TimeOffRequest,
  TimeOffRequestFormData,
  TimeOffRequestUpdateData,
} from '@/types/schedule.types';

const scheduleService = {
  // Shift services
  getAllShifts: async (
    page = 1,
    limit = 50,
    user = '',
    shiftType = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: ScheduleShift[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/schedule/shifts?page=${page}&limit=${limit}`;
    
    if (user) {
      url += `&user=${user}`;
    }
    
    if (shiftType) {
      url += `&shiftType=${shiftType}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getShiftById: async (id: string): Promise<ScheduleShift> => {
    const response = await axiosInstance.get(`/schedule/shifts/${id}`);
    return response.data.data;
  },

  createShift: async (shiftData: ScheduleShiftFormData): Promise<ScheduleShift> => {
    const response = await axiosInstance.post('/schedule/shifts', shiftData);
    return response.data.data;
  },

  updateShift: async (
    id: string,
    updateData: Partial<ScheduleShiftFormData>
  ): Promise<ScheduleShift> => {
    const response = await axiosInstance.patch(`/schedule/shifts/${id}`, updateData);
    return response.data.data;
  },

  deleteShift: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/schedule/shifts/${id}`);
  },

  // Time off request services
  getAllTimeOffRequests: async (
    page = 1,
    limit = 20,
    user = '',
    status = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: TimeOffRequest[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/schedule/time-off?page=${page}&limit=${limit}`;
    
    if (user) {
      url += `&user=${user}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getTimeOffRequestById: async (id: string): Promise<TimeOffRequest> => {
    const response = await axiosInstance.get(`/schedule/time-off/${id}`);
    return response.data.data;
  },

  createTimeOffRequest: async (
    requestData: TimeOffRequestFormData
  ): Promise<TimeOffRequest> => {
    const response = await axiosInstance.post('/schedule/time-off', requestData);
    return response.data.data;
  },

  updateTimeOffRequestStatus: async (
    id: string,
    updateData: TimeOffRequestUpdateData
  ): Promise<TimeOffRequest> => {
    const response = await axiosInstance.patch(`/schedule/time-off/${id}`, updateData);
    return response.data.data;
  },

  deleteTimeOffRequest: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/schedule/time-off/${id}`);
  },
};

export default scheduleService;
