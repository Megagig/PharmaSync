import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Pagination from '@/components/common/Pagination/Pagination';
import Modal from '@/components/common/Modal/Modal';
import Badge from '@/components/common/Badge/Badge';
import axiosInstance from '@/api/axios.config';
import { ApprovalStatus, UserRole } from '@/types/auth.types';

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  licenseNumber?: string;
  createdAt: string;
  approvalStatus: ApprovalStatus;
}

const PendingUsers: React.FC = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, [currentPage]);

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/pending-users?page=${currentPage}&limit=10`
      );
      setPendingUsers(response.data.data.users);
      setTotalPages(response.data.data.pages);
      setTotalUsers(response.data.data.total);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to fetch pending users');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApproveClick = (user: PendingUser) => {
    setSelectedUser(user);
    setShowApproveModal(true);
  };

  const handleRejectClick = (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await axiosInstance.patch(`/admin/approve-user/${selectedUser.id}`);
      toast.success(
        `User ${selectedUser.firstName} ${selectedUser.lastName} has been approved`
      );
      setShowApproveModal(false);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await axiosInstance.patch(`/admin/reject-user/${selectedUser.id}`, {
        reason: rejectionReason,
      });
      toast.success(
        `User ${selectedUser.firstName} ${selectedUser.lastName} has been rejected`
      );
      setShowRejectModal(false);
      setRejectionReason('');
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'red';
      case UserRole.PHARMACIST:
        return 'blue';
      case UserRole.TECHNICIAN:
        return 'green';
      case UserRole.STAFF:
        return 'gray';
      case UserRole.PATIENT:
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Pending User Approvals
        </h1>
        <Button variant="outline" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {totalUsers} Pending {totalUsers === 1 ? 'User' : 'Users'}
            </h2>
          </div>

          {isLoading && pendingUsers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : pendingUsers.length > 0 ? (
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
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.role === UserRole.PHARMACIST &&
                          user.licenseNumber && (
                            <div className="text-xs text-gray-500">
                              License: {user.licenseNumber}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.phoneNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="success"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleApproveClick(user)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectClick(user)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No pending users found.</p>
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

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve User"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to approve{' '}
            <span className="font-medium">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </span>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={confirmApprove}
              isLoading={isLoading}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to reject{' '}
            <span className="font-medium">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </span>
            ?
          </p>
          <div className="mb-4">
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason (optional)
            </label>
            <textarea
              id="rejectionReason"
              rows={3}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejection"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmReject}
              isLoading={isLoading}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingUsers;
