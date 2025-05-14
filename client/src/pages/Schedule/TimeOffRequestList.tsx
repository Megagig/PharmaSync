import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffRequestStatus,
  deleteTimeOffRequest,
} from '@/store/slices/scheduleSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Pagination from '@/components/common/Pagination/Pagination';
import { TimeOffRequestFormData } from '@/types/schedule.types';

const TimeOffRequestList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { timeOffRequests, isLoading, error, totalTimeOffRequests, totalTimeOffRequestPages, currentTimeOffRequestPage } = useSelector(
    (state: RootState) => state.schedule
  );
  
  const { users } = useSelector((state: RootState) => state.users);
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'pharmacist';

  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [formData, setFormData] = useState<TimeOffRequestFormData>({
    startDate: '',
    endDate: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    loadTimeOffRequests();
  }, [dispatch, currentTimeOffRequestPage, userFilter, statusFilter]);

  const loadTimeOffRequests = (page = currentTimeOffRequestPage) => {
    dispatch(
      fetchTimeOffRequests({
        page,
        limit: 10,
        user: userFilter,
        status: statusFilter,
      })
    );
  };

  const handlePageChange = (page: number) => {
    loadTimeOffRequests(page);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(createTimeOffRequest(formData));
      setShowNewRequestModal(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        notes: '',
      });
      loadTimeOffRequests();
    } catch (error) {
      console.error('Error creating time off request:', error);
    }
  };

  const handleApprove = async () => {
    if (selectedRequestId) {
      await dispatch(
        updateTimeOffRequestStatus({
          id: selectedRequestId,
          updateData: {
            status: 'approved',
            notes,
          },
        })
      );
      setShowApproveModal(false);
      setSelectedRequestId(null);
      setNotes('');
      loadTimeOffRequests();
    }
  };

  const handleReject = async () => {
    if (selectedRequestId) {
      await dispatch(
        updateTimeOffRequestStatus({
          id: selectedRequestId,
          updateData: {
            status: 'rejected',
            notes,
          },
        })
      );
      setShowRejectModal(false);
      setSelectedRequestId(null);
      setNotes('');
      loadTimeOffRequests();
    }
  };

  const handleDelete = async () => {
    if (selectedRequestId) {
      await dispatch(deleteTimeOffRequest(selectedRequestId));
      setShowDeleteModal(false);
      setSelectedRequestId(null);
      loadTimeOffRequests();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const canManageRequest = (request: any) => {
    if (isAdmin) return true;
    return typeof request.user === 'string'
      ? request.user === currentUser?.id
      : request.user.id === currentUser?.id;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Time Off Requests</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/schedule')}>
            Back to Schedule
          </Button>
          <Button variant="primary" onClick={() => setShowNewRequestModal(true)}>
            New Request
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {isAdmin && (
              <div>
                <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member
                </label>
                <select
                  id="userFilter"
                  className="form-select"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="">All Staff</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
              <p className="text-gray-500">Loading time off requests...</p>
            </div>
          ) : timeOffRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Member
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeOffRequests.map((request) => (
                    <tr key={request.id}>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof request.user === 'string'
                            ? getUserName(request.user)
                            : `${request.user.firstName} ${request.user.lastName}`}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequestId(request.id);
                                setShowApproveModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequestId(request.id);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'pending' && canManageRequest(request) && (
                          <button
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No time off requests found.</p>
            </div>
          )}

          {totalTimeOffRequestPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentTimeOffRequestPage}
                totalPages={totalTimeOffRequestPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        title="New Time Off Request"
      >
        <div className="p-6">
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input mt-1"
                value={formData.startDate}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input mt-1"
                value={formData.endDate}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason *
              </label>
              <input
                type="text"
                id="reason"
                name="reason"
                className="form-input mt-1"
                value={formData.reason}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="form-textarea mt-1"
                value={formData.notes}
                onChange={handleFormChange}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={() => setShowNewRequestModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isLoading}>
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Time Off Request"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to approve this time off request?</p>
          <div>
            <label htmlFor="approveNotes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="approveNotes"
              rows={3}
              className="form-textarea mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApprove} isLoading={isLoading}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Time Off Request"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to reject this time off request?</p>
          <div>
            <label htmlFor="rejectNotes" className="block text-sm font-medium text-gray-700">
              Reason for Rejection
            </label>
            <textarea
              id="rejectNotes"
              rows={3}
              className="form-textarea mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={isLoading}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Time Off Request"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this time off request? This action cannot be undone.</p>
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

export default TimeOffRequestList;
