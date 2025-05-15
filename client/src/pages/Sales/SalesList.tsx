import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchSales } from '@/store/slices/salesSlice';
import { SaleStatus, PaymentStatus } from '@/types/sale.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const SalesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sales, isLoading, error, meta } = useSelector((state: RootState) => state.sales);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadSales();
  }, [currentPage, status, paymentStatus, dateRange]);

  const loadSales = () => {
    dispatch(
      fetchSales({
        page: currentPage,
        limit: 10,
        status,
        paymentStatus,
        search,
        startDate: dateRange?.startDate || '',
        endDate: dateRange?.endDate || '',
      }) as any
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadSales();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.COMPLETED:
        return <Badge color="success">Completed</Badge>;
      case SaleStatus.RETURNED:
        return <Badge color="warning">Returned</Badge>;
      case SaleStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      case SaleStatus.PENDING:
        return <Badge color="info">Pending</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <Badge color="success">Paid</Badge>;
      case PaymentStatus.PARTIAL:
        return <Badge color="warning">Partial</Badge>;
      case PaymentStatus.UNPAID:
        return <Badge color="danger">Unpaid</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Sale #',
      accessor: 'saleNumber',
      cell: (row: any) => (
        <span className="font-medium text-primary-600">{row.saleNumber}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'saleDate',
      cell: (row: any) => formatDate(row.saleDate),
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
      header: 'Payment',
      accessor: 'paymentStatus',
      cell: (row: any) => getPaymentStatusBadge(row.paymentStatus),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/sales/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/sales/${row._id}/receipt`)}
          >
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
        <Button variant="primary" onClick={() => navigate('/sales/new')}>
          New Sale
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="Search"
              placeholder="Search by sale number"
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
                { value: SaleStatus.COMPLETED, label: 'Completed' },
                { value: SaleStatus.PENDING, label: 'Pending' },
                { value: SaleStatus.RETURNED, label: 'Returned' },
                { value: SaleStatus.CANCELLED, label: 'Cancelled' },
              ]}
            />
            <Select
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              options={[
                { value: '', label: 'All Payment Statuses' },
                { value: PaymentStatus.PAID, label: 'Paid' },
                { value: PaymentStatus.PARTIAL, label: 'Partial' },
                { value: PaymentStatus.UNPAID, label: 'Unpaid' },
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
            data={sales}
            isLoading={isLoading}
            emptyMessage="No sales found"
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

export default SalesList;
