import api from '../api';
import { ReportFormat } from '@/types/report.types';

/**
 * Service for interacting with the comprehensive reports API
 */
class ComprehensiveReportsService {
  /**
   * Get patient comprehensive report
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @param format Report format (default: JSON)
   * @returns Report data
   */
  async getPatientReport(
    startDate?: string,
    endDate?: string,
    format: ReportFormat = ReportFormat.JSON
  ) {
    const params: any = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/comprehensive-reports/patient', { params });
    return response.data.data;
  }

  /**
   * Get medication comprehensive report
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @param medicationType Optional medication type filter
   * @param format Report format (default: JSON)
   * @returns Report data
   */
  async getMedicationReport(
    startDate?: string,
    endDate?: string,
    medicationType?: string,
    format: ReportFormat = ReportFormat.JSON
  ) {
    const params: any = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (medicationType) params.medicationType = medicationType;

    const response = await api.get('/comprehensive-reports/medication', { params });
    return response.data.data;
  }

  /**
   * Get inventory comprehensive report
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @param location Optional location filter
   * @param reportType Report type (default: 'valuation')
   * @param format Report format (default: JSON)
   * @returns Report data
   */
  async getInventoryReport(
    startDate?: string,
    endDate?: string,
    location?: string,
    reportType: string = 'valuation',
    format: ReportFormat = ReportFormat.JSON
  ) {
    const params: any = { format, reportType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (location) params.location = location;

    const response = await api.get('/comprehensive-reports/inventory', { params });
    return response.data.data;
  }

  /**
   * Get sales comprehensive report
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @param location Optional location filter
   * @param groupBy Group by option (default: 'day')
   * @param format Report format (default: JSON)
   * @returns Report data
   */
  async getSalesReport(
    startDate?: string,
    endDate?: string,
    location?: string,
    groupBy: string = 'day',
    format: ReportFormat = ReportFormat.JSON
  ) {
    const params: any = { format, groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (location) params.location = location;

    const response = await api.get('/comprehensive-reports/sales', { params });
    return response.data.data;
  }

  /**
   * Get financial comprehensive report
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @param reportType Report type (default: 'summary')
   * @param period Period option (default: 'monthly')
   * @param format Report format (default: JSON)
   * @returns Report data
   */
  async getFinancialReport(
    startDate?: string,
    endDate?: string,
    reportType: string = 'summary',
    period: string = 'monthly',
    format: ReportFormat = ReportFormat.JSON
  ) {
    const params: any = { format, reportType, period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/comprehensive-reports/financial', { params });
    return response.data.data;
  }

  /**
   * Get administrative comprehensive report
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @param reportType Report type (default: 'activity')
   * @param userRole Optional user role filter
   * @param format Report format (default: JSON)
   * @returns Report data
   */
  async getAdministrativeReport(
    startDate?: string,
    endDate?: string,
    reportType: string = 'activity',
    userRole?: string,
    format: ReportFormat = ReportFormat.JSON
  ) {
    const params: any = { format, reportType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (userRole) params.userRole = userRole;

    const response = await api.get('/comprehensive-reports/administrative', { params });
    return response.data.data;
  }

  /**
   * Download report in specified format
   * @param reportType Report type
   * @param params Report parameters
   * @param format Report format
   * @returns Report file as blob
   */
  async downloadReport(
    reportType: 'patient' | 'medication' | 'inventory' | 'sales' | 'financial' | 'administrative',
    params: any = {},
    format: ReportFormat
  ) {
    const requestParams = { ...params, format };
    
    const response = await api.get(`/comprehensive-reports/${reportType}`, {
      params: requestParams,
      responseType: 'blob'
    });
    
    return response.data;
  }
}

export default new ComprehensiveReportsService();
