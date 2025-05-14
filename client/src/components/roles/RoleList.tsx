import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchRoles, deleteRoleById } from '@/store/slices/roleSlice';
import { IRole, RoleType } from '@/types/role.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { FiEdit, FiTrash2, FiUsers, FiRefreshCw } from 'react-icons/fi';

const RoleList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { roles, isLoading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.roles
  );
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  
  useEffect(() => {
    loadRoles();
  }, [dispatch, currentPage, filterType, filterActive]);
  
  const loadRoles = (page = 1) => {
    const params: any = { page, limit: 10 };
    
    if (searchTerm) {
      params.name = searchTerm;
    }
    
    if (filterType) {
      params.type = filterType;
    }
    
    if (filterActive !== '') {
      params.isActive = filterActive === 'active';
    }
    
    dispatch(fetchRoles(params));
  };
  
  const handleSearch = () => {
    loadRoles(1);
  };
  
  const handlePageChange = (page: number) => {
    loadRoles(page);
  };
  
  const handleDelete = () => {
    if (selectedRoleId) {
      dispatch(deleteRoleById(selectedRoleId))
        .unwrap()
        .then(() => {
          setShowDeleteModal(false);
          setSelectedRoleId(null);
          loadRoles(currentPage);
        })
        .catch((error) => {
          console.error('Failed to delete role:', error);
        });
    }
  };
  
  const confirmDelete = (id: string) => {
    setSelectedRoleId(id);
    setShowDeleteModal(true);
  };
  
  const getRoleTypeBadgeColor = (type: RoleType) => {
    switch (type) {
      case RoleType.SUPER_ADMIN:
        return 'red';
      case RoleType.ADMIN:
        return 'orange';
      case RoleType.PHARMACIST:
        return 'green';
      case RoleType.PHARMACY_TECHNICIAN:
        return 'blue';
      case RoleType.CASHIER:
        return 'purple';
      case RoleType.INVENTORY_MANAGER:
        return 'indigo';
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
      header: 'Name',
      accessor: 'name',
      cell: (role: IRole) => (
        <div>
          <div className="font-medium text-gray-900">{role.name}</div>
          {role.description && (
            <div className="text-sm text-gray-500">{role.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (role: IRole) => (
        <Badge color={getRoleTypeBadgeColor(role.type)}>
          {role.type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Permissions',
      accessor: 'permissions',
      cell: (role: IRole) => (
        <div className="text-sm text-gray-500">
          {role.permissions.length} permissions
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (role: IRole) => (
        <Badge color={role.isActive ? 'green' : 'red'}>
          {role.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Default',
      accessor: 'isDefault',
      cell: (role: IRole) => (
        <Badge color={role.isDefault ? 'blue' : 'gray'}>
          {role.isDefault ? 'Default' : 'Custom'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (role: IRole) => (
        <div className="flex space-x-2">
          <Button
            variant="icon"
            onClick={() => navigate(`/roles/${role.id}`)}
            title="Edit Role"
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            onClick={() => navigate(`/roles/${role.id}/users`)}
            title="Manage Users"
          >
            <FiUsers className="h-4 w-4" />
          </Button>
          <Button
            variant="icon"
            onClick={() => confirmDelete(role.id)}
            title="Delete Role"
            disabled={role.isDefault}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/roles/new')}
        >
          Create New Role
        </Button>
      </div>
      
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {Object.values(RoleType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button
                variant="outline"
                onClick={() => loadRoles(1)}
                title="Refresh"
              >
                <FiRefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          {isLoading && roles.length === 0 ? (
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
          ) : roles.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-500">No roles found</p>
                <p className="text-gray-500">Create a new role to get started</p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/roles/new')}
                >
                  Create New Role
                </Button>
              </div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={roles}
              onRowClick={(role) => navigate(`/roles/${role.id}`)}
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
        title="Delete Role"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this role? This action cannot be undone.</p>
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

export default RoleList;
