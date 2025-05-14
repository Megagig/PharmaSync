import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchUserById,
  createUser,
  updateUser,
  clearCurrentUser,
} from '@/store/slices/userSlice';
import { UserRole, Permission, UserFormData } from '@/types/user.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isLoading, error } = useSelector((state: RootState) => state.users);

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.STAFF,
    permissions: [],
    phoneNumber: '',
    licenseNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
    },
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
    },
    position: '',
    department: '',
    hireDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchUserById(id));
    }

    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentUser && isEditMode) {
      setFormData({
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        role: currentUser.role,
        permissions: currentUser.permissions,
        phoneNumber: currentUser.phoneNumber || '',
        licenseNumber: currentUser.licenseNumber || '',
        address: {
          street: currentUser.address?.street || '',
          city: currentUser.address?.city || '',
          state: currentUser.address?.state || '',
          postalCode: currentUser.address?.postalCode || '',
          country: currentUser.address?.country || 'Nigeria',
        },
        dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
        emergencyContact: {
          name: currentUser.emergencyContact?.name || '',
          relationship: currentUser.emergencyContact?.relationship || '',
          phoneNumber: currentUser.emergencyContact?.phoneNumber || '',
        },
        position: currentUser.position || '',
        department: currentUser.department || '',
        hireDate: currentUser.hireDate ? new Date(currentUser.hireDate).toISOString().split('T')[0] : '',
        isActive: currentUser.isActive,
      });
    }
  }, [currentUser, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserFormData],
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePermissionChange = (permission: Permission) => {
    setFormData((prev) => {
      const permissions = prev.permissions || [];
      if (permissions.includes(permission)) {
        return {
          ...prev,
          permissions: permissions.filter((p) => p !== permission),
        };
      } else {
        return {
          ...prev,
          permissions: [...permissions, permission],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && id) {
        const updateData = { ...formData };
        delete updateData.email; // Email cannot be changed
        delete updateData.password; // Password is changed separately
        
        await dispatch(updateUser({ id, updateData }));
      } else {
        await dispatch(createUser(formData));
      }
      
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const permissionGroups = [
    {
      name: 'Patient Permissions',
      permissions: [
        Permission.VIEW_PATIENTS,
        Permission.CREATE_PATIENTS,
        Permission.EDIT_PATIENTS,
      ],
    },
    {
      name: 'Medication Permissions',
      permissions: [
        Permission.VIEW_MEDICATIONS,
        Permission.CREATE_MEDICATIONS,
        Permission.EDIT_MEDICATIONS,
      ],
    },
    {
      name: 'Prescription Permissions',
      permissions: [
        Permission.VIEW_PRESCRIPTIONS,
        Permission.CREATE_PRESCRIPTIONS,
        Permission.EDIT_PRESCRIPTIONS,
      ],
    },
    {
      name: 'Dispensing Permissions',
      permissions: [
        Permission.VIEW_DISPENSING,
        Permission.CREATE_DISPENSING,
        Permission.EDIT_DISPENSING,
      ],
    },
    {
      name: 'Inventory Permissions',
      permissions: [Permission.VIEW_INVENTORY, Permission.MANAGE_INVENTORY],
    },
    {
      name: 'Supplier Permissions',
      permissions: [Permission.VIEW_SUPPLIERS, Permission.MANAGE_SUPPLIERS],
    },
    {
      name: 'Purchase Order Permissions',
      permissions: [
        Permission.VIEW_PURCHASE_ORDERS,
        Permission.CREATE_PURCHASE_ORDERS,
        Permission.EDIT_PURCHASE_ORDERS,
        Permission.APPROVE_PURCHASE_ORDERS,
      ],
    },
    {
      name: 'Report Permissions',
      permissions: [Permission.VIEW_REPORTS],
    },
    {
      name: 'User Management Permissions',
      permissions: [
        Permission.VIEW_USERS,
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.MANAGE_ROLES,
      ],
    },
    {
      name: 'Schedule Permissions',
      permissions: [Permission.VIEW_SCHEDULE, Permission.MANAGE_SCHEDULE],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit User' : 'Create New User'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Basic Information */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                <div className="mt-1 border-t border-gray-200 pt-4"></div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
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
                  Last Name *
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

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isEditMode}
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditMode}
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <div className="sm:col-span-3">
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

              <div className="sm:col-span-3">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role and Permissions */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900">Role and Permissions</h2>
                <div className="mt-1 border-t border-gray-200 pt-4"></div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role *
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    {Object.values(UserRole).map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.isActive}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissionGroups.map((group) => (
                    <div key={group.name} className="border rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">{group.name}</h3>
                      <div className="space-y-2">
                        {group.permissions.map((permission) => (
                          <div key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              id={permission}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={(formData.permissions || []).includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                            />
                            <label htmlFor={permission} className="ml-2 block text-sm text-gray-900">
                              {permission.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Information */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900">Professional Information</h2>
                <div className="mt-1 border-t border-gray-200 pt-4"></div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="position"
                    name="position"
                    className="form-input"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    className="form-input"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700">
                  Hire Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="hireDate"
                    name="hireDate"
                    className="form-input"
                    value={formData.hireDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default UserForm;
