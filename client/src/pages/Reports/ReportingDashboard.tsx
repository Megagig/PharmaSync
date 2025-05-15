import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Tab } from '@headlessui/react';
import { formatDateToISO } from '@/utils/date.utils';
import {
  fetchAllReports,
  fetchDemographicsReport,
  fetchMedicationUsageReport,
  fetchDrugTherapyProblemReport,
  fetchPatientOutcomesReport,
} from '@/store/slices/reportingSlice';
import ReportDateFilter, { DateRange } from '@/components/domain/Reporting/ReportDateFilter';
import DemographicsReport from '@/components/domain/Reporting/DemographicsReport';
import MedicationUsageReport from '@/components/domain/Reporting/MedicationUsageReport';
import DrugTherapyProblemReport from '@/components/domain/Reporting/DrugTherapyProblemReport';
import PatientOutcomesReport from '@/components/domain/Reporting/PatientOutcomesReport';
import Button from '@/components/common/Button/Button';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ReportingDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    // Fetch all reports on initial load
    dispatch(fetchAllReports());
  }, [dispatch]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    
    // Prepare params for API calls
    const params: any = {};
    if (range.startDate) {
      params.startDate = formatDateToISO(range.startDate);
    }
    if (range.endDate) {
      params.endDate = formatDateToISO(range.endDate);
    }
    
    // Fetch reports with the new date range
    dispatch(fetchAllReports(params));
  };

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    
    // Prepare params for API calls
    const params: any = {};
    if (dateRange.startDate) {
      params.startDate = formatDateToISO(dateRange.startDate);
    }
    if (dateRange.endDate) {
      params.endDate = formatDateToISO(dateRange.endDate);
    }
    
    // Fetch the specific report for the selected tab
    switch (index) {
      case 0:
        dispatch(fetchAllReports(params));
        break;
      case 1:
        dispatch(fetchDemographicsReport(params));
        break;
      case 2:
        dispatch(fetchMedicationUsageReport(params));
        break;
      case 3:
        dispatch(fetchDrugTherapyProblemReport(params));
        break;
      case 4:
        dispatch(fetchPatientOutcomesReport(params));
        break;
    }
  };

  const handleExportReport = () => {
    setExportLoading(true);
    
    // Prepare the export filename with date range if available
    let filename = 'pharmasync_report';
    if (dateRange.startDate && dateRange.endDate) {
      filename += `_${formatDateToISO(dateRange.startDate)}_to_${formatDateToISO(dateRange.endDate)}`;
    }
    filename += '.csv';
    
    // Simulate export delay
    setTimeout(() => {
      setExportLoading(false);
      
      // Create a dummy CSV content for demonstration
      const csvContent = 'data:text/csv;charset=utf-8,Report Data...';
      
      // Create a download link and trigger the download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reporting Dashboard</h1>
        <Button
          variant="primary"
          onClick={handleExportReport}
          disabled={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>
      
      <ReportDateFilter onFilterChange={handleDateRangeChange} />
      
      <div className="bg-white shadow rounded-lg">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex p-1 space-x-1 bg-gray-100 rounded-t-lg">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Overview
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Demographics
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Medication Usage
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Drug Therapy Problems
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              Patient Outcomes
            </Tab>
          </Tab.List>
          <Tab.Panels className="p-6">
            <Tab.Panel>
              <div className="space-y-8">
                <DemographicsReport />
                <MedicationUsageReport />
                <DrugTherapyProblemReport />
                <PatientOutcomesReport />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <DemographicsReport />
            </Tab.Panel>
            <Tab.Panel>
              <MedicationUsageReport />
            </Tab.Panel>
            <Tab.Panel>
              <DrugTherapyProblemReport />
            </Tab.Panel>
            <Tab.Panel>
              <PatientOutcomesReport />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default ReportingDashboard;
