import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  parameters: Record<string, any>;
  data: any[];
}

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch the report from an API
    // For now, we'll just simulate loading and then set a dummy report
    const timer = setTimeout(() => {
      if (id === 'not-found') {
        setError('Report not found');
        setIsLoading(false);
        return;
      }

      setReport({
        id: id || '1',
        title: 'Patient Medication History Report',
        description: 'Report showing medication history for all patients in the last 30 days',
        type: 'patient-medication',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parameters: {
          dateRange: {
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
            endDate: new Date().toISOString(),
          },
          patientIds: [],
        },
        data: [
          {
            patientId: '1',
            patientName: 'John Doe',
            medications: [
              {
                id: '1',
                name: 'Amoxicillin',
                dosage: '500mg',
                frequency: 'Three times daily',
                startDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
              },
              {
                id: '2',
                name: 'Ibuprofen',
                dosage: '400mg',
                frequency: 'As needed',
                startDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
                endDate: null,
              },
            ],
          },
          {
            patientId: '2',
            patientName: 'Jane Smith',
            medications: [
              {
                id: '3',
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                startDate: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
                endDate: null,
              },
            ],
          },
        ],
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // In a real app, this would trigger a download of the report in the specified format
    alert(`Exporting report in ${format} format...`);
  };

  const handleScheduleReport = () => {
    // In a real app, this would open a modal to schedule the report
    alert('Scheduling report...');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Report not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{report.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            Export as PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('csv')}>
            Export as CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            Export as Excel
          </Button>
          <Button variant="primary" onClick={handleScheduleReport}>
            Schedule
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Report Type: <span className="font-medium text-gray-900">{report.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </p>
              <p className="text-sm text-gray-500">
                Created At: <span className="font-medium text-gray-900">{new Date(report.createdAt).toLocaleString()}</span>
              </p>
              <p className="text-sm text-gray-500">
                Updated At: <span className="font-medium text-gray-900">{new Date(report.updatedAt).toLocaleString()}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Date Range: <span className="font-medium text-gray-900">
                  {new Date(report.parameters.dateRange.startDate).toLocaleDateString()} to {new Date(report.parameters.dateRange.endDate).toLocaleDateString()}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Patients: <span className="font-medium text-gray-900">
                  {report.parameters.patientIds.length > 0 ? `${report.parameters.patientIds.length} selected patients` : 'All patients'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Report Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.data.flatMap(patient => 
                  patient.medications.map((medication, index) => (
                    <tr key={`${patient.patientId}-${medication.id}`}>
                      {index === 0 ? (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" rowSpan={patient.medications.length}>
                          {patient.patientName}
                        </td>
                      ) : null}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.dosage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(medication.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Ongoing'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" as={Link} to="/reports">
          Back to Reports
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          Print Report
        </Button>
      </div>
    </div>
  );
};

export default ReportDetail;
