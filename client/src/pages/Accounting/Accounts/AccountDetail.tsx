import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchAccountById, deleteAccount } from '@/store/slices/accountingSlice';
import { fetchAccountStatement } from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const AccountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentAccount, accountStatement, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchAccountById(id) as any);
      dispatch(
        fetchAccountStatement({
          accountId: id,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }) as any
      );
    }
  }, [dispatch, id, dateRange]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteAccount(id!) as any);
      showToast('Account deleted successfully', 'success');
      navigate('/accounting/accounts');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const transactionColumns = [
    {
      header: 'Date',
      accessor: 'date',
      cell: (row: any) => formatDate(row.date),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row: any) => row.description,
    },
    {
      header: 'Reference',
      accessor: 'reference',
      cell: (row: any) => row.reference || '-',
    },
    {
      header: 'Debit',
      accessor: 'debit',
      cell: (row: any) => (row.debit > 0 ? formatCurrency(row.debit) : ''),
    },
    {
      header: 'Credit',
      accessor: 'credit',
      cell: (row: any) => (row.credit > 0 ? formatCurrency(row.credit) : ''),
    },
    {
      header: 'Balance',
      accessor: 'runningBalance',
      cell: (row: any) => formatCurrency(row.runningBalance),
    },
  ];

  if (isLoading && !currentAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error && !currentAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Account not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/accounting/accounts')}
          >
            Back to Accounts
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/accounting/accounts/${id}/edit`)}
          >
            Edit Account
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{currentAccount.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{currentAccount.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{currentAccount.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium capitalize">
                  {currentAccount.category.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge
                  color={
                    currentAccount.status === 'active'
                      ? 'green'
                      : currentAccount.status === 'inactive'
                      ? 'yellow'
                      : 'gray'
                  }
                >
                  {currentAccount.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Balance Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(currentAccount.balance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opening Balance</p>
                <p className="font-medium">
                  {formatCurrency(currentAccount.openingBalance)}
                </p>
              </div>
              {accountStatement && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Period Opening Balance</p>
                    <p className="font-medium">
                      {formatCurrency(accountStatement.openingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Period Closing Balance</p>
                    <p className="font-medium">
                      {formatCurrency(accountStatement.closingBalance)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              {currentAccount.isSubAccount && typeof currentAccount.parentAccount === 'object' && (
                <div>
                  <p className="text-sm text-gray-500">Parent Account</p>
                  <p className="font-medium">
                    {currentAccount.parentAccount.accountNumber} - {currentAccount.parentAccount.name}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">
                  {currentAccount.description || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">
                  {currentAccount.notes || 'No notes provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">
                  {typeof currentAccount.createdBy === 'object'
                    ? `${currentAccount.createdBy.firstName} ${currentAccount.createdBy.lastName}`
                    : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{formatDate(currentAccount.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Account Statement</h2>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {accountStatement && (
            <div className="overflow-x-auto">
              <Table
                columns={transactionColumns}
                data={accountStatement.transactions}
                isLoading={isLoading}
                error={error}
              />
              {accountStatement.transactions.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No transactions found for this period
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete this account? This action cannot be undone.
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
    </div>
  );
};

export default AccountDetail;
