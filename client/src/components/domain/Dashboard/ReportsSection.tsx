import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { DateRange } from './DateRangeFilter';

interface ReportsSectionProps {
  dateRange: DateRange;
}

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, path }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(path)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-md font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

const ReportsSection: React.FC<ReportsSectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  
  const reports = [
    {
      title: 'Patient Reports',
      description: 'Demographics, outcomes, and patient care analytics',
      icon: <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>,
      path: '/reports/patients',
    },
    {
      title: 'Medication Reports',
      description: 'Usage patterns, prescriptions, and dispensing analytics',
      icon: <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      path: '/reports/medications',
    },
    {
      title: 'Sales Reports',
      description: 'Revenue, transactions, and payment method analytics',
      icon: <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      path: '/reports/sales',
    },
    {
      title: 'Inventory Reports',
      description: 'Stock levels, valuation, and movement analytics',
      icon: <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      path: '/reports/inventory',
    },
    {
      title: 'Financial Reports',
      description: 'Profit & loss, balance sheet, and cash flow analytics',
      icon: <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      path: '/reports/financial',
    },
    {
      title: 'Custom Reports',
      description: 'Create and customize your own reports',
      icon: <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      path: '/reports/custom',
    },
  ];

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">Reports & Analytics</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/reporting')}
          >
            View All Reports
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report, index) => (
            <ReportCard
              key={index}
              title={report.title}
              description={report.description}
              icon={report.icon}
              path={report.path}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ReportsSection;
