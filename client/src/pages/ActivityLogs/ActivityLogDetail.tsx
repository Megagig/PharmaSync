import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchActivityLogById, clearCurrentActivityLog } from '@/store/slices/activityLogSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const ActivityLogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentActivityLog, isLoading, error } = useSelector(
    (state: RootState) => state.activityLogs
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchActivityLogById(id));
    }

    return () => {
      dispatch(clearCurrentActivityLog());
    };
  }, [dispatch, id]);

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

  if (isLoading && !currentActivityLog) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading activity log details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (!currentActivityLog) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Activity log not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Activity Log Details</h1>
        <Button variant="outline" onClick={() => navigate('/activity-logs')}>
          Back to Activity Logs
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              <span className={`${getActivityTypeColor(currentActivityLog.activityType)}`}>
                {currentActivityLog.activityType.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
              </span>
            </h2>
            <p className="text-sm text-gray-500">
              {formatDateTime(currentActivityLog.timestamp)}
            </p>
          </div>

          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {typeof currentActivityLog.user === 'string' ? (
                    currentActivityLog.user
                  ) : (
                    `${currentActivityLog.user.firstName} ${currentActivityLog.user.lastName} (${currentActivityLog.user.email})`
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentActivityLog.description}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentActivityLog.ipAddress || 'Not recorded'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentActivityLog.userAgent || 'Not recorded'}
                </dd>
              </div>
              {currentActivityLog.details && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Details</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded-md overflow-auto max-h-96">
                      {JSON.stringify(currentActivityLog.details, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogDetail;
