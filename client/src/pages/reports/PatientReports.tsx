import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchPatients } from '@/store/slices/patientSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatDate } from '@/utils/date.utils';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const PatientReports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, isLoading, error } = useSelector((state: RootState) => state.patients);
  
  const [reportType, setReportType] = useState('medication-history');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handlePatientSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedPatients(selectedValues);
  };

  const handleGenerateReport = () => {
    // In a real app, this would call an API to generate the report
    // For now, we'll just simulate a report with some dummy data
    
    const reportData = {
      type: reportType,
      dateRange: {
        startDate: dateRange.startDate ? formatDate(dateRange.startDate) : null,
        endDate: dateRange.endDate ? formatDate(dateRange.endDate) : null,
      },
      patients: selectedPatients.length > 0 
        ? patients.filter(patient => selectedPatients.includes(patient.id))
        : patients,
      generatedAt: new Date().toISOString(),
    };
    
    setGeneratedReport(reportData);
  };

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // In a real app, this would trigger a download of the report in the specified format
    alert(`Exporting report in ${format} format...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Patient Reports</h1>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <Select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full"
              >
                <option value="medication-history">Medication History</option>
                <option value="clinical-assessments">Clinical Assessments</option>
                <option value="laboratory-findings">Laboratory Findings</option>
                <option value="drug-therapy-problems">Drug Therapy Problems</option>
                <option value="care-plans">Care Plans</option>
                <option value="soap-notes">SOAP Notes</option>
                <option value="patient-summary">Patient Summary</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={handleDateRangeChange}
              />
            </div>
            
            <div>
              <label htmlFor="patients" className="block text-sm font-medium text-gray-700 mb-1">
                Patients (select multiple or leave empty for all)
              </label>
              <select
                id="patients"
                multiple
                className="form-multiselect block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={selectedPatients}
                onChange={handlePatientSelection}
                size={5}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="pt-4">
              <Button 
                variant="primary" 
                onClick={handleGenerateReport}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {generatedReport && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Generated Report</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                  Export as PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
                  Export as CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                  Export as Excel
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-500">
                  Report Type: <span className="font-medium text-gray-900">{generatedReport.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Date Range: <span className="font-medium text-gray-900">
                    {generatedReport.dateRange.startDate} to {generatedReport.dateRange.endDate}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Patients: <span className="font-medium text-gray-900">
                    {generatedReport.patients.length} patient(s)
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Generated At: <span className="font-medium text-gray-900">
                    {new Date(generatedReport.generatedAt).toLocaleString()}
                  </span>
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Records
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedReport.patients.map((patient: any) => (
                      <tr key={patient.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(new Date(patient.dateOfBirth))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* This would show the count of records based on report type */}
                          {Math.floor(Math.random() * 10) + 1} records
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientReports;
