import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchUsers, deleteUser } from '@/store/slices/userSlice';
import { UserRole } from '@/types/user.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import Modal from '@/components/common/Modal/Modal';

const UserList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, isLoading, error, totalUsers, totalPages, currentPage } =
    useSelector((state: RootState) => state.users);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [dispatch, currentPage, roleFilter, activeFilter]);

  const loadUsers = (page = currentPage) => {
    dispatch(
      fetchUsers({
        page,
        limit: 10,
        isActive: activeFilter,
        role: roleFilter,
        search: searchTerm,
      })
    );
  };

  const handleSearch = () => {
    loadUsers(1);
  };

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.PHARMACIST:
        return 'bg-blue-100 text-blue-800';
      case UserRole.TECHNICIAN:
        return 'bg-green-100 text-green-800';
      case UserRole.STAFF:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/users/pending')}
          >
            Pending Approvals
          </Button>
          <Button variant="primary" onClick={() => navigate('/users/new')}>
            Add New User
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="search"
                  className="form-input rounded-l-md w-full"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="primary"
                  className="rounded-l-none"
                  onClick={handleSearch}
                  isLoading={isLoading}
                >
                  Search
                </Button>
              </div>
            </div>

            <div>
              <label
                htmlFor="roleFilter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="roleFilter"
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="activeFilter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="activeFilter"
                className="form-select"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={user.profileImage}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-500 font-medium">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.phoneNumber || 'No phone number'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to deactivate this user? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isLoading}
            >
              Deactivate User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
