import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchRoleById,
  fetchRoleUsers,
  assignUserToRole,
  removeUserFromRole,
} from '@/store/slices/roleSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import { User } from '@/types/user.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Modal from '@/components/common/Modal/Modal';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import Alert from '@/components/common/Alert/Alert';
import Avatar from '@/components/common/Avatar/Avatar';
import { FiUserPlus, FiUserMinus, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const RoleUsers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentRole, isLoading, error } = useSelector(
    (state: RootState) => state.roles
  );
  
  const { users } = useSelector((state: RootState) => state.users);
  
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (id) {
      dispatch(fetchRoleById(id));
      loadRoleUsers(1);
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (showAddModal) {
      dispatch(fetchUsers({ page: 1, limit: 100 }));
    }
  }, [dispatch, showAddModal]);
  
  const loadRoleUsers = async (page: number) => {
    if (!id) return;
    
    try {
      const response = await dispatch(
        fetchRoleUsers({ id, params: { page, limit: 10 } })
      ).unwrap();
      
      setRoleUsers(response.data);
      setTotalPages(response.meta.pages);
      setCurrentPage(response.meta.page);
    } catch (error) {
      console.error('Failed to load role users:', error);
    }
  };
  
  const handlePageChange = (page: number) => {
    loadRoleUsers(page);
  };
  
  const handleAddUser = async () => {
    if (!id || !selectedUserId) return;
    
    try {
      await dispatch(
        assignUserToRole({ id, userId: selectedUserId })
      ).unwrap();
      
      setShowAddModal(false);
      setSelectedUserId(null);
      loadRoleUsers(currentPage);
      setSuccessMessage('User added to role successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add user to role:', error);
    }
  };
  
  const handleRemoveUser = async () => {
    if (!id || !selectedUserId) return;
    
    try {
      await dispatch(
        removeUserFromRole({ id, userId: selectedUserId })
      ).unwrap();
      
      setShowRemoveModal(false);
      setSelectedUserId(null);
      loadRoleUsers(currentPage);
      setSuccessMessage('User removed from role successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to remove user from role:', error);
    }
  };
  
  const confirmRemoveUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowRemoveModal(true);
  };
  
  const userColumns = [
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
        <div className="text-sm text-gray-500">
          {user.role}
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      cell: (user: User) => (
        <div className="text-sm text-gray-500">
          {user.department || '-'}
        </div>
      ),
    },
    {
      header: 'Position',
      accessor: 'position',
      cell: (user: User) => (
        <div className="text-sm text-gray-500">
          {user.position || '-'}
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
            onClick={() => confirmRemoveUser(user.id)}
            title="Remove from Role"
          >
            <FiUserMinus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  const availableUsers = users.filter(
    (user) => !roleUsers.some((roleUser) => roleUser.id === user.id)
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="icon"
            onClick={() => navigate(`/roles/${id}`)}
            title="Back to Role"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {currentRole ? `Users with ${currentRole.name} Role` : 'Role Users'}
          </h1>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          <FiUserPlus className="h-4 w-4 mr-2" />
          Add User to Role
        </Button>
      </div>
      
      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => loadRoleUsers(1)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => loadRoleUsers(1)}
              title="Refresh"
            >
              <FiRefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          {isLoading && roleUsers.length === 0 ? (
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
          ) : roleUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-500">No users found</p>
                <p className="text-gray-500">Add users to this role to get started</p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => setShowAddModal(true)}
                >
                  Add User to Role
                </Button>
              </div>
            </div>
          ) : (
            <Table
              columns={userColumns}
              data={roleUsers}
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
      
      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add User to Role"
      >
        <div className="p-6">
          <div className="mb-4">
            <SearchInput
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No available users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableUsers
                  .filter((user) =>
                    `${user.firstName} ${user.lastName} ${user.email}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedUserId === user.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
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
                          {user.role && (
                            <div className="text-xs text-gray-500">
                              {user.role}
                              {user.department && ` - ${user.department}`}
                            </div>
                          )}
                        </div>
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
              onClick={handleAddUser}
              disabled={!selectedUserId || isLoading}
              isLoading={isLoading}
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Remove User Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove User from Role"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to remove this user from the role? This action can be undone by adding the user back to the role.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveUser}
              isLoading={isLoading}
            >
              Remove User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleUsers;
