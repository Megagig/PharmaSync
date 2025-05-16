import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchJournalEntryById,
  deleteJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
} from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import TextArea from '@/components/common/TextArea/TextArea';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { JournalEntryStatus } from '@/types/accounting.types';
import { useToast } from '@/hooks/useToast';

const JournalEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentJournalEntry, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseReason, setReverseReason] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchJournalEntryById(id) as any);
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteJournalEntry(id!) as any);
      showToast('Journal entry deleted successfully', 'success');
      navigate('/accounting/journal-entries');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const handlePost = async () => {
    try {
      await dispatch(postJournalEntry(id!) as any);
      showToast('Journal entry posted successfully', 'success');
      setShowPostModal(false);
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const handleReverse = async () => {
    if (!reverseReason.trim()) {
      showToast('Please provide a reason for reversal', 'error');
      return;
    }

    try {
      await dispatch(reverseJournalEntry({ id: id!, reason: reverseReason }) as any);
      showToast('Journal entry reversed successfully', 'success');
      setShowReverseModal(false);
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const getStatusBadge = (status: JournalEntryStatus) => {
    switch (status) {
      case JournalEntryStatus.DRAFT:
        return <Badge color="yellow">{status}</Badge>;
      case JournalEntryStatus.POSTED:
        return <Badge color="green">{status}</Badge>;
      case JournalEntryStatus.REVERSED:
        return <Badge color="red">{status}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (isLoading && !currentJournalEntry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error && !currentJournalEntry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentJournalEntry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Journal entry not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal Entry Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/accounting/journal-entries')}
          >
            Back to Journal Entries
          </Button>
          {currentJournalEntry.status === JournalEntryStatus.DRAFT && (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/accounting/journal-entries/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="success"
                onClick={() => setShowPostModal(true)}
              >
                Post
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </>
          )}
          {currentJournalEntry.status === JournalEntryStatus.POSTED && (
            <Button
              variant="warning"
              onClick={() => setShowReverseModal(true)}
            >
              Reverse
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Entry Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Entry Number</p>
                <p className="font-medium">{currentJournalEntry.entryNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(currentJournalEntry.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{currentJournalEntry.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium">
                  {currentJournalEntry.reference || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{currentJournalEntry.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {getStatusBadge(currentJournalEntry.status)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Amount Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Debit</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(currentJournalEntry.totalDebit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Credit</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(currentJournalEntry.totalCredit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difference</p>
                <p className="font-medium">
                  {formatCurrency(
                    currentJournalEntry.totalDebit - currentJournalEntry.totalCredit
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              {currentJournalEntry.isRecurring && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Recurring</p>
                    <p className="font-medium">Yes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recurring Interval</p>
                    <p className="font-medium capitalize">
                      {currentJournalEntry.recurringInterval || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recurring End Date</p>
                    <p className="font-medium">
                      {currentJournalEntry.recurringEndDate
                        ? formatDate(currentJournalEntry.recurringEndDate)
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">
                  {currentJournalEntry.notes || 'No notes provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">
                  {typeof currentJournalEntry.createdBy === 'object'
                    ? `${currentJournalEntry.createdBy.firstName} ${currentJournalEntry.createdBy.lastName}`
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {formatDate(currentJournalEntry.createdAt)}
                </p>
              </div>
              {currentJournalEntry.status === JournalEntryStatus.POSTED && (
                <div>
                  <p className="text-sm text-gray-500">Posted By</p>
                  <p className="font-medium">
                    {typeof currentJournalEntry.postedBy === 'object'
                      ? `${currentJournalEntry.postedBy.firstName} ${currentJournalEntry.postedBy.lastName}`
                      : 'Unknown'}
                  </p>
                </div>
              )}
              {currentJournalEntry.status === JournalEntryStatus.REVERSED && (
                <div>
                  <p className="text-sm text-gray-500">Reversed By</p>
                  <p className="font-medium">
                    {typeof currentJournalEntry.reversedBy === 'object'
                      ? `${currentJournalEntry.reversedBy.firstName} ${currentJournalEntry.reversedBy.lastName}`
                      : 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentJournalEntry.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {typeof item.account === 'object'
                        ? `${item.account.accountNumber} - ${item.account.name}`
                        : item.account}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.description || currentJournalEntry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.debit > 0 ? formatCurrency(item.debit) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.credit > 0 ? formatCurrency(item.credit) : ''}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td
                    colSpan={2}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right"
                  >
                    Totals
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(currentJournalEntry.totalDebit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(currentJournalEntry.totalCredit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Journal Entry"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete this journal entry? This action cannot be undone.
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

      {/* Post Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Post Journal Entry"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to post this journal entry? This will update account balances and create general ledger entries. This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPostModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handlePost}
              isLoading={isLoading}
            >
              Post
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reverse Modal */}
      <Modal
        isOpen={showReverseModal}
        onClose={() => setShowReverseModal(false)}
        title="Reverse Journal Entry"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to reverse this journal entry? This will create a new journal entry with opposite debits and credits.
          </p>
          <div className="mb-4">
            <TextArea
              label="Reason for Reversal"
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowReverseModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleReverse}
              isLoading={isLoading}
            >
              Reverse
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JournalEntryDetail;
