import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
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
  LineChart,
  Line,
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

// Mock data for financial reports
const mockFinancialData = {
  summary: {
    totalRevenue: 12500000,
    totalExpenses: 7800000,
    grossProfit: 4700000,
    netProfit: 3200000,
    profitMargin: 25.6,
  },
  revenueByCategory: [
    { category: 'Prescription Sales', value: 5200000 },
    { category: 'OTC Sales', value: 3800000 },
    { category: 'Services', value: 2100000 },
    { category: 'Other', value: 1400000 },
  ],
  expensesByCategory: [
    { category: 'Inventory Purchases', value: 4500000 },
    { category: 'Salaries', value: 1800000 },
    { category: 'Rent', value: 800000 },
    { category: 'Utilities', value: 400000 },
    { category: 'Other', value: 300000 },
  ],
  monthlyPerformance: [
    { month: 'Jan', revenue: 980000, expenses: 620000, profit: 360000 },
    { month: 'Feb', revenue: 1050000, expenses: 640000, profit: 410000 },
    { month: 'Mar', revenue: 1120000, expenses: 680000, profit: 440000 },
    { month: 'Apr', revenue: 950000, expenses: 610000, profit: 340000 },
    { month: 'May', revenue: 1080000, expenses: 650000, profit: 430000 },
    { month: 'Jun', revenue: 1150000, expenses: 690000, profit: 460000 },
  ],
  accountsReceivable: {
    current: 1200000,
    overdue30: 450000,
    overdue60: 280000,
    overdue90: 150000,
  },
};

const FinancialReports: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState(mockFinancialData);
  
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date(),
  });
  
  const [reportType, setReportType] = useState<string>('summary');
  const [exportFormat, setExportFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [period, setPeriod] = useState<string>('monthly');
  
  useEffect(() => {
    loadReport();
  }, []);
  
  const loadReport = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setFinancialData(mockFinancialData);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleExport = async () => {
    try {
      showToast({
        title: 'Report Downloaded',
        message: 'Your financial report has been downloaded successfully.',
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
    { value: 'summary', label: 'Financial Summary' },
    { value: 'profitLoss', label: 'Profit & Loss' },
    { value: 'balanceSheet', label: 'Balance Sheet' },
    { value: 'cashFlow', label: 'Cash Flow' },
    { value: 'accountsReceivable', label: 'Accounts Receivable' },
    { value: 'accountsPayable', label: 'Accounts Payable' },
  ];
  
  const exportFormats = [
    { value: ReportFormat.PDF, label: 'PDF' },
    { value: ReportFormat.CSV, label: 'CSV' },
    { value: ReportFormat.EXCEL, label: 'Excel' },
  ];
  
  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
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
                Period
              </label>
              <Select
                options={periodOptions}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
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
      ) : financialData ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <div className="p-4">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                Financial Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{financialData.summary?.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{financialData.summary?.totalExpenses?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Gross Profit</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{financialData.summary?.grossProfit?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₦{financialData.summary?.netProfit?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Profit Margin</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {financialData.summary?.profitMargin?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Report-specific content */}
          {reportType === 'summary' && (
            <>
              <Card>
                <div className="p-4">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    Monthly Performance
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={financialData.monthlyPerformance || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Revenue (₦)" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="expenses" name="Expenses (₦)" stroke="#ff8042" />
                        <Line type="monotone" dataKey="profit" name="Profit (₦)" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-4">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                      Revenue Breakdown
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialData.revenueByCategory || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="category"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {financialData.revenueByCategory?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                      Expense Breakdown
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialData.expensesByCategory || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="category"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {financialData.expensesByCategory?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
          
          {reportType === 'accountsReceivable' && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Accounts Receivable Aging
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Current', value: financialData.accountsReceivable.current },
                        { name: '1-30 Days', value: financialData.accountsReceivable.overdue30 },
                        { name: '31-60 Days', value: financialData.accountsReceivable.overdue60 },
                        { name: '61+ Days', value: financialData.accountsReceivable.overdue90 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="value" name="Amount (₦)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}
          
          {/* Placeholder for other report types */}
          {['profitLoss', 'balanceSheet', 'cashFlow', 'accountsPayable'].includes(reportType) && (
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

export default FinancialReports;
