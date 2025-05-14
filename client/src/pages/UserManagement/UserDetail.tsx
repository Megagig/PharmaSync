import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchUserById, changeUserPassword, clearCurrentUser } from '@/store/slices/userSlice';
import { fetchUserActivityLogs } from '@/store/slices/activityLogSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentUser, isLoading: userLoading, error: userError } = useSelector(
    (state: RootState) => state.users
  );
  
  const { activityLogs, isLoading: logsLoading, error: logsError } = useSelector(
    (state: RootState) => state.activityLogs
  );

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchUserActivityLogs({ userId: id, page: 1, limit: 5 }));
    }

    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, id]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      if (id) {
        await dispatch(changeUserPassword({ id, password: newPassword }));
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'pharmacist':
        return 'bg-blue-100 text-blue-800';
      case 'technician':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeColor = (type: string) => {
    if (type.includes('create')) return 'text-green-600';
    if (type.includes('update')) return 'text-blue-600';
    if (type.includes('delete')) return 'text-red-600';
    if (type.includes('login') || type.includes('logout')) return 'text-purple-600';
    return 'text-gray-600';
  };

  if (userLoading && !currentUser) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        {userError}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/users')}>
            Back to Users
          </Button>
          <Button variant="primary" onClick={() => navigate(`/users/${id}/edit`)}>
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              {currentUser.profileImage ? (
                <img
                  className="h-24 w-24 rounded-full mb-4"
                  src={currentUser.profileImage}
                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-500 font-medium">
                    {currentUser.firstName.charAt(0)}
                    {currentUser.lastName.charAt(0)}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-sm text-gray-500 mb-2">{currentUser.email}</p>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(
                  currentUser.role
                )}`}
              >
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>
              <span
                className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  currentUser.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {currentUser.isActive ? 'Active' : 'Inactive'}
              </span>

              <div className="mt-4 w-full">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* User Details Card */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Information</h2>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.firstName} {currentUser.lastName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.phoneNumber || 'Not set'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.position || 'Not set'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.department || 'Not set'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">License number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.licenseNumber || 'Not set'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date of birth</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.dateOfBirth ? formatDate(currentUser.dateOfBirth) : 'Not set'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Hire date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.hireDate ? formatDate(currentUser.hireDate) : 'Not set'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last login</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser.lastLogin ? formatDateTime(currentUser.lastLogin) : 'Never'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        {/* Permissions Card */}
        <Card className="lg:col-span-3">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUser.permissions.map((permission) => (
                <div
                  key={permission}
                  className="bg-gray-50 px-4 py-2 rounded-md text-sm text-gray-900"
                >
                  {permission.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="lg:col-span-3">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <Button
                variant="outline"
                onClick={() => navigate(`/activity-logs/user/${id}`)}
                size="sm"
              >
                View All Activity
              </Button>
            </div>

            {logsError && (
              <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md mb-4">
                {logsError}
              </div>
            )}

            {logsLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading activity logs...</p>
              </div>
            ) : activityLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityLogs.map((log) => (
                      <tr key={log.id}>
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
          </div>
        </Card>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="p-6">
          {passwordError && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="form-input mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input mt-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePasswordChange} isLoading={userLoading}>
              Change Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetail;
