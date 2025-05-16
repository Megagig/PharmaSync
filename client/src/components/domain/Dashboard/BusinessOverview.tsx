import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import { DateRange } from './DateRangeFilter';

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

const KPICard: React.FC<KPICardProps> = ({ title, value, change, isPositive, icon, onClick }) => {
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
            <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

const BusinessOverview: React.FC<BusinessOverviewProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  const { stats, isLoading } = useSelector((state: RootState) => state.dashboard);

  if (isLoading || !stats) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Business Overview</h2>
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

  // Placeholder data - in a real implementation, this would come from the API
  const kpiData = {
    totalRevenue: '₦1,250,000',
    revenueChange: '12%',
    totalPatients: stats.totalPatients || 0,
    newPatients: '15',
    inventoryValue: '₦3,450,000',
    lowStockItems: '8',
    pendingPrescriptions: '12',
    completedPrescriptions: '45',
  };

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Business Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={kpiData.totalRevenue}
            change={kpiData.revenueChange}
            isPositive={true}
            icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
            onClick={() => navigate('/reports/financial')}
          />
          <KPICard
            title="Total Patients"
            value={kpiData.totalPatients}
            change={kpiData.newPatients}
            isPositive={true}
            icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>}
            onClick={() => navigate('/patients')}
          />
          <KPICard
            title="Inventory Value"
            value={kpiData.inventoryValue}
            change={kpiData.lowStockItems}
            isPositive={false}
            icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>}
            onClick={() => navigate('/inventory')}
          />
          <KPICard
            title="Prescriptions"
            value={kpiData.completedPrescriptions}
            change={kpiData.pendingPrescriptions}
            isPositive={true}
            icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>}
            onClick={() => navigate('/prescriptions')}
          />
        </div>
      </div>
    </Card>
  );
};

export default BusinessOverview;
