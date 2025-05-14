import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { generateCustomReport, createNewReportConfiguration, clearReportData } from '@/store/slices/reportSlice';
import { ReportType, ReportFormat, ChartType, ReportRequest, ReportConfigurationCreate, ReportFilter, ReportChart } from '@/types/report.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import ChartContainer from '@/components/charts/ChartContainer';

const ReportGenerator: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { reportData, isLoading, error } = useSelector((state: RootState) => state.report);
  
  const [reportType, setReportType] = useState<ReportType>(ReportType.SALES);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<ReportFormat>(ReportFormat.JSON);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [charts, setCharts] = useState<ReportChart[]>([]);
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);
  const [reportName, setReportName] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  
  useEffect(() => {
    // Clear report data when component unmounts
    return () => {
      dispatch(clearReportData());
    };
  }, [dispatch]);
  
  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);
  
  const handleGenerateReport = () => {
    const reportRequest: ReportRequest = {
      type: reportType,
      startDate,
      endDate,
      filters: filters.length > 0 ? filters : undefined,
      format: reportFormat,
      charts: charts.length > 0 ? charts : undefined,
    };
    
    dispatch(generateCustomReport(reportRequest));
  };
  
  const handleSaveReport = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }
    
    const reportConfig: ReportConfigurationCreate = {
      name: reportName,
      description: reportDescription,
      type: reportType,
      isPublic,
      filters: filters.length > 0 ? filters : undefined,
      charts: charts.length > 0 ? charts : undefined,
      startDate,
      endDate,
    };
    
    dispatch(createNewReportConfiguration(reportConfig))
      .unwrap()
      .then(() => {
        setShowSaveForm(false);
        navigate('/reports/configurations');
      })
      .catch((error) => {
        console.error('Failed to save report:', error);
      });
  };
  
  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };
  
  const handleUpdateFilter = (index: number, field: string, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };
  
  const handleRemoveFilter = (index: number) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    setFilters(updatedFilters);
  };
  
  const renderFilterFields = () => {
    // Different fields based on report type
    switch (reportType) {
      case ReportType.SALES:
        return [
          { value: 'totalAmount', label: 'Total Amount' },
          { value: 'status', label: 'Status' },
          { value: 'paymentMethod', label: 'Payment Method' },
        ];
      case ReportType.INVENTORY:
        return [
          { value: 'quantity', label: 'Quantity' },
          { value: 'expiryDate', label: 'Expiry Date' },
          { value: 'reorderLevel', label: 'Reorder Level' },
        ];
      case ReportType.PRESCRIPTION:
        return [
          { value: 'status', label: 'Status' },
          { value: 'prescriber', label: 'Prescriber' },
          { value: 'patient', label: 'Patient' },
        ];
      case ReportType.PATIENT:
        return [
          { value: 'age', label: 'Age' },
          { value: 'gender', label: 'Gender' },
          { value: 'city', label: 'City' },
        ];
      default:
        return [];
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Generate Report</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Report Configuration</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Report Type */}
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select
                id="reportType"
                className="form-select mt-1 block w-full"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <option value={ReportType.SALES}>Sales Report</option>
                <option value={ReportType.INVENTORY}>Inventory Report</option>
                <option value={ReportType.PRESCRIPTION}>Prescription Report</option>
                <option value={ReportType.PATIENT}>Patient Report</option>
                <option value={ReportType.MEDICATION}>Medication Report</option>
                <option value={ReportType.STAFF}>Staff Report</option>
                <option value={ReportType.CUSTOM}>Custom Report</option>
              </select>
            </div>
            
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="form-input mt-1 block w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="form-input mt-1 block w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Report Format */}
            <div>
              <label htmlFor="reportFormat" className="block text-sm font-medium text-gray-700">
                Report Format
              </label>
              <select
                id="reportFormat"
                className="form-select mt-1 block w-full"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
              >
                <option value={ReportFormat.JSON}>Web View</option>
                <option value={ReportFormat.PDF}>PDF</option>
                <option value={ReportFormat.CSV}>CSV</option>
                <option value={ReportFormat.EXCEL}>Excel</option>
              </select>
            </div>
            
            {/* Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Filters
                </label>
                <Button
                  variant="text"
                  size="sm"
                  onClick={handleAddFilter}
                >
                  Add Filter
                </Button>
              </div>
              
              {filters.length === 0 ? (
                <p className="text-sm text-gray-500">No filters added</p>
              ) : (
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        className="form-select text-sm flex-1"
                        value={filter.field}
                        onChange={(e) => handleUpdateFilter(index, 'field', e.target.value)}
                      >
                        <option value="">Select Field</option>
                        {renderFilterFields().map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="form-select text-sm flex-1"
                        value={filter.operator}
                        onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                      >
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greaterThan">Greater Than</option>
                        <option value="lessThan">Less Than</option>
                      </select>
                      <input
                        type="text"
                        className="form-input text-sm flex-1"
                        value={filter.value}
                        onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveFilter(index)}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleGenerateReport}
                isLoading={isLoading}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Report Preview */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Report Preview</h2>
            {reportData && (
              <Button
                variant="outline"
                onClick={() => setShowSaveForm(true)}
              >
                Save Report
              </Button>
            )}
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500 text-center">
                  <svg
                    className="h-12 w-12 mx-auto text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="mt-2">{error}</p>
                </div>
              </div>
            ) : reportData ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{reportData.title}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Generated At</p>
                      <p className="text-sm font-medium">{new Date(reportData.generatedAt).toLocaleString()}</p>
                    </div>
                    {reportData.startDate && reportData.endDate && (
                      <div>
                        <p className="text-sm text-gray-500">Period</p>
                        <p className="text-sm font-medium">
                          {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Summary */}
                {reportData.summary && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500">{key}</p>
                          <p className="text-lg font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Charts */}
                {reportData.charts && reportData.charts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Charts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportData.charts.map((chart, index) => (
                        <ChartContainer
                          key={index}
                          title={chart.title}
                          type={chart.type as ChartType}
                          data={chart.data}
                          height={300}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Data Table */}
                {reportData.data && reportData.data.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data</h3>
                    <div className="overflow-x-auto">
                      <ChartContainer
                        title=""
                        type={ChartType.TABLE}
                        data={reportData.data.slice(0, 10)}
                        className="border-0 shadow-none"
                      />
                      {reportData.data.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Showing 10 of {reportData.data.length} records
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Download Link */}
                {reportData.fileUrl && (
                  <div className="mt-4">
                    <a
                      href={`${process.env.REACT_APP_API_URL}${reportData.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Download Report
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <svg
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">Configure and generate a report to see the preview</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Save Report Form */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Save Report</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="reportName" className="block text-sm font-medium text-gray-700">
                  Report Name
                </label>
                <input
                  type="text"
                  id="reportName"
                  className="form-input mt-1 block w-full"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="reportDescription"
                  className="form-textarea mt-1 block w-full"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Enter report description"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="form-checkbox h-4 w-4 text-primary-600"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Make this report public (visible to all users)
                </label>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSaveForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveReport}
                isLoading={isLoading}
              >
                Save Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
