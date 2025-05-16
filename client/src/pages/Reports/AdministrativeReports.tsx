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

// Mock data for administrative reports
const mockUserActivityData = [
  { day: 'Mon', logins: 42, actions: 385 },
  { day: 'Tue', logins: 38, actions: 410 },
  { day: 'Wed', logins: 45, actions: 450 },
  { day: 'Thu', logins: 40, actions: 420 },
  { day: 'Fri', logins: 43, actions: 430 },
  { day: 'Sat', logins: 28, actions: 280 },
  { day: 'Sun', logins: 25, actions: 240 },
];

const mockUserRoleData = [
  { name: 'Pharmacists', value: 12 },
  { name: 'Managers', value: 4 },
  { name: 'Cashiers', value: 8 },
  { name: 'Admins', value: 2 },
  { name: 'Other Staff', value: 6 },
];

const mockActionTypeData = [
  { name: 'Sales', value: 35 },
  { name: 'Inventory', value: 25 },
  { name: 'Patient Records', value: 20 },
  { name: 'Prescriptions', value: 15 },
  { name: 'Reports', value: 5 },
];

const AdministrativeReports: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });
  
  const [reportType, setReportType] = useState<string>('activity');
  const [exportFormat, setExportFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [userRole, setUserRole] = useState<string>('all');
  
  useEffect(() => {
    loadReport();
  }, []);
  
  const loadReport = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const handleExport = async () => {
    try {
      const params: any = {
        type: 'administrative',
        format: exportFormat,
      };
      
      if (dateRange.startDate) {
        params.startDate = formatDateToISO(dateRange.startDate);
      }
      
      if (dateRange.endDate) {
        params.endDate = formatDateToISO(dateRange.endDate);
      }
      
      if (userRole !== 'all') {
        params.userRole = userRole;
      }
      
      showToast({
        title: 'Report Downloaded',
        message: 'Your administrative report has been downloaded successfully.',
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
    { value: 'activity', label: 'User Activity' },
    { value: 'performance', label: 'Staff Performance' },
    { value: 'audit', label: 'Audit Logs' },
    { value: 'security', label: 'Security Events' },
    { value: 'system', label: 'System Usage' },
    { value: 'errors', label: 'Error Logs' },
  ];
  
  const exportFormats = [
    { value: ReportFormat.PDF, label: 'PDF' },
    { value: ReportFormat.CSV, label: 'CSV' },
    { value: ReportFormat.EXCEL, label: 'Excel' },
  ];
  
  const userRoles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Administrators' },
    { value: 'pharmacist', label: 'Pharmacists' },
    { value: 'manager', label: 'Managers' },
    { value: 'cashier', label: 'Cashiers' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Administrative Reports</h1>
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
                User Role
              </label>
              <Select
                options={userRoles}
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
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
      ) : (
        <div className="space-y-6">
          {/* Report-specific content */}
          {reportType === 'activity' && (
            <>
              <Card>
                <div className="p-4">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    User Activity Overview
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mockUserActivityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="logins" name="Logins" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="actions" name="Actions" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-4">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                      User Distribution by Role
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockUserRoleData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {mockUserRoleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                      Activity by Type
                    </h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockActionTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {mockActionTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card>
                <div className="p-4">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    Top Active Users
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Logins
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Active
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                          <td className="px-6 py-4 whitespace-nowrap">Pharmacist</td>
                          <td className="px-6 py-4 whitespace-nowrap">24</td>
                          <td className="px-6 py-4 whitespace-nowrap">187</td>
                          <td className="px-6 py-4 whitespace-nowrap">Today, 2:45 PM</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                          <td className="px-6 py-4 whitespace-nowrap">Manager</td>
                          <td className="px-6 py-4 whitespace-nowrap">18</td>
                          <td className="px-6 py-4 whitespace-nowrap">156</td>
                          <td className="px-6 py-4 whitespace-nowrap">Today, 1:30 PM</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Michael Johnson</td>
                          <td className="px-6 py-4 whitespace-nowrap">Cashier</td>
                          <td className="px-6 py-4 whitespace-nowrap">15</td>
                          <td className="px-6 py-4 whitespace-nowrap">142</td>
                          <td className="px-6 py-4 whitespace-nowrap">Today, 12:15 PM</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Sarah Williams</td>
                          <td className="px-6 py-4 whitespace-nowrap">Pharmacist</td>
                          <td className="px-6 py-4 whitespace-nowrap">12</td>
                          <td className="px-6 py-4 whitespace-nowrap">128</td>
                          <td className="px-6 py-4 whitespace-nowrap">Yesterday, 5:20 PM</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">David Brown</td>
                          <td className="px-6 py-4 whitespace-nowrap">Admin</td>
                          <td className="px-6 py-4 whitespace-nowrap">10</td>
                          <td className="px-6 py-4 whitespace-nowrap">95</td>
                          <td className="px-6 py-4 whitespace-nowrap">Yesterday, 3:10 PM</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </>
          )}
          
          {/* Placeholder for other report types */}
          {['performance', 'audit', 'security', 'system', 'errors'].includes(reportType) && (
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
      )}
    </div>
  );
};

export default AdministrativeReports;
