import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import { DateRange } from './DateRangeFilter';
import { formatCurrency } from '@/utils/formatters';
import { fetchInventoryValuation } from '@/store/slices/inventorySlice';
import { fetchSalesReport } from '@/store/slices/comprehensiveReportsSlice';
import { fetchPrescriptionReport } from '@/store/slices/reportsSlice';

interface BusinessOverviewProps {
  dateRange: DateRange;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  onClick,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <p
              className={`text-xs ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-full">{icon}</div>
      </div>
    </div>
  );
};

const BusinessOverview: React.FC<BusinessOverviewProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { stats, isLoading: dashboardLoading } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { valuation, isLoading: inventoryLoading } = useSelector(
    (state: RootState) => state.inventory
  );
  const { salesReport, isLoading: salesLoading } = useSelector(
    (state: RootState) => state.comprehensiveReports
  );
  const { prescriptionReport, isLoading: prescriptionLoading } = useSelector(
    (state: RootState) => state.reports
  );

  const isLoading =
    dashboardLoading || inventoryLoading || salesLoading || prescriptionLoading;

  useEffect(() => {
    // Fetch additional data needed for the business overview
    const startDate = dateRange.startDate
      ? dateRange.startDate.toISOString()
      : undefined;
    const endDate = dateRange.endDate
      ? dateRange.endDate.toISOString()
      : undefined;

    dispatch(fetchInventoryValuation());
    dispatch(fetchSalesReport({ startDate, endDate, groupBy: 'day' }));
    dispatch(fetchPrescriptionReport({ startDate, endDate }));
  }, [dispatch, dateRange]);

  if (isLoading || !stats) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Business Overview
          </h2>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Use real data from the API
  const totalRevenue = salesReport?.summary?.totalRevenue || 0;
  const revenueChange = salesReport?.summary?.percentChange || 0;
  const isRevenuePositive = revenueChange >= 0;

  const totalPatients = stats.totalPatients || 0;
  const newPatients = stats.newPatients || 0;
  const isNewPatientsPositive = newPatients >= 0;

  const inventoryValue = valuation?.totalValue || 0;
  const lowStockItems = valuation?.lowStockCount || 0;

  const pendingPrescriptions = prescriptionReport?.summary?.pendingCount || 0;
  const completedPrescriptions =
    prescriptionReport?.summary?.completedCount || 0;

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          Business Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change={`${Math.abs(revenueChange).toFixed(1)}%`}
            isPositive={isRevenuePositive}
            icon={
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            onClick={() => navigate('/reports/financial')}
          />
          <KPICard
            title="Total Patients"
            value={totalPatients}
            change={newPatients}
            isPositive={isNewPatientsPositive}
            icon={
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            onClick={() => navigate('/patients')}
          />
          <KPICard
            title="Inventory Value"
            value={formatCurrency(inventoryValue)}
            change={lowStockItems}
            isPositive={false}
            icon={
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
            onClick={() => navigate('/inventory')}
          />
          <KPICard
            title="Prescriptions"
            value={completedPrescriptions}
            change={pendingPrescriptions}
            isPositive={pendingPrescriptions > 0}
            icon={
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            onClick={() => navigate('/prescriptions')}
          />
        </div>
      </div>
    </Card>
  );
};

export default BusinessOverview;
