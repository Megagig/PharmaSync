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

// Import medication usage report component
import MedicationUsageReport from '@/components/domain/Reporting/MedicationUsageReport';
import ComprehensiveMedicationReport from '@/components/domain/Reporting/ComprehensiveMedicationReport';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

const MedicationReports: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  const [reportType, setReportType] = useState<string>('usage');
  const [exportFormat, setExportFormat] = useState<ReportFormat>(
    ReportFormat.PDF
  );
  const [medicationType, setMedicationType] = useState<string>('all');

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
        type: 'medication',
        format: exportFormat,
      };

      if (dateRange.startDate) {
        params.startDate = formatDateToISO(dateRange.startDate);
      }

      if (dateRange.endDate) {
        params.endDate = formatDateToISO(dateRange.endDate);
      }

      if (medicationType !== 'all') {
        params.medicationType = medicationType;
      }

      showToast({
        title: 'Report Downloaded',
        message: 'Your medication report has been downloaded successfully.',
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
    { value: 'usage', label: 'Medication Usage' },
    { value: 'prescriptions', label: 'Prescription Analysis' },
    { value: 'dispensing', label: 'Dispensing Patterns' },
    { value: 'interactions', label: 'Drug Interactions' },
    { value: 'adherence', label: 'Medication Adherence' },
    { value: 'therapeutic', label: 'Therapeutic Categories' },
  ];

  const exportFormats = [
    { value: ReportFormat.PDF, label: 'PDF' },
    { value: ReportFormat.CSV, label: 'CSV' },
    { value: ReportFormat.EXCEL, label: 'Excel' },
  ];

  const medicationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'otc', label: 'Over-the-Counter' },
    { value: 'prescription', label: 'Prescription Only' },
    { value: 'controlled', label: 'Controlled Substances' },
  ];

  // Mock data for medication reports
  const mockPrescriptionData = [
    { month: 'Jan', count: 145 },
    { month: 'Feb', count: 158 },
    { month: 'Mar', count: 172 },
    { month: 'Apr', count: 163 },
    { month: 'May', count: 180 },
    { month: 'Jun', count: 192 },
  ];

  const mockTherapeuticCategories = [
    { name: 'Antibiotics', value: 28 },
    { name: 'Analgesics', value: 22 },
    { name: 'Antihypertensives', value: 18 },
    { name: 'Antidiabetics', value: 15 },
    { name: 'Antihistamines', value: 10 },
    { name: 'Others', value: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Medication Reports
        </h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/reports')}>
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
                Medication Type
              </label>
              <Select
                options={medicationTypes}
                value={medicationType}
                onChange={(e) => setMedicationType(e.target.value)}
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
                onChange={(e) =>
                  setExportFormat(e.target.value as ReportFormat)
                }
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
          {reportType === 'usage' && <ComprehensiveMedicationReport />}

          {reportType === 'prescriptions' && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Prescription Analysis
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockPrescriptionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Prescriptions"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}

          {reportType === 'therapeutic' && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Therapeutic Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockTherapeuticCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {mockTherapeuticCategories.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mockTherapeuticCategories}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Percentage (%)"
                          fill="#8884d8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Placeholder for other report types */}
          {['dispensing', 'interactions', 'adherence'].includes(reportType) && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  {reportTypes.find((r) => r.value === reportType)?.label}
                </h2>
                <p className="text-gray-600">
                  This report view is currently being developed. Please check
                  back soon or export the data to view it.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationReports;
