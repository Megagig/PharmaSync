import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchFinancialPeriodById,
  deleteFinancialPeriod,
  closeFinancialPeriod,
  lockFinancialPeriod,
} from '@/store/slices/accountingSlice';
import { FinancialPeriodStatus } from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const FinancialPeriodDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentFinancialPeriod, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchFinancialPeriodById(id) as any);
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteFinancialPeriod(id!) as any);
      showToast('Financial period deleted successfully', 'success');
      navigate('/accounting/financial-periods');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const handleClose = async () => {
    try {
      await dispatch(closeFinancialPeriod(id!) as any);
      showToast('Financial period closed successfully', 'success');
      setShowCloseModal(false);
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const handleLock = async () => {
    try {
      await dispatch(lockFinancialPeriod(id!) as any);
      showToast('Financial period locked successfully', 'success');
      setShowLockModal(false);
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const getStatusBadge = (status: FinancialPeriodStatus) => {
    switch (status) {
      case FinancialPeriodStatus.OPEN:
        return <Badge color="green">{status}</Badge>;
      case FinancialPeriodStatus.CLOSED:
        return <Badge color="yellow">{status}</Badge>;
      case FinancialPeriodStatus.LOCKED:
        return <Badge color="red">{status}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (isLoading && !currentFinancialPeriod) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error && !currentFinancialPeriod) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentFinancialPeriod) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Financial period not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Period Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/accounting/financial-periods')}
          >
            Back to Financial Periods
          </Button>
          {currentFinancialPeriod.status === FinancialPeriodStatus.OPEN && (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/accounting/financial-periods/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="warning"
                onClick={() => setShowCloseModal(true)}
              >
                Close Period
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </>
          )}
          {currentFinancialPeriod.status === FinancialPeriodStatus.CLOSED && (
            <Button
              variant="danger"
              onClick={() => setShowLockModal(true)}
            >
              Lock Period
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Period Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{currentFinancialPeriod.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">
                  {formatDate(currentFinancialPeriod.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">
                  {formatDate(currentFinancialPeriod.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {getStatusBadge(currentFinancialPeriod.status)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Fiscal Year</p>
                <p className="font-medium">
                  {currentFinancialPeriod.isFiscalYear ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">
                  {currentFinancialPeriod.notes || 'No notes provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">
                  {typeof currentFinancialPeriod.createdBy === 'object'
                    ? `${currentFinancialPeriod.createdBy.firstName} ${currentFinancialPeriod.createdBy.lastName}`
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {formatDate(currentFinancialPeriod.createdAt)}
                </p>
              </div>
              {currentFinancialPeriod.status !== FinancialPeriodStatus.OPEN && (
                <div>
                  <p className="text-sm text-gray-500">Closed By</p>
                  <p className="font-medium">
                    {typeof currentFinancialPeriod.closedBy === 'object' && currentFinancialPeriod.closedBy
                      ? `${currentFinancialPeriod.closedBy.firstName} ${currentFinancialPeriod.closedBy.lastName}`
                      : 'Unknown'}
                  </p>
                </div>
              )}
              {currentFinancialPeriod.status !== FinancialPeriodStatus.OPEN && (
                <div>
                  <p className="text-sm text-gray-500">Closed At</p>
                  <p className="font-medium">
                    {currentFinancialPeriod.closedAt
                      ? formatDate(currentFinancialPeriod.closedAt)
                      : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Financial Period"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete this financial period? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Financial Period"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to close this financial period? This will prevent further transactions from being posted to this period. You can still view reports for closed periods.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCloseModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleClose}
              isLoading={isLoading}
            >
              Close Period
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lock Modal */}
      <Modal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        title="Lock Financial Period"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to lock this financial period? This will permanently prevent any changes to transactions in this period. This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowLockModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLock}
              isLoading={isLoading}
            >
              Lock Period
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancialPeriodDetail;
