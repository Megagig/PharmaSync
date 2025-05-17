import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const ReportList: React.FC = () => {
  const reportCategories: ReportCategory[] = [
    {
      id: 'patients',
      title: 'Patient Reports',
      description: 'Generate reports on patient demographics, medication history, clinical assessments, and more.',
      icon: (
        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: '/reports/patients',
    },
    {
      id: 'medications',
      title: 'Medication Reports',
      description: 'Generate reports on medication usage, inventory levels, expiring medications, and more.',
      icon: (
        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      path: '/reports/medications',
    },
    {
      id: 'inventory',
      title: 'Inventory Reports',
      description: 'Generate reports on inventory levels, stock movements, purchase orders, and more.',
      icon: (
        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      path: '/reports/inventory',
    },
    {
      id: 'sales',
      title: 'Sales Reports',
      description: 'Generate reports on sales, revenue, profit margins, and more.',
      icon: (
        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/reports/sales',
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      description: 'Generate reports on expenses, budgets, profit and loss, and more.',
      icon: (
        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/reports/financial',
    },
    {
      id: 'custom',
      title: 'Custom Reports',
      description: 'Create and save custom reports based on your specific needs.',
      icon: (
        <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      path: '/reports/custom',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <Button variant="primary" as={Link} to="/reports/custom/new">
          Create Custom Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <Link to={category.path} className="block p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  {category.icon}
                </div>
                <h2 className="ml-4 text-lg font-medium text-gray-900">{category.title}</h2>
              </div>
              <p className="text-sm text-gray-500">{category.description}</p>
            </Link>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h2>
          <p className="text-sm text-gray-500 italic">No recent reports found. Generate a report to see it here.</p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Reports</h2>
          <p className="text-sm text-gray-500 italic">No scheduled reports found. Schedule a report to see it here.</p>
          <div className="mt-4">
            <Button variant="outline" as={Link} to="/reports/schedule">
              Schedule a Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportList;
