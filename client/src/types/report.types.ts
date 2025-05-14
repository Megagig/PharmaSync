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

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
}

export interface ReportChart {
  title: string;
  type: ChartType;
  dataField: string;
  labelField: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  options?: any;
}

export interface ReportConfiguration {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  createdBy: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isPublic: boolean;
  filters?: ReportFilter[];
  charts?: ReportChart[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfigurationCreate {
  name: string;
  description?: string;
  type: ReportType;
  isPublic?: boolean;
  filters?: ReportFilter[];
  charts?: ReportChart[];
  startDate?: string;
  endDate?: string;
}

export interface ReportConfigurationUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  filters?: ReportFilter[];
  charts?: ReportChart[];
  startDate?: string;
  endDate?: string;
}

export interface ReportSchedule {
  id: string;
  report: string | ReportConfiguration;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[];
  nextRunDate: string;
  lastRunDate?: string;
  isActive: boolean;
  createdBy: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReportScheduleCreate {
  report: string;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[];
  nextRunDate: string;
  isActive?: boolean;
}

export interface ReportScheduleUpdate {
  frequency?: ReportFrequency;
  format?: ReportFormat;
  recipients?: string[];
  nextRunDate?: string;
  isActive?: boolean;
}

export interface ReportExecution {
  id: string;
  report: string | ReportConfiguration | null;
  schedule?: string | ReportSchedule;
  format: ReportFormat;
  executedBy: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
  executedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportData {
  title: string;
  type: ReportType;
  generatedAt: string;
  startDate?: string;
  endDate?: string;
  data: any[];
  charts?: {
    title: string;
    type: ChartType;
    data: any[];
  }[];
  summary?: {
    [key: string]: any;
  };
  fileUrl?: string;
}

export interface ReportRequest {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  filters?: ReportFilter[];
  format?: ReportFormat;
  charts?: ReportChart[];
}

export interface ReportState {
  configurations: ReportConfiguration[];
  currentConfiguration: ReportConfiguration | null;
  schedules: ReportSchedule[];
  executions: ReportExecution[];
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  totalConfigurations: number;
  totalSchedules: number;
  totalExecutions: number;
  totalPages: number;
  currentPage: number;
}
