import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchUserById } from '@/store/slices/userSlice';
import {
  fetchRoles,
  fetchUserRolesByUserId,
  assignRoleToUserByIds,
  removeRoleFromUserByIds,
  fetchUserPermissions,
} from '@/store/slices/roleSlice';
import {
  IRole,
  IUserRole,
  PermissionResource,
  PermissionAction,
} from '@/types/role.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Modal from '@/components/common/Modal/Modal';
import Alert from '@/components/common/Alert';
import Badge from '@/components/common/Badge/Badge';
import Avatar from '@/components/common/Avatar/Avatar';
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';

const UserRoles: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state: RootState) => state.users);
  const { roles, userRoles, userPermissions, isLoading, error } = useSelector(
    (state: RootState) => state.roles
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchRoles());
      dispatch(fetchUserRolesByUserId(id));
      dispatch(fetchUserPermissions(id));
    }
  }, [dispatch, id]);

  const handleAddRole = async () => {
    if (!id || !selectedRoleId) return;

    try {
      await dispatch(
        assignRoleToUserByIds({ userId: id, roleId: selectedRoleId })
      ).unwrap();

      setShowAddModal(false);
      setSelectedRoleId(null);
      dispatch(fetchUserRolesByUserId(id));
      setSuccessMessage('Role assigned successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleRemoveRole = async () => {
    if (!id || !selectedRoleId) return;

    try {
      await dispatch(
        removeRoleFromUserByIds({ userId: id, roleId: selectedRoleId })
      ).unwrap();

      setShowRemoveModal(false);
      setSelectedRoleId(null);
      dispatch(fetchUserRolesByUserId(id));
      setSuccessMessage('Role removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to remove role:', error);
    }
  };

  const confirmRemoveRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setShowRemoveModal(true);
  };

  const refreshPermissions = () => {
    if (id) {
      dispatch(fetchUserPermissions(id));
    }
  };

  const roleColumns = [
    {
      header: 'Role',
      accessor: 'role',
      cell: (userRole: IUserRole) => {
        const role = typeof userRole.role === 'object' ? userRole.role : null;
        return (
          <div>
            <div className="font-medium text-gray-900">{role?.name}</div>
            <div className="text-sm text-gray-500">{role?.type}</div>
          </div>
        );
      },
    },
    {
      header: 'Assigned By',
      accessor: 'assignedBy',
      cell: (userRole: IUserRole) => {
        const assignedBy =
          typeof userRole.assignedBy === 'object' ? userRole.assignedBy : null;
        return assignedBy ? (
          <div className="flex items-center">
            <Avatar
              src={assignedBy.profileImage}
              alt={`${assignedBy.firstName} ${assignedBy.lastName}`}
              size="xs"
            />
            <div className="ml-2">
              <div className="text-sm font-medium text-gray-900">
                {assignedBy.firstName} {assignedBy.lastName}
              </div>
              <div className="text-xs text-gray-500">{assignedBy.email}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">System</div>
        );
      },
    },
    {
      header: 'Assigned At',
      accessor: 'assignedAt',
      cell: (userRole: IUserRole) => (
        <div className="text-sm text-gray-500">
          {new Date(userRole.assignedAt).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (userRole: IUserRole) => {
        const role = typeof userRole.role === 'object' ? userRole.role : null;
        return (
          <div className="flex space-x-2">
            <Button
              variant="icon"
              onClick={() => confirmRemoveRole(role?.id || '')}
              title="Remove Role"
            >
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const availableRoles = roles.filter(
    (role) =>
      !userRoles.some((userRole) => {
        const userRoleObj =
          typeof userRole.role === 'object' ? userRole.role : null;
        return userRoleObj?.id === role.id;
      })
  );

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
        <div className="flex items-center space-x-4">
          <Button
            variant="icon"
            onClick={() => navigate(`/users/${id}`)}
            title="Back to User"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {currentUser
              ? `Roles for ${currentUser.firstName} ${currentUser.lastName}`
              : 'User Roles'}
          </h1>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            <FiShield className="h-4 w-4 mr-2" />
            {showPermissions ? 'Hide Permissions' : 'View Permissions'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {currentUser && (
        <Card>
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar
              src={currentUser.profileImage}
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              size="lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-gray-500">{currentUser.email}</p>
              <div className="mt-2 space-y-1">
                {currentUser.position && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Position:</span>{' '}
                    {currentUser.position}
                  </div>
                )}
                {currentUser.department && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span>{' '}
                    {currentUser.department}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  {currentUser.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Assigned Roles</h2>
          <Button
            variant="outline"
            onClick={() => dispatch(fetchUserRolesByUserId(id || ''))}
            title="Refresh"
            size="sm"
          >
            <FiRefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div>
          {isLoading && userRoles.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500 text-center">
                <p className="text-xl font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : userRoles.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-500">
                  No roles assigned
                </p>
                <p className="text-gray-500">
                  Assign roles to this user to grant permissions
                </p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => setShowAddModal(true)}
                >
                  Assign Role
                </Button>
              </div>
            </div>
          ) : (
            <Table columns={roleColumns} data={userRoles} />
          )}
        </div>
      </Card>

      {showPermissions && (
        <Card>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Effective Permissions
            </h2>
            <Button
              variant="outline"
              onClick={refreshPermissions}
              title="Refresh Permissions"
              size="sm"
            >
              <FiRefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            {isLoading && !userPermissions ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : !userPermissions ||
              Object.keys(groupedPermissions).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No permissions found for this user
                </p>
                <p className="text-sm text-gray-400">
                  Assign roles to grant permissions
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(
                  ([resource, actions]) => (
                    <div
                      key={resource}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
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
                  )
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Assign Role"
      >
        <div className="p-6">
          <div className="max-h-96 overflow-y-auto">
            {availableRoles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No available roles found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedRoleId === role.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-sm text-gray-500">{role.type}</div>
                        {role.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {role.description}
                          </div>
                        )}
                      </div>
                      <Badge color={role.isActive ? 'green' : 'red'}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRole}
              disabled={!selectedRoleId || isLoading}
              isLoading={isLoading}
            >
              Assign Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Role Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Role"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to remove this role from the user? This may
            affect the user's permissions and access to certain features.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveRole}
              isLoading={isLoading}
            >
              Remove Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserRoles;
