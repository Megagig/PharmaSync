import { useAuth } from '@/context/AuthContext';
import Card from '@/components/common/Card/Card';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data for dashboard
  const stats = [
    {
      name: 'Total Patients',
      value: '1,234',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      name: 'Active Prescriptions',
      value: '567',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      name: 'Medications',
      value: '892',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      name: 'Dispensed Today',
      value: '45',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'patient',
      name: 'John Doe',
      action: 'New patient registered',
      time: '10 minutes ago',
    },
    {
      id: 2,
      type: 'prescription',
      name: 'Sarah Johnson',
      action: 'Prescription filled',
      time: '30 minutes ago',
    },
    {
      id: 3,
      type: 'medication',
      name: 'Paracetamol',
      action: 'Stock updated',
      time: '1 hour ago',
    },
    {
      id: 4,
      type: 'patient',
      name: 'Michael Smith',
      action: 'Patient counseled',
      time: '2 hours ago',
    },
    {
      id: 5,
      type: 'prescription',
      name: 'Emma Wilson',
      action: 'New prescription added',
      time: '3 hours ago',
    },
  ];

  // Mock data for expiring medications matching the screenshot
  const expiringMedications = [
    { id: 1, name: 'Amoxicillin 500mg', stock: 120, expiry: '2023-12-30' },
    { id: 2, name: 'Lisinopril 10mg', stock: 85, expiry: '2023-12-15' },
    { id: 3, name: 'Metformin 850mg', stock: 200, expiry: '2024-01-05' },
    { id: 4, name: 'Atorvastatin 20mg', stock: 150, expiry: '2024-01-10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={stat.icon}
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                        <span className="text-sm font-medium leading-none text-primary-800">
                          {activity.name.charAt(0)}
                        </span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.action}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <a
              href="#view-all"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View all
            </a>
          </div>
        </Card>

        {/* Expiring Medications */}
        <Card title="Expiring Medications">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    MEDICATION
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    STOCK
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    EXPIRY DATE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiringMedications.map((medication) => (
                  <tr key={medication.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medication.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(medication.expiry).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <a
              href="#view-inventory"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View inventory
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
