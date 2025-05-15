import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import PatientStatistics from '@/components/domain/Dashboard/PatientStatistics';
import MedicationStatistics from '@/components/domain/Dashboard/MedicationStatistics';
import DrugTherapyProblemStatistics from '@/components/domain/Dashboard/DrugTherapyProblemStatistics';
import DateRangeFilter, {
  DateRange,
} from '@/components/domain/Dashboard/DateRangeFilter';
import ExportDashboard from '@/components/domain/Dashboard/ExportDashboard';
import Card from '@/components/common/Card/Card';
import { formatDate, formatDateToISO } from '@/utils/date.utils';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Get current date
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  // Get upcoming follow-ups
  const upcomingFollowUps = stats?.upcomingFollowUps || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Welcome, {user?.name || 'Pharmacist'}
        </h2>
        <p className="text-gray-600">
          This dashboard provides an overview of your patient data and key
          statistics to help you manage your pharmaceutical care services
          effectively.
        </p>
      </div>

      <DateRangeFilter onRangeChange={handleDateRangeChange} />

      <ExportDashboard dateRange={dateRange} />

      <PatientStatistics />

      {/* Medication Statistics */}
      <MedicationStatistics />

      {/* Drug Therapy Problem Statistics */}
      <DrugTherapyProblemStatistics />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upcoming Follow-ups
            </h3>
            {upcomingFollowUps.length === 0 ? (
              <p className="text-gray-500">No upcoming follow-ups scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingFollowUps.map((followUp, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {followUp.patientName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(new Date(followUp.date))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              followUp.type === 'Care Plan'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {followUp.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activities
            </h3>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats.recentActivities.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== stats.recentActivities.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                activity.type === 'patient_added'
                                  ? 'bg-blue-500'
                                  : activity.type === 'medication_added'
                                  ? 'bg-green-500'
                                  : activity.type === 'assessment_added'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                              }`}
                            >
                              <svg
                                className="h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                {activity.type === 'patient_added' ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                  />
                                ) : activity.type === 'medication_added' ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                )}
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.description}{' '}
                                <span className="font-medium text-gray-900">
                                  {activity.patientName}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(new Date(activity.date))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">No recent activities.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
