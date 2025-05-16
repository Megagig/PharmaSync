import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { classNames } from '@/utils/style.utils';

const ReportsModule: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const reportCategories = [
    {
      name: 'Patient Reports',
      description: 'Patient demographics, clinical outcomes, and care metrics',
      path: '/reports/patient'
    },
    {
      name: 'Medication Reports',
      description: 'Medication usage, prescriptions, and dispensing analytics',
      path: '/reports/medication'
    },
    {
      name: 'Inventory Reports',
      description: 'Stock levels, valuations, expiry tracking, and movements',
      path: '/reports/inventory'
    },
    {
      name: 'Sales Reports',
      description: 'Sales performance, revenue analysis, and transaction metrics',
      path: '/reports/sales'
    },
    {
      name: 'Financial Reports',
      description: 'Financial statements, accounting metrics, and budget analysis',
      path: '/reports/financial'
    },
    {
      name: 'Administrative Reports',
      description: 'User activity, system usage, and operational metrics',
      path: '/reports/administrative'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports Module</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports/configurations')}
          >
            Saved Reports
          </Button>
          <Button variant="primary" onClick={() => navigate('/reports/new')}>
            Create Custom Report
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Access comprehensive reports and analytics across all aspects of your pharmacy operations.
            Select a report category below or create custom reports to gain insights into your business.
          </p>

          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {reportCategories.map((category) => (
                <Tab
                  key={category.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white shadow text-primary-700'
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary-600'
                    )
                  }
                >
                  {category.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-6">
              {reportCategories.map((category, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                  )}
                >
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                         onClick={() => navigate(category.path)}>
                      <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </Card>

      {/* Quick Access Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" 
               onClick={() => navigate('/reports/patient/demographics')}>
            <h3 className="text-lg font-medium text-gray-900">Patient Demographics</h3>
            <p className="text-gray-600 mt-1">Age distribution, gender breakdown, and patient trends</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => navigate('/reports/inventory/valuation')}>
            <h3 className="text-lg font-medium text-gray-900">Inventory Valuation</h3>
            <p className="text-gray-600 mt-1">Current stock value, product distribution, and inventory health</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => navigate('/reports/sales/performance')}>
            <h3 className="text-lg font-medium text-gray-900">Sales Performance</h3>
            <p className="text-gray-600 mt-1">Revenue trends, top-selling products, and sales analysis</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => navigate('/reports/medication/usage')}>
            <h3 className="text-lg font-medium text-gray-900">Medication Usage</h3>
            <p className="text-gray-600 mt-1">Prescription patterns, dispensing trends, and medication analytics</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => navigate('/reports/financial/summary')}>
            <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
            <p className="text-gray-600 mt-1">Profit & loss, revenue breakdown, and financial metrics</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => navigate('/reports/administrative/activity')}>
            <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
            <p className="text-gray-600 mt-1">Staff performance, system usage, and operational metrics</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsModule;
