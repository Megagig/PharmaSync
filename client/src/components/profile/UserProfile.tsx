import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserProfilePassword,
} from '@/store/slices/userSlice';
import { fetchUserPermissions } from '@/store/slices/roleSlice';
import { UserProfileUpdateData, UserSettings } from '@/types/user.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Tabs from '@/components/common/Tabs/Tabs';
import Alert from '@/components/common/Alert/Alert';
import Avatar from '@/components/common/Avatar/Avatar';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import { FiSave, FiUser, FiMapPin, FiPhone, FiSettings, FiKey, FiShield } from 'react-icons/fi';

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  
  const { currentUser, isLoading, error } = useSelector(
    (state: RootState) => state.users
  );
  
  const { userPermissions } = useSelector((state: RootState) => state.roles);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<UserProfileUpdateData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: {},
    dateOfBirth: '',
    emergencyContact: {},
    settings: {},
  });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    dispatch(fetchUserProfile());
    if (currentUser?.id) {
      dispatch(fetchUserPermissions(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || {},
        dateOfBirth: currentUser.dateOfBirth || '',
        emergencyContact: currentUser.emergencyContact || {},
        settings: currentUser.settings || {},
      });
    }
  }, [currentUser]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };
  
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value },
    }));
  };
  
  const handleSettingsChange = (
    section: string,
    name: string,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const settings = { ...prev.settings } || {};
      
      if (section) {
        settings[section] = { ...settings[section], [name]: value };
      } else {
        settings[name] = value;
      }
      
      return { ...prev, settings };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const validatePasswordForm = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (!currentPassword || !newPassword) {
      setPasswordError('All fields are required');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    try {
      await dispatch(
        changeUserProfilePassword({
          currentPassword,
          newPassword,
        })
      ).unwrap();
      
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError('Current password is incorrect');
    }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'contact', label: 'Contact', icon: <FiPhone /> },
    { id: 'address', label: 'Address', icon: <FiMapPin /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
    { id: 'security', label: 'Security', icon: <FiKey /> },
    { id: 'permissions', label: 'Permissions', icon: <FiShield /> },
  ];
  
  const groupPermissionsByResource = () => {
    if (!userPermissions) return {};
    
    const grouped: Record<string, string[]> = {};
    
    userPermissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      
      permission.actions.forEach((action) => {
        if (!grouped[permission.resource].includes(action)) {
          grouped[permission.resource].push(action);
        }
      });
    });
    
    return grouped;
  };
  
  const groupedPermissions = groupPermissionsByResource();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        
        {activeTab !== 'permissions' && (
          <Button
            type="submit"
            form="profile-form"
            variant="primary"
            isLoading={isLoading}
          >
            <FiSave className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>
      
      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      
      {currentUser && (
        <Card>
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar
              src={currentUser.profileImage}
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-gray-500">{currentUser.email}</p>
              <div className="mt-2 space-y-1">
                {currentUser.role && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Role:</span> {currentUser.role}
                  </div>
                )}
                {currentUser.position && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Position:</span> {currentUser.position}
                  </div>
                )}
                {currentUser.department && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span> {currentUser.department}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  {currentUser.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Email Verification:</span>{' '}
                  {currentUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">2FA:</span>{' '}
                  {currentUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Last Login:</span>{' '}
                  {currentUser.lastLogin
                    ? new Date(currentUser.lastLogin).toLocaleString()
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      <Card>
        <div className="border-b">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        
        <div className="p-6">
          {activeTab !== 'permissions' ? (
            <form id="profile-form" onSubmit={handleSubmit}>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      helpText="Email cannot be changed"
                    />
                    
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                    />
                    
                    <div className="md:col-span-2">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Name"
                          name="name"
                          value={formData.emergencyContact?.name || ''}
                          onChange={handleEmergencyContactChange}
                        />
                        
                        <Input
                          label="Relationship"
                          name="relationship"
                          value={formData.emergencyContact?.relationship || ''}
                          onChange={handleEmergencyContactChange}
                        />
                        
                        <Input
                          label="Phone Number"
                          name="phoneNumber"
                          value={formData.emergencyContact?.phoneNumber || ''}
                          onChange={handleEmergencyContactChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'address' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Address Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Street"
                      name="street"
                      value={formData.address?.street || ''}
                      onChange={handleAddressChange}
                    />
                    
                    <Input
                      label="City"
                      name="city"
                      value={formData.address?.city || ''}
                      onChange={handleAddressChange}
                    />
                    
                    <Input
                      label="State/Province"
                      name="state"
                      value={formData.address?.state || ''}
                      onChange={handleAddressChange}
                    />
                    
                    <Input
                      label="Postal Code"
                      name="postalCode"
                      value={formData.address?.postalCode || ''}
                      onChange={handleAddressChange}
                    />
                    
                    <Input
                      label="Country"
                      name="country"
                      value={formData.address?.country || ''}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">User Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                      </label>
                      <select
                        className="form-select w-full"
                        value={formData.settings?.theme || 'system'}
                        onChange={(e) => handleSettingsChange('', 'theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        className="form-select w-full"
                        value={formData.settings?.language || 'en'}
                        onChange={(e) => handleSettingsChange('', 'language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Notification Preferences</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="email-notifications"
                            className="form-checkbox h-4 w-4 text-primary-600"
                            checked={formData.settings?.notifications?.email || false}
                            onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
                          />
                          <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-700">
                            Email Notifications
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="inapp-notifications"
                            className="form-checkbox h-4 w-4 text-primary-600"
                            checked={formData.settings?.notifications?.inApp || false}
                            onChange={(e) => handleSettingsChange('notifications', 'inApp', e.target.checked)}
                          />
                          <label htmlFor="inapp-notifications" className="ml-2 text-sm text-gray-700">
                            In-App Notifications
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="sms-notifications"
                            className="form-checkbox h-4 w-4 text-primary-600"
                            checked={formData.settings?.notifications?.sms || false}
                            onChange={(e) => handleSettingsChange('notifications', 'sms', e.target.checked)}
                          />
                          <label htmlFor="sms-notifications" className="ml-2 text-sm text-gray-700">
                            SMS Notifications
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">Password</h3>
                          <p className="text-sm text-gray-500">
                            Change your account password
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowPasswordModal(true)}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-gray-500">
                            {currentUser?.twoFactorEnabled
                              ? 'Two-factor authentication is enabled'
                              : 'Add an extra layer of security to your account'}
                          </p>
                        </div>
                        <Button
                          variant={currentUser?.twoFactorEnabled ? 'danger' : 'outline'}
                          disabled={!currentUser?.isEmailVerified}
                        >
                          {currentUser?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </Button>
                      </div>
                      {!currentUser?.isEmailVerified && (
                        <p className="mt-2 text-xs text-red-500">
                          You need to verify your email address before enabling 2FA
                        </p>
                      )}
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">Email Verification</h3>
                          <p className="text-sm text-gray-500">
                            {currentUser?.isEmailVerified
                              ? 'Your email is verified'
                              : 'Verify your email address'}
                          </p>
                        </div>
                        {!currentUser?.isEmailVerified && (
                          <Button variant="outline">
                            Verify Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Your Permissions</h2>
              
              {isLoading && !userPermissions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : !userPermissions || Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No permissions found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, actions]) => (
                    <div key={resource} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        {resource.replace('_', ' ')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <Badge key={action} color="blue">
                            {action.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      
      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="p-6">
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={passwordError}
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
              isLoading={isLoading}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
