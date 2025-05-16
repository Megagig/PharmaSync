import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchRoleById,
  updateRoleById,
  createNewRole,
  resetRolePermissionsById,
  clearCurrentRole,
} from '@/store/slices/roleSlice';
import {
  IRole,
  IRoleCreate,
  IRoleUpdate,
  RoleType,
  IPermission,
  PermissionResource,
  PermissionAction,
  createPermission,
} from '@/types/role.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Textarea from '@/components/common/Textarea/Textarea';
import Select from '@/components/common/Select/Select';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import Modal from '@/components/common/Modal/Modal';
import Alert from '@/components/common/Alert';
import { FiSave, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const RoleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentRole, isLoading, error } = useSelector(
    (state: RootState) => state.roles
  );

  const isNewRole = id === 'new';

  const [formData, setFormData] = useState<IRoleCreate | IRoleUpdate>({
    name: '',
    type: RoleType.STAFF,
    description: '',
    permissions: [],
    isActive: true,
    isDefault: false,
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isNewRole && id) {
      dispatch(fetchRoleById(id));
    }

    return () => {
      dispatch(clearCurrentRole());
    };
  }, [dispatch, id, isNewRole]);

  useEffect(() => {
    if (currentRole && !isNewRole) {
      setFormData({
        name: currentRole.name,
        type: currentRole.type,
        description: currentRole.description || '',
        permissions: currentRole.permissions,
        isActive: currentRole.isActive,
        isDefault: currentRole.isDefault,
      });
    }
  }, [currentRole, isNewRole]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePermissionChange = (
    resource: PermissionResource,
    action: PermissionAction,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const permissions = [...prev.permissions];
      const resourceIndex = permissions.findIndex(
        (p) => p.resource === resource
      );

      if (resourceIndex === -1 && checked) {
        // Add new resource with this action
        permissions.push({
          resource,
          actions: [action],
        });
      } else if (resourceIndex !== -1) {
        // Resource exists, update actions
        const actions = [...permissions[resourceIndex].actions];

        if (checked && !actions.includes(action)) {
          actions.push(action);
        } else if (!checked && actions.includes(action)) {
          const actionIndex = actions.indexOf(action);
          actions.splice(actionIndex, 1);
        }

        if (actions.length === 0) {
          // Remove resource if no actions
          permissions.splice(resourceIndex, 1);
        } else {
          permissions[resourceIndex] = {
            ...permissions[resourceIndex],
            actions,
          };
        }
      }

      return { ...prev, permissions };
    });
  };

  const hasPermission = (
    resource: PermissionResource,
    action: PermissionAction
  ): boolean => {
    const permission = formData.permissions.find(
      (p) => p.resource === resource
    );
    return permission ? permission.actions.includes(action) : false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isNewRole) {
        await dispatch(createNewRole(formData as IRoleCreate)).unwrap();
        navigate('/roles');
      } else if (id) {
        await dispatch(updateRoleById({ id, data: formData })).unwrap();
        setSuccessMessage('Role updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const handleResetPermissions = async () => {
    if (id) {
      try {
        await dispatch(resetRolePermissionsById(id)).unwrap();
        setShowResetModal(false);
        setSuccessMessage('Permissions reset to default');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Failed to reset permissions:', error);
      }
    }
  };

  const permissionGroups = [
    {
      title: 'User Management',
      resources: [PermissionResource.USERS, PermissionResource.ROLES],
    },
    {
      title: 'Patient Management',
      resources: [PermissionResource.PATIENTS],
    },
    {
      title: 'Medication Management',
      resources: [PermissionResource.MEDICATIONS, PermissionResource.INVENTORY],
    },
    {
      title: 'Prescription Management',
      resources: [
        PermissionResource.PRESCRIPTIONS,
        PermissionResource.DISPENSINGS,
      ],
    },
    {
      title: 'Inventory Management',
      resources: [
        PermissionResource.INVENTORY,
        PermissionResource.SUPPLIERS,
        PermissionResource.PURCHASE_ORDERS,
      ],
    },
    {
      title: 'Reporting',
      resources: [PermissionResource.REPORTS, PermissionResource.ACTIVITY_LOGS],
    },
    {
      title: 'System',
      resources: [
        PermissionResource.SETTINGS,
        PermissionResource.NOTIFICATIONS,
        PermissionResource.MESSAGES,
        PermissionResource.SCHEDULE,
      ],
    },
  ];

  const permissionActions = [
    { value: PermissionAction.READ, label: 'View' },
    { value: PermissionAction.CREATE, label: 'Create' },
    { value: PermissionAction.UPDATE, label: 'Edit' },
    { value: PermissionAction.DELETE, label: 'Delete' },
    { value: PermissionAction.MANAGE, label: 'Manage' },
    { value: PermissionAction.EXPORT, label: 'Export' },
    { value: PermissionAction.IMPORT, label: 'Import' },
    { value: PermissionAction.APPROVE, label: 'Approve' },
    { value: PermissionAction.REJECT, label: 'Reject' },
    { value: PermissionAction.ASSIGN, label: 'Assign' },
  ];

  const roleTypeOptions = Object.values(RoleType).map((type) => ({
    value: type,
    label: type.replace('_', ' '),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="icon"
            onClick={() => navigate('/roles')}
            title="Back to Roles"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNewRole ? 'Create New Role' : `Edit Role: ${currentRole?.name}`}
          </h1>
        </div>

        {!isNewRole && (
          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            disabled={isLoading}
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Reset Permissions
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Role Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Role Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <Select
                  label="Role Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  options={roleTypeOptions}
                  required
                  disabled={!isNewRole}
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Checkbox
                    label="Active"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleCheckboxChange}
                  />

                  <Checkbox
                    label="Default Role"
                    name="isDefault"
                    checked={formData.isDefault || false}
                    onChange={handleCheckboxChange}
                    disabled={!isNewRole && currentRole?.isDefault}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Permissions</h2>

              <div className="space-y-8">
                {permissionGroups.map((group) => (
                  <div key={group.title} className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">
                      {group.title}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Resource
                            </th>
                            {permissionActions.map((action) => (
                              <th
                                key={action.value}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {action.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.resources.map((resource) => (
                            <tr key={resource}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {resource.replace('_', ' ')}
                              </td>
                              {permissionActions.map((action) => (
                                <td
                                  key={action.value}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                  <Checkbox
                                    checked={hasPermission(
                                      resource,
                                      action.value
                                    )}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        resource,
                                        action.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/roles')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              <FiSave className="h-4 w-4 mr-2" />
              {isNewRole ? 'Create Role' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>

      {/* Reset Permissions Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Permissions"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to reset this role's permissions to default?
            This will remove all custom permissions and cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleResetPermissions}
              isLoading={isLoading}
            >
              Reset Permissions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleDetail;
