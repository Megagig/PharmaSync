import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchInventoryReport } from '@/store/slices/reportsSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import Select from '@/components/common/Select/Select';
import Spinner from '@/components/common/Spinner/Spinner';
import { ReportFormat } from '@/types/report.types';
import { formatDateToISO } from '@/utils/date.utils';
import { downloadReport } from '@/services/report.service';
import { useToast } from '@/hooks/useToast';

// Import chart components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InventoryReports: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const { inventoryReport, isLoading, error } = useSelector(
    (state: RootState) => state.reports
  );
  
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  
  const [reportType, setReportType] = useState<string>('valuation');
  const [exportFormat, setExportFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [location, setLocation] = useState<string>('all');
  
  useEffect(() => {
    loadReport();
  }, []);
  
  const loadReport = () => {
    const params: any = {};
    
    if (dateRange.startDate) {
      params.startDate = formatDateToISO(dateRange.startDate);
    }
    
    if (dateRange.endDate) {
      params.endDate = formatDateToISO(dateRange.endDate);
    }
    
    if (location !== 'all') {
      params.location = location;
    }
    
    dispatch(fetchInventoryReport(params));
  };
  
  const handleExport = async () => {
    try {
      const params: any = {
        type: 'inventory',
        format: exportFormat,
      };
      
      if (dateRange.startDate) {
        params.startDate = formatDateToISO(dateRange.startDate);
      }
      
      if (dateRange.endDate) {
        params.endDate = formatDateToISO(dateRange.endDate);
      }
      
      if (location !== 'all') {
        params.location = location;
      }
      
      const response = await downloadReport(params);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.${exportFormat.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast({
        title: 'Report Downloaded',
        message: 'Your report has been downloaded successfully.',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Export Failed',
        message: 'Failed to export report. Please try again.',
        type: 'error',
      });
    }
  };
  
  const reportTypes = [
    { value: 'valuation', label: 'Inventory Valuation' },
    { value: 'expiry', label: 'Expiry Analysis' },
    { value: 'lowStock', label: 'Low Stock Items' },
    { value: 'movement', label: 'Inventory Movement' },
    { value: 'turnover', label: 'Inventory Turnover' },
    { value: 'category', label: 'Category Analysis' },
  ];
  
  const exportFormats = [
    { value: ReportFormat.PDF, label: 'PDF' },
    { value: ReportFormat.CSV, label: 'CSV' },
    { value: ReportFormat.EXCEL, label: 'Excel' },
  ];
  
  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'main', label: 'Main Store' },
    { value: 'pharmacy', label: 'Pharmacy' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Reports</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Back to Reports
          </Button>
          <Button variant="primary" onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <Select
                options={reportTypes}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Select
                options={locations}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={setDateRange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export Format
              </label>
              <Select
                options={exportFormats}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ReportFormat)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={loadReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Report Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card>
          <div className="p-4 text-center text-red-500">
            <p>Failed to load report: {error}</p>
          </div>
        </Card>
      ) : inventoryReport ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <div className="p-4">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Inventory Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {inventoryReport.summary?.totalMedications || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {inventoryReport.summary?.totalStock || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{inventoryReport.summary?.totalValue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {inventoryReport.summary?.lowStockCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Report-specific content */}
          {reportType === 'valuation' && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Inventory Valuation
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventoryReport.stockByCategory || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => {
                        return name === 'totalValue' ? `₦${value.toLocaleString()}` : value;
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="Product Count" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="totalValue" name="Total Value (₦)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}
          
          {reportType === 'expiry' && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Expiry Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryReport.expiryBreakdown || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalValue"
                          nameKey="expiryPeriod"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {inventoryReport.expiryBreakdown?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventoryReport.expiryBreakdown || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="expiryPeriod" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                        <Bar dataKey="count" name="Product Count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Placeholder for other report types */}
          {['lowStock', 'movement', 'turnover', 'category'].includes(reportType) && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  {reportTypes.find(r => r.value === reportType)?.label}
                </h2>
                <p className="text-gray-600">
                  This report view is currently being developed. Please check back soon or export the data to view it.
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <div className="p-4 text-center text-gray-500">
            <p>No data available. Please generate a report.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryReports;
