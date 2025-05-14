import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchActivityLogs, fetchActivityTypes } from '@/store/slices/activityLogSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import { formatDateToISO } from '@/utils/date.utils';

const ActivityLogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { activityLogs, activityTypes, isLoading, error, totalActivityLogs, totalPages, currentPage } = useSelector(
    (state: RootState) => state.activityLogs
  );
  
  const { users } = useSelector((state: RootState) => state.users);

  const [userFilter, setUserFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [startDate, setStartDate] = useState(
    formatDateToISO(new Date(new Date().setDate(new Date().getDate() - 7)))
  );
  const [endDate, setEndDate] = useState(formatDateToISO(new Date()));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchActivityTypes());
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    loadActivityLogs();
  }, [dispatch, currentPage]);

  const loadActivityLogs = (page = currentPage) => {
    dispatch(
      fetchActivityLogs({
        page,
        limit: 20,
        user: userFilter,
        activityType: activityTypeFilter,
        startDate,
        endDate,
        search: searchTerm,
      })
    );
  };

  const handleSearch = () => {
    loadActivityLogs(1);
  };

  const handlePageChange = (page: number) => {
    loadActivityLogs(page);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityTypeColor = (type: string) => {
    if (type.includes('create')) return 'text-green-600';
    if (type.includes('update')) return 'text-blue-600';
    if (type.includes('delete')) return 'text-red-600';
    if (type.includes('login') || type.includes('logout')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Activity Logs</h1>
        <Button variant="outline" onClick={() => navigate('/activity-logs/stats')}>
          View Statistics
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Activity Logs</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <div>
              <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <select
                id="userFilter"
                className="form-select"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="activityTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                id="activityTypeFilter"
                className="form-select"
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
              >
                <option value="">All Activities</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Description
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="search"
                  className="form-input rounded-l-md w-full"
                  placeholder="Search in description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="primary"
                  className="rounded-l-none"
                  onClick={handleSearch}
                  isLoading={isLoading}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setUserFilter('');
                  setActivityTypeFilter('');
                  setStartDate(formatDateToISO(new Date(new Date().setDate(new Date().getDate() - 7))));
                  setEndDate(formatDateToISO(new Date()));
                  setSearchTerm('');
                  dispatch(
                    fetchActivityLogs({
                      page: 1,
                      limit: 20,
                    })
                  );
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading activity logs...</p>
            </div>
          ) : activityLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof log.user === 'string' ? getUserName(log.user) : `${log.user.firstName} ${log.user.lastName}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getActivityTypeColor(log.activityType)}`}>
                          {log.activityType.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/activity-logs/${log.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No activity logs found.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogList;
