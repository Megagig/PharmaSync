import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientReport } from '@/store/slices/reportsSlice';
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
import DemographicsReport from '@/components/domain/Reporting/DemographicsReport';
import ComprehensiveDemographicsReport from '@/components/domain/Reporting/ComprehensiveDemographicsReport';
import PatientOutcomesReport from '@/components/domain/Reporting/PatientOutcomesReport';
import DrugTherapyProblemReport from '@/components/domain/Reporting/DrugTherapyProblemReport';

const PatientReports: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { patientReport, isLoading, error } = useSelector(
    (state: RootState) => state.reports
  );

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  const [reportType, setReportType] = useState<string>('demographics');
  const [exportFormat, setExportFormat] = useState<ReportFormat>(
    ReportFormat.PDF
  );

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

    dispatch(fetchPatientReport());
  };

  const handleExport = async () => {
    try {
      const params: any = {
        type: 'patient',
        format: exportFormat,
      };

      if (dateRange.startDate) {
        params.startDate = formatDateToISO(dateRange.startDate);
      }

      if (dateRange.endDate) {
        params.endDate = formatDateToISO(dateRange.endDate);
      }

      const response = await downloadReport(params);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `patient-report-${
          new Date().toISOString().split('T')[0]
        }.${exportFormat.toLowerCase()}`
      );
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
    { value: 'demographics', label: 'Patient Demographics' },
    { value: 'outcomes', label: 'Patient Outcomes' },
    { value: 'drugTherapy', label: 'Drug Therapy Problems' },
    { value: 'conditions', label: 'Medical Conditions' },
    { value: 'allergies', label: 'Patient Allergies' },
    { value: 'prescriptions', label: 'Prescription History' },
  ];

  const exportFormats = [
    { value: ReportFormat.PDF, label: 'PDF' },
    { value: ReportFormat.CSV, label: 'CSV' },
    { value: ReportFormat.EXCEL, label: 'Excel' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Patient Reports
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {reportType === 'demographics' && <ComprehensiveDemographicsReport />}
          {reportType === 'outcomes' && <PatientOutcomesReport />}
          {reportType === 'drugTherapy' && <DrugTherapyProblemReport />}

          {/* Placeholder for other report types */}
          {['conditions', 'allergies', 'prescriptions'].includes(
            reportType
          ) && (
            <Card>
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  {reportTypes.find((r) => r.value === reportType)?.label}
                </h2>
                <p className="text-gray-600">
                  This report is currently being developed. Please check back
                  soon.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientReports;
