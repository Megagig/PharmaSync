import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserProfilePassword,
} from '@/store/slices/userSlice';
import { fetchMyActivityLogs } from '@/store/slices/activityLogSlice';
import { UserProfileUpdateData, PasswordChangeData } from '@/types/user.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { currentUser, isLoading: userLoading, error: userError } = useSelector(
    (state: RootState) => state.users
  );
  const { activityLogs, isLoading: logsLoading, error: logsError } = useSelector(
    (state: RootState) => state.activityLogs
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileUpdateData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
    },
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchMyActivityLogs({ page: 1, limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phoneNumber: currentUser.phoneNumber || '',
        address: {
          street: currentUser.address?.street || '',
          city: currentUser.address?.city || '',
          state: currentUser.address?.state || '',
          postalCode: currentUser.address?.postalCode || '',
          country: currentUser.address?.country || 'Nigeria',
        },
        emergencyContact: {
          name: currentUser.emergencyContact?.name || '',
          relationship: currentUser.emergencyContact?.relationship || '',
          phoneNumber: currentUser.emergencyContact?.phoneNumber || '',
        },
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserProfileUpdateData],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile(formData));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(changeUserProfilePassword(passwordData));
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
      });
      setConfirmPassword('');
      
      // Close modal after a delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password. Please check your current password.');
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
        <p className="text-gray-500">Loading profile...</p>
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
        <p className="text-gray-500">User profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit} isLoading={userLoading}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
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
                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
              >
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </span>

              <div className="mt-4 w-full text-left">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">Last Login</span>
                    <span className="text-gray-900">{formatDateTime(currentUser.lastLogin)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">Account Created</span>
                    <span className="text-gray-900">{formatDate(currentUser.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Edit Profile' : 'Profile Information'}
            </h2>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-input"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="form-input"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="form-input"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.street"
                        name="address.street"
                        className="form-input"
                        value={formData.address?.street}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        className="form-input"
                        value={formData.address?.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        className="form-input"
                        value={formData.address?.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.postalCode"
                        name="address.postalCode"
                        className="form-input"
                        value={formData.address?.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        className="form-input"
                        value={formData.address?.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="emergencyContact.name"
                        name="emergencyContact.name"
                        className="form-input"
                        value={formData.emergencyContact?.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700">
                      Relationship
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="emergencyContact.relationship"
                        name="emergencyContact.relationship"
                        className="form-input"
                        value={formData.emergencyContact?.relationship}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="emergencyContact.phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="emergencyContact.phoneNumber"
                        name="emergencyContact.phoneNumber"
                        className="form-input"
                        value={formData.emergencyContact?.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
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
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentUser.address?.street ? (
                        <>
                          {currentUser.address.street}
                          <br />
                          {currentUser.address.city && `${currentUser.address.city}, `}
                          {currentUser.address.state && `${currentUser.address.state} `}
                          {currentUser.address.postalCode && `${currentUser.address.postalCode}`}
                          <br />
                          {currentUser.address.country}
                        </>
                      ) : (
                        'Not set'
                      )}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Emergency contact</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentUser.emergencyContact?.name ? (
                        <>
                          {currentUser.emergencyContact.name}
                          {currentUser.emergencyContact.relationship && ` (${currentUser.emergencyContact.relationship})`}
                          <br />
                          {currentUser.emergencyContact.phoneNumber}
                        </>
                      ) : (
                        'Not set'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="lg:col-span-3">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <Button
                variant="outline"
                onClick={() => navigate('/activity-logs/me')}
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

          {passwordSuccess && (
            <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-md">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="form-input mt-1"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-input mt-1"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
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
                name="confirmPassword"
                className="form-input mt-1"
                value={confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={userLoading}>
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
