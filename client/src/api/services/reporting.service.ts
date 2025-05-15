import api from '../api';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
}

export const getDemographicsReport = async (params: ReportParams = {}) => {
  const response = await api.get('/reporting/demographics', { params });
  return response.data.data;
};

export const getMedicationUsageReport = async (params: ReportParams = {}) => {
  const response = await api.get('/reporting/medication-usage', { params });
  return response.data.data;
};

export const getDrugTherapyProblemReport = async (params: ReportParams = {}) => {
  const response = await api.get('/reporting/drug-therapy-problems', { params });
  return response.data.data;
};

export const getPatientOutcomesReport = async (params: ReportParams = {}) => {
  const response = await api.get('/reporting/patient-outcomes', { params });
  return response.data.data;
};

export const getAllReports = async (params: ReportParams = {}) => {
  const response = await api.get('/reporting/all', { params });
  return response.data.data;
};
