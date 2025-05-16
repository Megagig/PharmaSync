import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPosTransactions } from '@/store/slices/posSlice';
import { PosTransactionType } from '@/types/pos.types';
import { PaymentStatus } from '@/types/sale.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';

const PosTransactionsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { transactions, isLoading, error, transactionsMeta } = useSelector(
    (state: RootState) => state.pos
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, type, paymentStatus, dateRange]);

  const loadTransactions = () => {
    const params: any = {
      page: currentPage,
      limit: 10,
      type,
      paymentStatus,
    };

    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    if (search) {
      params.search = search;
    }

    dispatch(fetchPosTransactions(params) as any);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTransactions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setPaymentStatus('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewTransaction = (id: string) => {
    navigate(`/pos/transactions/${id}`);
  };

  const columns = [
    {
      header: 'Transaction #',
      accessor: 'saleNumber',
      cell: (transaction: any) => transaction.saleNumber,
    },
    {
      header: 'Date',
      accessor: 'saleDate',
      cell: (transaction: any) => formatDateTime(transaction.saleDate),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (transaction: any) =>
        typeof transaction.customer === 'object'
          ? `${transaction.customer.firstName} ${transaction.customer.lastName}`
          : 'N/A',
    },
    {
      header: 'Type',
      accessor: 'transactionType',
      cell: (transaction: any) => (
        <Badge
          variant={
            transaction.transactionType === PosTransactionType.SALE
              ? 'success'
              : transaction.transactionType === PosTransactionType.RETURN
              ? 'danger'
              : 'warning'
          }
        >
          {transaction.transactionType}
        </Badge>
      ),
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (transaction: any) => formatCurrency(transaction.total),
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      cell: (transaction: any) => (
        <Badge
          variant={
            transaction.paymentStatus === PaymentStatus.PAID
              ? 'success'
              : transaction.paymentStatus === PaymentStatus.PARTIAL
              ? 'warning'
              : 'danger'
          }
        >
          {transaction.paymentStatus}
        </Badge>
      ),
    },
    {
      header: 'Cashier',
      accessor: 'cashier',
      cell: (transaction: any) =>
        typeof transaction.cashier === 'object'
          ? `${transaction.cashier.firstName} ${transaction.cashier.lastName}`
          : 'N/A',
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (transaction: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewTransaction(transaction._id)}
          >
            View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/pos/transactions/${transaction._id}/receipt`)}
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">POS Transactions</h1>
        <Button variant="primary" onClick={() => navigate('/pos/terminal')}>
          Open POS Terminal
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by transaction number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value={PosTransactionType.SALE}>Sale</option>
              <option value={PosTransactionType.RETURN}>Return</option>
              <option value={PosTransactionType.EXCHANGE}>Exchange</option>
            </Select>

            <Select
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value={PaymentStatus.PAID}>Paid</option>
              <option value={PaymentStatus.PARTIAL}>Partial</option>
              <option value={PaymentStatus.UNPAID}>Unpaid</option>
            </Select>

            <DateRangePicker
              label="Date Range"
              value={dateRange}
              onChange={setDateRange}
            />

            <div className="flex items-end">
              <Button variant="primary" onClick={handleSearch} className="w-full">
                Search
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mb-6">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Table
            columns={columns}
            data={transactions}
            isLoading={isLoading}
            emptyMessage="No transactions found"
          />

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={transactionsMeta.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PosTransactionsList;
