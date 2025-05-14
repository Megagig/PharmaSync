import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { generateCustomReport } from '@/store/slices/reportSlice';
import { ReportType, ChartType, ReportRequest } from '@/types/report.types';
import StatCard from '@/components/dashboard/StatCard';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import Button from '@/components/common/Button/Button';

const ReportDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { reportData, isLoading, error } = useSelector((state: RootState) => state.report);
  
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  
  useEffect(() => {
    // Load initial dashboard data
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    // Update state when report data changes
    if (reportData) {
      switch (reportData.type) {
        case ReportType.SALES:
          setSalesData(reportData);
          break;
        case ReportType.INVENTORY:
          setInventoryData(reportData);
          break;
        case ReportType.PRESCRIPTION:
          setPrescriptionData(reportData);
          break;
        case ReportType.PATIENT:
          setPatientData(reportData);
          break;
        default:
          break;
      }
    }
  }, [reportData]);
  
  const loadDashboardData = async () => {
    // Get date range for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Load sales data
    const salesRequest: ReportRequest = {
      type: ReportType.SALES,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    
    dispatch(generateCustomReport(salesRequest));
    
    // Load inventory data
    const inventoryRequest: ReportRequest = {
      type: ReportType.INVENTORY,
    };
    
    dispatch(generateCustomReport(inventoryRequest));
    
    // Load prescription data
    const prescriptionRequest: ReportRequest = {
      type: ReportType.PRESCRIPTION,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    
    dispatch(generateCustomReport(prescriptionRequest));
    
    // Load patient data
    const patientRequest: ReportRequest = {
      type: ReportType.PATIENT,
    };
    
    dispatch(generateCustomReport(patientRequest));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports Dashboard</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports/configurations')}
          >
            Saved Reports
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/reports/new')}
          >
            Create New Report
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales (30 Days)"
          value={salesData?.summary?.['Total Sales'] || '$0.00'}
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onClick={() => navigate('/reports/sales')}
        />
        <StatCard
          title="Inventory Status"
          value={inventoryData?.summary?.['Total Items'] || '0'}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          onClick={() => navigate('/reports/inventory')}
        />
        <StatCard
          title="Prescriptions (30 Days)"
          value={prescriptionData?.summary?.['Total Prescriptions'] || '0'}
          color="purple"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          onClick={() => navigate('/reports/prescriptions')}
        />
        <StatCard
          title="Total Patients"
          value={patientData?.summary?.['Total Patients'] || '0'}
          color="indigo"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          onClick={() => navigate('/reports/patients')}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <DashboardWidget
          title="Sales Trend (Last 30 Days)"
          chartType={ChartType.LINE}
          chartData={salesData?.charts?.[0]?.data || []}
          chartOptions={{
            yAxisLabel: 'Sales ($)',
            xAxisLabel: 'Date',
            color: 'rgba(16, 185, 129, 0.6)',
          }}
          isLoading={isLoading && !salesData}
          error={error}
          onViewMore={() => navigate('/reports/sales')}
        />
        
        {/* Inventory Status */}
        <DashboardWidget
          title="Inventory Status"
          chartType={ChartType.PIE}
          chartData={inventoryData?.charts?.[0]?.data || []}
          chartOptions={{
            showLegend: true,
          }}
          isLoading={isLoading && !inventoryData}
          error={error}
          onViewMore={() => navigate('/reports/inventory')}
        />
        
        {/* Prescription Status */}
        <DashboardWidget
          title="Prescription Status"
          chartType={ChartType.PIE}
          chartData={prescriptionData?.charts?.[0]?.data || []}
          chartOptions={{
            showLegend: true,
          }}
          isLoading={isLoading && !prescriptionData}
          error={error}
          onViewMore={() => navigate('/reports/prescriptions')}
        />
        
        {/* Patient Demographics */}
        <DashboardWidget
          title="Patient Demographics"
          chartType={ChartType.BAR}
          chartData={patientData?.charts?.[0]?.data || []}
          chartOptions={{
            yAxisLabel: 'Number of Patients',
            xAxisLabel: 'Age Group',
          }}
          isLoading={isLoading && !patientData}
          error={error}
          onViewMore={() => navigate('/reports/patients')}
        />
      </div>
    </div>
  );
};

export default ReportDashboard;
