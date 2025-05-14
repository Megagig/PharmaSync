import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchUserById,
  createUser,
  updateUser,
  changeUserPassword,
} from '@/store/slices/userSlice';
import { fetchRoles } from '@/store/slices/roleSlice';
import {
  User,
  UserFormData,
  UserRole,
  UserAddress,
  EmergencyContact,
  UserSettings,
} from '@/types/user.types';
import { IRole } from '@/types/role.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Textarea from '@/components/common/Textarea/Textarea';
import Select from '@/components/common/Select/Select';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import Modal from '@/components/common/Modal/Modal';
import Alert from '@/components/common/Alert/Alert';
import Tabs from '@/components/common/Tabs/Tabs';
import Avatar from '@/components/common/Avatar/Avatar';
import { FiSave, FiArrowLeft, FiKey, FiUser, FiMapPin, FiPhone, FiSettings } from 'react-icons/fi';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentUser, isLoading, error } = useSelector(
    (state: RootState) => state.users
  );
  
  const { roles } = useSelector((state: RootState) => state.roles);
  
  const isNewUser = id === 'new';
  
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.STAFF,
    roles: [],
    phoneNumber: '',
    licenseNumber: '',
    address: {},
    dateOfBirth: '',
    emergencyContact: {},
    position: '',
    department: '',
    hireDate: '',
    isActive: true,
    isEmailVerified: false,
  });
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    dispatch(fetchRoles());
    
    if (!isNewUser && id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id, isNewUser]);
  
  useEffect(() => {
    if (currentUser && !isNewUser) {
      setFormData({
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        role: currentUser.role,
        roles: currentUser.roles?.map(role => role.id) || [],
        phoneNumber: currentUser.phoneNumber || '',
        licenseNumber: currentUser.licenseNumber || '',
        address: currentUser.address || {},
        dateOfBirth: currentUser.dateOfBirth || '',
        emergencyContact: currentUser.emergencyContact || {},
        position: currentUser.position || '',
        department: currentUser.department || '',
        hireDate: currentUser.hireDate || '',
        isActive: currentUser.isActive,
        isEmailVerified: currentUser.isEmailVerified,
        twoFactorEnabled: currentUser.twoFactorEnabled,
        settings: currentUser.settings,
      });
    }
  }, [currentUser, isNewUser]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
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
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, roles: selectedRoles }));
  };
  
  const validateForm = () => {
    if (isNewUser && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (isNewUser && !password) {
      setPasswordError('Password is required');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isNewUser) {
        const userData = { ...formData, password };
        await dispatch(createUser(userData)).unwrap();
        navigate('/users');
      } else if (id) {
        await dispatch(updateUser({ id, updateData: formData })).unwrap();
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };
  
  const handleChangePassword = async () => {
    if (!id || !newPassword) return;
    
    try {
      await dispatch(
        changeUserPassword({ id, password: newPassword })
      ).unwrap();
      
      setShowPasswordModal(false);
      setNewPassword('');
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };
  
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FiUser /> },
    { id: 'contact', label: 'Contact', icon: <FiPhone /> },
    { id: 'address', label: 'Address', icon: <FiMapPin /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];
  
  const roleOptions = roles.map((role: IRole) => ({
    value: role.id,
    label: role.name,
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="icon"
            onClick={() => navigate('/users')}
            title="Back to Users"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNewUser ? 'Create New User' : `Edit User: ${currentUser?.firstName} ${currentUser?.lastName}`}
          </h1>
        </div>
        
        {!isNewUser && (
          <Button
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
            disabled={isLoading}
          >
            <FiKey className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        )}
      </div>
      
      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          {!isNewUser && currentUser && (
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
              {activeTab === 'basic' && (
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!isNewUser}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roles
                      </label>
                      <select
                        multiple
                        className="form-multiselect w-full"
                        value={formData.roles}
                        onChange={handleRoleChange}
                      >
                        {roleOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Hold Ctrl (or Cmd) to select multiple roles
                      </p>
                    </div>
                    
                    {isNewUser && (
                      <>
                        <Input
                          label="Password"
                          type="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        
                        <Input
                          label="Confirm Password"
                          type="password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          error={passwordError}
                        />
                      </>
                    )}
                    
                    <Input
                      label="Position"
                      name="position"
                      value={formData.position || ''}
                      onChange={handleInputChange}
                    />
                    
                    <Input
                      label="Department"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleInputChange}
                    />
                    
                    <Input
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber || ''}
                      onChange={handleInputChange}
                    />
                    
                    <Input
                      label="Hire Date"
                      type="date"
                      name="hireDate"
                      value={formData.hireDate || ''}
                      onChange={handleInputChange}
                    />
                    
                    <div className="md:col-span-2 flex items-center space-x-6">
                      <Checkbox
                        label="Active"
                        name="isActive"
                        checked={formData.isActive || false}
                        onChange={handleCheckboxChange}
                      />
                      
                      <Checkbox
                        label="Email Verified"
                        name="isEmailVerified"
                        checked={formData.isEmailVerified || false}
                        onChange={handleCheckboxChange}
                      />
                      
                      <Checkbox
                        label="Two-Factor Authentication"
                        name="twoFactorEnabled"
                        checked={formData.twoFactorEnabled || false}
                        onChange={handleCheckboxChange}
                        disabled={!formData.isEmailVerified}
                      />
                    </div>
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
                    
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
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
                        <Checkbox
                          label="Email Notifications"
                          checked={formData.settings?.notifications?.email || false}
                          onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
                        />
                        
                        <Checkbox
                          label="In-App Notifications"
                          checked={formData.settings?.notifications?.inApp || false}
                          onChange={(e) => handleSettingsChange('notifications', 'inApp', e.target.checked)}
                        />
                        
                        <Checkbox
                          label="SMS Notifications"
                          checked={formData.settings?.notifications?.sms || false}
                          onChange={(e) => handleSettingsChange('notifications', 'sms', e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/users')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              <FiSave className="h-4 w-4 mr-2" />
              {isNewUser ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
      
      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="p-6">
          <div className="mb-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={!newPassword || isLoading}
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

export default UserDetail;
