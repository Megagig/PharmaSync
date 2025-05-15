import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPayments } from '@/store/slices/paymentsSlice';
import { PaymentMethod, PaymentDirection } from '@/types/payment.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const PaymentsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { payments, isLoading, error, meta } = useSelector((state: RootState) => state.payments);

  // Filter states
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPayments();
  }, [currentPage, direction, paymentMethod, dateRange]);

  const loadPayments = () => {
    dispatch(
      fetchPayments({
        page: currentPage,
        limit: 10,
        direction,
        paymentMethod,
        search,
        startDate: dateRange?.startDate || '',
        endDate: dateRange?.endDate || '',
      }) as any
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPayments();
  };

  const handleClearFilters = () => {
    setSearch('');
    setDirection('');
    setPaymentMethod('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getDirectionBadge = (direction: PaymentDirection) => {
    switch (direction) {
      case PaymentDirection.RECEIVED:
        return <Badge color="success">Received</Badge>;
      case PaymentDirection.MADE:
        return <Badge color="warning">Made</Badge>;
      default:
        return <Badge color="default">{direction}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Badge color="success">Cash</Badge>;
      case PaymentMethod.CARD:
        return <Badge color="info">Card</Badge>;
      case PaymentMethod.TRANSFER:
        return <Badge color="primary">Transfer</Badge>;
      case PaymentMethod.CHEQUE:
        return <Badge color="warning">Cheque</Badge>;
      case PaymentMethod.MOBILE_MONEY:
        return <Badge color="secondary">Mobile Money</Badge>;
      case PaymentMethod.CREDIT:
        return <Badge color="danger">Credit</Badge>;
      default:
        return <Badge color="default">{method}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Payment #',
      accessor: 'paymentNumber',
      cell: (row: any) => (
        <span className="font-medium text-primary-600">{row.paymentNumber}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'paymentDate',
      cell: (row: any) => formatDate(row.paymentDate),
    },
    {
      header: 'Direction',
      accessor: 'direction',
      cell: (row: any) => getDirectionBadge(row.direction),
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      cell: (row: any) => getPaymentMethodBadge(row.paymentMethod),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row: any) => formatCurrency(row.amount),
    },
    {
      header: 'Reference',
      accessor: 'reference',
      cell: (row: any) => row.reference || '-',
    },
    {
      header: 'Related To',
      accessor: 'relatedTo',
      cell: (row: any) => {
        if (row.invoice) {
          const invoice = typeof row.invoice === 'object' ? row.invoice : null;
          return invoice ? `Invoice: ${invoice.invoiceNumber}` : 'Invoice';
        } else if (row.sale) {
          const sale = typeof row.sale === 'object' ? row.sale : null;
          return sale ? `Sale: ${sale.saleNumber}` : 'Sale';
        } else if (row.purchaseOrder) {
          const po = typeof row.purchaseOrder === 'object' ? row.purchaseOrder : null;
          return po ? `PO: ${po.orderNumber}` : 'Purchase Order';
        } else if (row.customer) {
          const customer = typeof row.customer === 'object' ? row.customer : null;
          return customer ? `Customer: ${customer.firstName} ${customer.lastName}` : 'Customer';
        } else if (row.supplier) {
          const supplier = typeof row.supplier === 'object' ? row.supplier : null;
          return supplier ? `Supplier: ${supplier.name}` : 'Supplier';
        }
        return '-';
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/payments/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/payments/${row._id}/receipt`)}
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
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/payments/new?direction=made')}
          >
            Make Payment
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/payments/new?direction=received')}
          >
            Receive Payment
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="Search"
              placeholder="Search by payment number or reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select
              label="Direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              options={[
                { value: '', label: 'All Directions' },
                { value: PaymentDirection.RECEIVED, label: 'Received' },
                { value: PaymentDirection.MADE, label: 'Made' },
              ]}
            />
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: '', label: 'All Methods' },
                { value: PaymentMethod.CASH, label: 'Cash' },
                { value: PaymentMethod.CARD, label: 'Card' },
                { value: PaymentMethod.TRANSFER, label: 'Transfer' },
                { value: PaymentMethod.CHEQUE, label: 'Cheque' },
                { value: PaymentMethod.MOBILE_MONEY, label: 'Mobile Money' },
                { value: PaymentMethod.CREDIT, label: 'Credit' },
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
            data={payments}
            isLoading={isLoading}
            emptyMessage="No payments found"
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

export default PaymentsList;
