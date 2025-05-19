import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPurchaseOrders } from '@/store/slices/purchaseOrderSlice';
import { PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { purchaseOrders, isLoading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.purchaseOrders
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  useEffect(() => {
    loadPurchaseOrders();
  }, [currentPage, status, paymentStatus, dateRange]);

  const loadPurchaseOrders = () => {
    const params: any = {
      page: currentPage,
      limit: 10,
      search,
      status,
      paymentStatus,
    };

    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    dispatch(fetchPurchaseOrders(params) as any);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPurchaseOrders();
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchPurchaseOrders({ ...getFilters(), page }) as any);
  };

  const getFilters = () => {
    const filters: any = {
      page: currentPage,
      limit: 10,
      search,
      status,
      paymentStatus,
    };

    if (dateRange) {
      filters.startDate = dateRange.startDate;
      filters.endDate = dateRange.endDate;
    }

    return filters;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return <Badge color="gray">Draft</Badge>;
      case PurchaseOrderStatus.PENDING:
        return <Badge color="yellow">Pending</Badge>;
      case PurchaseOrderStatus.APPROVED:
        return <Badge color="blue">Approved</Badge>;
      case PurchaseOrderStatus.ORDERED:
        return <Badge color="indigo">Ordered</Badge>;
      case PurchaseOrderStatus.PARTIAL:
        return <Badge color="purple">Partially Received</Badge>;
      case PurchaseOrderStatus.RECEIVED:
        return <Badge color="green">Received</Badge>;
      case PurchaseOrderStatus.CANCELLED:
        return <Badge color="red">Cancelled</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge color="red">Unpaid</Badge>;
      case 'partial':
        return <Badge color="yellow">Partial</Badge>;
      case 'paid':
        return <Badge color="green">Paid</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      cell: (row: any) => (
        <span className="text-blue-600 cursor-pointer" onClick={() => navigate(`/purchase-orders/${row.id}`)}>
          {row.orderNumber}
        </span>
      ),
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      cell: (row: any) => <span>{typeof row.supplier === 'object' ? row.supplier.name : row.supplier}</span>,
    },
    {
      header: 'Date',
      accessor: 'orderDate',
      cell: (row: any) => <span>{formatDate(row.orderDate)}</span>,
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (row: any) => <span>{formatCurrency(row.total)}</span>,
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/purchases/create')}
          >
            Create Purchase
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="col-span-1 md:col-span-2">
              <Input
                placeholder="Search by order number or supplier"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select
                placeholder="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  ...Object.values(PurchaseOrderStatus).map((status) => ({
                    value: status,
                    label: status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase()),
                  })),
                ]}
              />
            </div>
            <div>
              <Select
                placeholder="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Payment Statuses' },
                  { value: 'unpaid', label: 'Unpaid' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'paid', label: 'Paid' },
                ]}
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <DateRangePicker
                startDate={dateRange?.startDate || ''}
                endDate={dateRange?.endDate || ''}
                onChange={(startDate, endDate) =>
                  setDateRange({ startDate, endDate })
                }
                placeholder="Filter by date range"
              />
            </div>
            <div>
              <Button type="submit" variant="secondary" className="w-full">
                Search
              </Button>
            </div>
          </form>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No purchase orders found.</p>
              <Button
                variant="text"
                className="mt-2"
                onClick={() => navigate('/inventory/purchases/create')}
              >
                Create your first purchase order
              </Button>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={purchaseOrders}
                onRowClick={(row) => navigate(`/purchase-orders/${row.id}`)}
              />
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PurchaseOrderList;
