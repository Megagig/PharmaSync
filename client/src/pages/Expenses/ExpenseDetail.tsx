import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchExpenseById,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  markExpenseAsPaid,
} from '@/store/slices/expenseSlice';
import { ExpenseStatus, PaymentMethod } from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import TextArea from '@/components/common/TextArea/TextArea';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentExpense, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentData, setPaymentData] = useState({
    paymentMethod: PaymentMethod.CASH,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentReference: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchExpenseById(id));
    }
  }, [dispatch, id]);

  const handleDelete = () => {
    if (id) {
      dispatch(deleteExpense(id))
        .unwrap()
        .then(() => {
          showToast('Expense deleted successfully', 'success');
          navigate('/expenses');
        })
        .catch((err) => {
          showToast(err || 'Failed to delete expense', 'error');
        });
    }
  };

  const handleApprove = () => {
    if (id) {
      dispatch(approveExpense(id))
        .unwrap()
        .then(() => {
          showToast('Expense approved successfully', 'success');
        })
        .catch((err) => {
          showToast(err || 'Failed to approve expense', 'error');
        });
    }
  };

  const handleReject = () => {
    if (id && rejectionReason) {
      dispatch(rejectExpense({ id, rejectionReason }))
        .unwrap()
        .then(() => {
          showToast('Expense rejected successfully', 'success');
          setIsRejectModalOpen(false);
        })
        .catch((err) => {
          showToast(err || 'Failed to reject expense', 'error');
        });
    }
  };

  const handlePay = () => {
    if (id) {
      dispatch(markExpenseAsPaid({ id, paymentData }))
        .unwrap()
        .then(() => {
          showToast('Expense marked as paid successfully', 'success');
          setIsPayModalOpen(false);
        })
        .catch((err) => {
          showToast(err || 'Failed to mark expense as paid', 'error');
        });
    }
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.PENDING:
        return <Badge color="yellow" text="Pending" />;
      case ExpenseStatus.APPROVED:
        return <Badge color="blue" text="Approved" />;
      case ExpenseStatus.PAID:
        return <Badge color="green" text="Paid" />;
      case ExpenseStatus.REJECTED:
        return <Badge color="red" text="Rejected" />;
      case ExpenseStatus.CANCELLED:
        return <Badge color="gray" text="Cancelled" />;
      default:
        return <Badge color="gray" text={status} />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-4 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !currentExpense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="mt-2">{error || 'Failed to load expense details'}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/expenses')}
            >
              Back to Expenses
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Expense: {currentExpense.expenseNumber}
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/expenses')}
          >
            Back to List
          </Button>
          {currentExpense.status === ExpenseStatus.PENDING && (
            <>
              <Button
                variant="primary"
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => setIsRejectModalOpen(true)}
              >
                Reject
              </Button>
            </>
          )}
          {currentExpense.status === ExpenseStatus.APPROVED && (
            <Button
              variant="success"
              onClick={() => setIsPayModalOpen(true)}
            >
              Mark as Paid
            </Button>
          )}
          {currentExpense.status === ExpenseStatus.PENDING && (
            <Button
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Expense Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{currentExpense.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div>{getStatusBadge(currentExpense.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium capitalize">
                  {currentExpense.category.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subcategory</p>
                <p className="font-medium">
                  {currentExpense.subcategory || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-lg">
                  {formatCurrency(currentExpense.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(currentExpense.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">
                  {currentExpense.dueDate
                    ? formatDate(currentExpense.dueDate)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">
                  {typeof currentExpense.supplier === 'object' &&
                  currentExpense.supplier
                    ? currentExpense.supplier.name
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {typeof currentExpense.location === 'object' &&
                  currentExpense.location
                    ? currentExpense.location.name
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recurring</p>
                <p className="font-medium">
                  {currentExpense.isRecurring ? 'Yes' : 'No'}
                </p>
              </div>
              {currentExpense.isRecurring && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Recurrence Interval</p>
                    <p className="font-medium capitalize">
                      {currentExpense.recurrenceInterval?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recurrence End Date</p>
                    <p className="font-medium">
                      {currentExpense.recurrenceEndDate
                        ? formatDate(currentExpense.recurrenceEndDate)
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {currentExpense.description && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="font-medium">{currentExpense.description}</p>
              </div>
            )}

            {currentExpense.notes && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="font-medium">{currentExpense.notes}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            {currentExpense.status === ExpenseStatus.PAID ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {currentExpense.paymentMethod?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">
                    {currentExpense.paymentDate
                      ? formatDate(currentExpense.paymentDate)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Reference</p>
                  <p className="font-medium">
                    {currentExpense.paymentReference || 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {currentExpense.status === ExpenseStatus.APPROVED
                    ? 'This expense is approved but not yet paid.'
                    : 'This expense is not yet approved for payment.'}
                </p>
                {currentExpense.status === ExpenseStatus.APPROVED && (
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setIsPayModalOpen(true)}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Expense"
      >
        <div className="p-6">
          <p>Are you sure you want to delete this expense?</p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Expense"
      >
        <div className="p-6">
          <TextArea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectionReason}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Mark Expense as Paid"
      >
        <div className="p-6">
          <Select
            label="Payment Method"
            value={paymentData.paymentMethod}
            onChange={(e) =>
              setPaymentData({
                ...paymentData,
                paymentMethod: e.target.value as PaymentMethod,
              })
            }
            required
          >
            {Object.values(PaymentMethod).map((method) => (
              <option key={method} value={method}>
                {method.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </Select>
          <DatePicker
            label="Payment Date"
            value={paymentData.paymentDate}
            onChange={(date) =>
              setPaymentData({
                ...paymentData,
                paymentDate: date,
              })
            }
            className="mt-4"
            required
          />
          <Input
            label="Payment Reference"
            value={paymentData.paymentReference}
            onChange={(e) =>
              setPaymentData({
                ...paymentData,
                paymentReference: e.target.value,
              })
            }
            className="mt-4"
          />
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handlePay}
            >
              Mark as Paid
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseDetail;
