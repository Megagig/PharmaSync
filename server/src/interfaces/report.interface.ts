import { Document } from 'mongoose';

export enum ReportType {
  SALES = 'sales',
  INVENTORY = 'inventory',
  PRESCRIPTION = 'prescription',
  PATIENT = 'patient',
  MEDICATION = 'medication',
  STAFF = 'staff',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
}

export enum ReportFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
  RADAR = 'radar',
  TABLE = 'table',
}

export interface IReportFilter {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
}

export interface IReportChart {
  title: string;
  type: ChartType;
  dataField: string;
  labelField: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  options?: any;
}

export interface IReportConfiguration extends Document {
  name: string;
  description?: string;
  type: ReportType;
  createdBy: string; // Reference to user ID
  isPublic: boolean;
  filters?: IReportFilter[];
  charts?: IReportChart[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportConfigurationCreate {
  name: string;
  description?: string;
  type: ReportType;
  createdBy: string;
  isPublic?: boolean;
  filters?: IReportFilter[];
  charts?: IReportChart[];
  startDate?: Date;
  endDate?: Date;
}

export interface IReportConfigurationUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  filters?: IReportFilter[];
  charts?: IReportChart[];
  startDate?: Date;
  endDate?: Date;
}

export interface IReportSchedule extends Document {
  report: string; // Reference to report configuration ID
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[]; // Array of email addresses
  nextRunDate: Date;
  lastRunDate?: Date;
  isActive: boolean;
  createdBy: string; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportScheduleCreate {
  report: string;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[];
  nextRunDate: Date;
  isActive?: boolean;
  createdBy: string;
}

export interface IReportScheduleUpdate {
  frequency?: ReportFrequency;
  format?: ReportFormat;
  recipients?: string[];
  nextRunDate?: Date;
  lastRunDate?: Date;
  isActive?: boolean;
}

export interface IReportExecution extends Document {
  report: string; // Reference to report configuration ID
  schedule?: string; // Reference to report schedule ID (if scheduled)
  format: ReportFormat;
  executedBy: string; // Reference to user ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string; // URL to the generated report file
  error?: string; // Error message if failed
  executedAt: Date;
  completedAt?: Date;
}

export interface IReportExecutionCreate {
  report: string;
  schedule?: string;
  format: ReportFormat;
  executedBy: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
}

export interface IReportExecutionUpdate {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
  completedAt?: Date;
}

export interface IReportData {
  title: string;
  type: ReportType;
  generatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  data: any;
  charts?: {
    title: string;
    type: ChartType;
    data: any;
  }[];
  summary?: {
    [key: string]: any;
  };
}

export interface IReportRequest {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  filters?: IReportFilter[];
  format?: ReportFormat;
  charts?: IReportChart[];
}
