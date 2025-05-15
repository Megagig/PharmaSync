import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchInvoices } from '@/store/slices/invoicesSlice';
import { InvoiceStatus, InvoiceType } from '@/types/invoice.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const InvoicesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoices, isLoading, error, meta } = useSelector(
    (state: RootState) => state.invoices
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInvoices();
  }, [currentPage, type, status, dateRange]);

  const loadInvoices = () => {
    dispatch(
      fetchInvoices({
        page: currentPage,
        limit: 10,
        type,
        status,
        search,
        startDate: dateRange?.startDate || '',
        endDate: dateRange?.endDate || '',
      }) as any
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadInvoices();
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setStatus('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return <Badge color="success">Paid</Badge>;
      case InvoiceStatus.PARTIAL:
        return <Badge color="warning">Partial</Badge>;
      case InvoiceStatus.SENT:
        return <Badge color="info">Sent</Badge>;
      case InvoiceStatus.DRAFT:
        return <Badge color="default">Draft</Badge>;
      case InvoiceStatus.OVERDUE:
        return <Badge color="danger">Overdue</Badge>;
      case InvoiceStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: InvoiceType) => {
    switch (type) {
      case InvoiceType.SALES:
        return <Badge color="primary">Sales</Badge>;
      case InvoiceType.PURCHASE:
        return <Badge color="secondary">Purchase</Badge>;
      default:
        return <Badge color="default">{type}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      cell: (row: any) => (
        <span className="font-medium text-primary-600">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'invoiceDate',
      cell: (row: any) => formatDate(row.invoiceDate),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      cell: (row: any) => formatDate(row.dueDate),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) => getTypeBadge(row.type),
    },
    {
      header: 'Customer/Supplier',
      accessor: 'entity',
      cell: (row: any) => {
        if (row.type === InvoiceType.SALES && row.customer) {
          const customer = row.customer as any;
          return customer
            ? `${customer.firstName} ${customer.lastName}`
            : 'N/A';
        } else if (row.type === InvoiceType.PURCHASE && row.supplier) {
          const supplier = row.supplier as any;
          return supplier ? supplier.name : 'N/A';
        }
        return 'N/A';
      },
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (row: any) => formatCurrency(row.total),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      cell: (row: any) => formatCurrency(row.balance),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/invoices/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/invoices/${row._id}/print`)}
          >
            Print
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/invoices/new?type=purchase')}
          >
            New Purchase Invoice
          </Button>
          <Button variant="outline" onClick={() => navigate('/invoices/batch')}>
            Batch Invoicing
          </Button>
          <Button variant="outline" onClick={() => navigate('/reminders')}>
            Payment Reminders
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/invoices/new?type=sales')}
          >
            New Sales Invoice
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="Search"
              placeholder="Search by invoice number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: InvoiceType.SALES, label: 'Sales' },
                { value: InvoiceType.PURCHASE, label: 'Purchase' },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: InvoiceStatus.DRAFT, label: 'Draft' },
                { value: InvoiceStatus.SENT, label: 'Sent' },
                { value: InvoiceStatus.PAID, label: 'Paid' },
                { value: InvoiceStatus.PARTIAL, label: 'Partial' },
                { value: InvoiceStatus.OVERDUE, label: 'Overdue' },
                { value: InvoiceStatus.CANCELLED, label: 'Cancelled' },
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
            data={invoices}
            isLoading={isLoading}
            emptyMessage="No invoices found"
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

export default InvoicesList;
