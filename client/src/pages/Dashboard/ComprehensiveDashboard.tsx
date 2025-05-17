import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { formatDate } from '@/utils/date.utils';
import DateRangeFilter, {
  DateRange,
} from '@/components/domain/Dashboard/DateRangeFilter';

// Import dashboard section components
import BusinessOverview from '@/components/domain/Dashboard/BusinessOverview';
import PatientSection from '@/components/domain/Dashboard/PatientSection';
import MedicationSection from '@/components/domain/Dashboard/MedicationSection';
import InventorySection from '@/components/domain/Dashboard/InventorySection';
import SalesSection from '@/components/domain/Dashboard/SalesSection';
import FinancialSection from '@/components/domain/Dashboard/FinancialSection';
import ReportsSection from '@/components/domain/Dashboard/ReportsSection';

const ComprehensiveDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, isLoading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(
        fetchDashboardStats({
          startDate: formatDate(dateRange.startDate),
          endDate: formatDate(dateRange.endDate),
        }) as any
      );
    }
  }, [dispatch, dateRange]);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  // Get current date
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Business Dashboard
        </h1>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Welcome, {user?.firstName || 'Pharmacist'}
        </h2>
        <p className="text-gray-600">
          This dashboard provides a comprehensive overview of your
          pharmaceutical business, including patient data, inventory, sales,
          finances, and key performance indicators to help you make informed
          decisions.
        </p>
      </div>

      <DateRangeFilter onRangeChange={handleDateRangeChange} />

      {/* Business Overview Section */}
      <BusinessOverview dateRange={dateRange} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Management Section */}
        <PatientSection dateRange={dateRange} />

        {/* Medication Management Section */}
        <MedicationSection dateRange={dateRange} />

        {/* Inventory Management Section */}
        <InventorySection dateRange={dateRange} />

        {/* Sales & POS Section */}
        <SalesSection dateRange={dateRange} />

        {/* Financial Section */}
        <FinancialSection dateRange={dateRange} />

        {/* Reports & Analytics Section */}
        <ReportsSection dateRange={dateRange} />
      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
