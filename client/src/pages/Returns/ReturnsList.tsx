import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchReturns } from '@/store/slices/returnsSlice';
import { ReturnStatus, RefundStatus } from '@/types/return.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const ReturnsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { returns, isLoading, error, meta } = useSelector((state: RootState) => state.returns);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [refundStatus, setRefundStatus] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReturns();
  }, [currentPage, status, refundStatus, dateRange]);

  const loadReturns = () => {
    dispatch(
      fetchReturns({
        page: currentPage,
        limit: 10,
        status,
        refundStatus,
        search,
        startDate: dateRange?.startDate || '',
        endDate: dateRange?.endDate || '',
      }) as any
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadReturns();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setRefundStatus('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.COMPLETED:
        return <Badge color="success">Completed</Badge>;
      case ReturnStatus.APPROVED:
        return <Badge color="info">Approved</Badge>;
      case ReturnStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case ReturnStatus.REJECTED:
        return <Badge color="danger">Rejected</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const getRefundStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.PROCESSED:
        return <Badge color="success">Processed</Badge>;
      case RefundStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case RefundStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Return #',
      accessor: 'returnNumber',
      cell: (row: any) => (
        <span className="font-medium text-primary-600">{row.returnNumber}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'returnDate',
      cell: (row: any) => formatDate(row.returnDate),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row: any) => {
        const customer = row.customer as any;
        return customer ? `${customer.firstName} ${customer.lastName}` : 'N/A';
      },
    },
    {
      header: 'Sale #',
      accessor: 'sale',
      cell: (row: any) => {
        const sale = row.sale as any;
        return sale ? sale.saleNumber : 'N/A';
      },
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (row: any) => formatCurrency(row.total),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => getStatusBadge(row.status),
    },
    {
      header: 'Refund Status',
      accessor: 'refundStatus',
      cell: (row: any) => getRefundStatusBadge(row.refundStatus),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/returns/${row._id}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Returns & Refunds</h1>
        <Button variant="primary" onClick={() => navigate('/returns/new')}>
          New Return
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="Search"
              placeholder="Search by return number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: ReturnStatus.PENDING, label: 'Pending' },
                { value: ReturnStatus.APPROVED, label: 'Approved' },
                { value: ReturnStatus.COMPLETED, label: 'Completed' },
                { value: ReturnStatus.REJECTED, label: 'Rejected' },
              ]}
            />
            <Select
              label="Refund Status"
              value={refundStatus}
              onChange={(e) => setRefundStatus(e.target.value)}
              options={[
                { value: '', label: 'All Refund Statuses' },
                { value: RefundStatus.PENDING, label: 'Pending' },
                { value: RefundStatus.PROCESSED, label: 'Processed' },
                { value: RefundStatus.CANCELLED, label: 'Cancelled' },
              ]}
            />
            <DateRangePicker
              label="Date Range"
              startDate={dateRange?.startDate || ''}
              endDate={dateRange?.endDate || ''}
              onDateChange={setDateRange}
            />
          </div>

          <div className="flex justify-end space-x-2 mb-6">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Table
            columns={columns}
            data={returns}
            isLoading={isLoading}
            emptyMessage="No returns found"
          />

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReturnsList;
