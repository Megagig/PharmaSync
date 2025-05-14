import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const ReportsDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Sales Reports */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Sales Reports</h2>
              <svg
                className="h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              View sales data, revenue trends, payment methods, and top-selling medications.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/reports/sales')}
                className="w-full"
              >
                View Sales Reports
              </Button>
            </div>
          </div>
        </Card>

        {/* Inventory Reports */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Inventory Reports</h2>
              <svg
                className="h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Analyze inventory levels, stock categories, expiry data, and inventory turnover.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/reports/inventory')}
                className="w-full"
              >
                View Inventory Reports
              </Button>
            </div>
          </div>
        </Card>

        {/* Prescription Reports */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Prescription Reports</h2>
              <svg
                className="h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Track prescription trends, status breakdowns, and most prescribed medications.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/reports/prescriptions')}
                className="w-full"
              >
                View Prescription Reports
              </Button>
            </div>
          </div>
        </Card>

        {/* Patient Reports */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Patient Reports</h2>
              <svg
                className="h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Analyze patient demographics, medical conditions, allergies, and prescription patterns.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/reports/patients')}
                className="w-full"
              >
                View Patient Reports
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Tips for Reports</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Sales Reports:</strong> Use date filters to analyze sales trends over specific
                periods. Export data for further analysis in spreadsheet software.
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Inventory Reports:</strong> Monitor low stock items and expiring medications
                regularly. Use turnover data to optimize purchasing decisions.
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Prescription Reports:</strong> Track prescription patterns to identify
                seasonal trends and most commonly prescribed medications.
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Patient Reports:</strong> Use demographic data to tailor services and
                educational materials to your patient population.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
