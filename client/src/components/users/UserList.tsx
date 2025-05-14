import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchUsers, deleteUser } from '@/store/slices/userSlice';
import { User, UserRole } from '@/types/user.types';
import { RoleType } from '@/types/role.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import Avatar from '@/components/common/Avatar/Avatar';
import { FiEdit, FiTrash2, FiKey, FiRefreshCw, FiUserPlus } from 'react-icons/fi';

const UserList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { users, isLoading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.users
  );
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  
  useEffect(() => {
    loadUsers();
  }, [dispatch, currentPage, filterRole, filterActive]);
  
  const loadUsers = (page = 1) => {
    const params: any = { page, limit: 10 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (filterRole) {
      params.roleType = filterRole;
    }
    
    if (filterActive !== undefined) {
      params.isActive = filterActive;
    }
    
    dispatch(fetchUsers(params));
  };
  
  const handleSearch = () => {
    loadUsers(1);
  };
  
  const handlePageChange = (page: number) => {
    loadUsers(page);
  };
  
  const handleDelete = () => {
    if (selectedUserId) {
      dispatch(deleteUser(selectedUserId))
        .unwrap()
        .then(() => {
          setShowDeleteModal(false);
          setSelectedUserId(null);
          loadUsers(currentPage);
        })
        .catch((error) => {
          console.error('Failed to delete user:', error);
        });
    }
  };
  
  const confirmDelete = (id: string) => {
    setSelectedUserId(id);
    setShowDeleteModal(true);
  };
  
  const getRoleBadgeColor = (role?: UserRole | string) => {
    if (!role) return 'gray';
    
    switch (role) {
      case UserRole.ADMIN:
      case RoleType.ADMIN:
      case RoleType.SUPER_ADMIN:
        return 'red';
      case UserRole.PHARMACIST:
      case RoleType.PHARMACIST:
        return 'green';
      case UserRole.TECHNICIAN:
      case RoleType.PHARMACY_TECHNICIAN:
        return 'blue';
      case RoleType.CASHIER:
        return 'purple';
      case RoleType.INVENTORY_MANAGER:
        return 'indigo';
      case UserRole.STAFF:
      case RoleType.STAFF:
        return 'gray';
      case RoleType.PATIENT:
        return 'teal';
      default:
        return 'gray';
    }
  };
  
  const columns = [
    {
      header: 'User',
      accessor: 'name',
      cell: (user: User) => (
        <div className="flex items-center">
          <Avatar
            src={user.profileImage}
            alt={`${user.firstName} ${user.lastName}`}
            size="sm"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (user: User) => (
        <div className="space-y-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge
                key={role.id}
                color={getRoleBadgeColor(role.type)}
                className="mr-1"
              >
                {role.name}
              </Badge>
            ))
          ) : user.role ? (
            <Badge color={getRoleBadgeColor(user.role)}>
              {user.role}
            </Badge>
          ) : (
            <Badge color="gray">No Role</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Position',
      accessor: 'position',
      cell: (user: User) => (
        <div className="text-sm text-gray-500">
          {user.position || '-'}
          {user.department && <div>{user.department}</div>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (user: User) => (
        <div className="space-y-1">
          <Badge color={user.isActive ? 'green' : 'red'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {user.isEmailVerified !== undefined && (
            <Badge color={user.isEmailVerified ? 'blue' : 'yellow'} className="ml-1">
              {user.isEmailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="icon"
            onClick={() => navigate(`/users/${user.id}`)}
            title="Edit User"
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            onClick={() => navigate(`/users/${user.id}/roles`)}
            title="Manage Roles"
          >
            <FiKey className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            onClick={() => confirmDelete(user.id)}
            title="Delete User"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: RoleType.SUPER_ADMIN, label: 'Super Admin' },
    { value: RoleType.ADMIN, label: 'Admin' },
    { value: RoleType.PHARMACIST, label: 'Pharmacist' },
    { value: RoleType.PHARMACY_TECHNICIAN, label: 'Pharmacy Technician' },
    { value: RoleType.CASHIER, label: 'Cashier' },
    { value: RoleType.INVENTORY_MANAGER, label: 'Inventory Manager' },
    { value: RoleType.STAFF, label: 'Staff' },
    { value: RoleType.PATIENT, label: 'Patient' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/users/new')}
        >
          <FiUserPlus className="h-4 w-4 mr-2" />
          Create New User
        </Button>
      </div>
      
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                value={filterActive === undefined ? '' : filterActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setFilterActive(undefined);
                  } else {
                    setFilterActive(e.target.value === 'active');
                  }
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button
                variant="outline"
                onClick={() => loadUsers(1)}
                title="Refresh"
              >
                <FiRefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          {isLoading && users.length === 0 ? (
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
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-500">No users found</p>
                <p className="text-gray-500">Create a new user to get started</p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/users/new')}
                >
                  Create New User
                </Button>
              </div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={users}
              onRowClick={(user) => navigate(`/users/${user.id}`)}
            />
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
