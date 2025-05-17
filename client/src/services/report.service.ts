import api from '@/services/api';
import {
  // These types are used in return types but TypeScript doesn't recognize this pattern
  // ReportConfiguration,
  ReportConfigurationCreate,
  ReportConfigurationUpdate,
  // ReportSchedule,
  ReportScheduleCreate,
  ReportScheduleUpdate,
  ReportRequest,
  ReportFormat,
} from '@/types/report.types';

const BASE_URL = '/report';

/**
 * Get all report configurations
 * @param params Query parameters
 * @returns Promise with report configurations data
 */
export const getReportConfigurations = async (
  params: { page?: number; limit?: number; type?: string } = {}
) => {
  const { page = 1, limit = 10, type } = params;

  let url = `${BASE_URL}/configurations?page=${page}&limit=${limit}`;

  if (type) {
    url += `&type=${type}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Get a report configuration by ID
 * @param id Report configuration ID
 * @returns Promise with report configuration data
 */
export const getReportConfigurationById = async (id: string) => {
  const response = await api.get(`${BASE_URL}/configurations/${id}`);
  return response.data;
};

/**
 * Create a new report configuration
 * @param data Report configuration data
 * @returns Promise with created report configuration
 */
export const createReportConfiguration = async (
  data: ReportConfigurationCreate
) => {
  const response = await api.post(`${BASE_URL}/configurations`, data);
  return response.data;
};

/**
 * Update a report configuration
 * @param id Report configuration ID
 * @param data Report configuration update data
 * @returns Promise with updated report configuration
 */
export const updateReportConfiguration = async (
  id: string,
  data: ReportConfigurationUpdate
) => {
  const response = await api.patch(`${BASE_URL}/configurations/${id}`, data);
  return response.data;
};

/**
 * Delete a report configuration
 * @param id Report configuration ID
 * @returns Promise with success message
 */
export const deleteReportConfiguration = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/configurations/${id}`);
  return response.data;
};

/**
 * Generate a report from a configuration
 * @param id Report configuration ID
 * @param format Report format
 * @returns Promise with report data
 */
export const generateReportFromConfiguration = async (
  id: string,
  format: ReportFormat = ReportFormat.JSON
) => {
  const response = await api.post(`${BASE_URL}/configurations/${id}/generate`, {
    format,
  });
  return response.data;
};

/**
 * Generate a custom report
 * @param data Report request data
 * @returns Promise with report data
 */
export const generateReport = async (data: ReportRequest) => {
  const response = await api.post(`${BASE_URL}/generate`, data);
  return response.data;
};

/**
 * Get all report executions
 * @param params Query parameters
 * @returns Promise with report executions data
 */
export const getReportExecutions = async (
  params: {
    page?: number;
    limit?: number;
    report?: string;
    status?: string;
  } = {}
) => {
  const { page = 1, limit = 10, report, status } = params;

  let url = `${BASE_URL}/executions?page=${page}&limit=${limit}`;

  if (report) {
    url += `&report=${report}`;
  }

  if (status) {
    url += `&status=${status}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Download a report file
 * @param id Report execution ID
 * @returns Promise with file URL
 */
export const downloadReport = async (id: string) => {
  // This will trigger a file download
  window.open(`${api.defaults.baseURL}${BASE_URL}/download/${id}`, '_blank');
  return { success: true };
};

/**
 * Get all report schedules
 * @param params Query parameters
 * @returns Promise with report schedules data
 */
export const getReportSchedules = async (
  params: {
    page?: number;
    limit?: number;
    report?: string;
    isActive?: boolean;
  } = {}
) => {
  const { page = 1, limit = 10, report, isActive } = params;

  let url = `${BASE_URL}/schedules?page=${page}&limit=${limit}`;

  if (report) {
    url += `&report=${report}`;
  }

  if (isActive !== undefined) {
    url += `&isActive=${isActive}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Create a new report schedule
 * @param data Report schedule data
 * @returns Promise with created report schedule
 */
export const createReportSchedule = async (data: ReportScheduleCreate) => {
  const response = await api.post(`${BASE_URL}/schedules`, data);
  return response.data;
};

/**
 * Update a report schedule
 * @param id Report schedule ID
 * @param data Report schedule update data
 * @returns Promise with updated report schedule
 */
export const updateReportSchedule = async (
  id: string,
  data: ReportScheduleUpdate
) => {
  const response = await api.patch(`${BASE_URL}/schedules/${id}`, data);
  return response.data;
};

/**
 * Delete a report schedule
 * @param id Report schedule ID
 * @returns Promise with success message
 */
export const deleteReportSchedule = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/schedules/${id}`);
  return response.data;
};
