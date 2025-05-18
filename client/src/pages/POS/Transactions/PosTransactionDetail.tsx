import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPosTransactionById } from '@/store/slices/posSlice';
import { PosTransactionType } from '@/types/pos.types';
import { PaymentStatus } from '@/types/sale.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Table from '@/components/common/Table/Table';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';

const PosTransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTransaction, isLoading, error } = useSelector(
    (state: RootState) => state.pos
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPosTransactionById(id) as any);
    }
  }, [dispatch, id]);

  const handleGenerateReceipt = () => {
    if (id) {
      navigate(`/pos/transactions/${id}/receipt`);
    }
  };

  const handleViewReceipt = () => {
    if (id) {
      navigate(`/pos/receipts/${id}`);
    }
  };

  const handleProcessReturn = () => {
    if (currentTransaction &&
        currentTransaction.transactionType === PosTransactionType.SALE) {
      navigate('/pos/returns/process', {
        state: { transactionId: id }
      });
    }
  };

  const itemColumns = [
    {
      header: 'Product',
      accessor: 'product',
      cell: (item: any) =>
        typeof item.product === 'object' ? item.product.name : 'N/A',
    },
    {
      header: 'SKU',
      accessor: 'sku',
      cell: (item: any) =>
        typeof item.product === 'object' ? item.product.sku : 'N/A',
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      cell: (item: any) => item.quantity,
    },
    {
      header: 'Unit Price',
      accessor: 'unitPrice',
      cell: (item: any) => formatCurrency(item.unitPrice),
    },
    {
      header: 'Discount',
      accessor: 'discount',
      cell: (item: any) => formatCurrency(item.discount),
    },
    {
      header: 'Subtotal',
      accessor: 'subtotal',
      cell: (item: any) => formatCurrency(item.subtotal),
    },
    {
      header: 'Batch',
      accessor: 'batchNumber',
      cell: (item: any) => item.batchNumber,
    },
  ];

  const paymentColumns = [
    {
      header: 'Method',
      accessor: 'method',
      cell: (payment: any) => (
        <span className="capitalize">{payment.method}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (payment: any) => formatCurrency(payment.amount),
    },
    {
      header: 'Reference',
      accessor: 'reference',
      cell: (payment: any) => payment.reference || 'N/A',
    },
    {
      header: 'Card Details',
      accessor: 'cardType',
      cell: (payment: any) =>
        payment.cardType
          ? `${payment.cardType} **** ${payment.cardLast4 || 'XXXX'}`
          : 'N/A',
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!currentTransaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-medium">Transaction not found</h2>
              <p className="mt-2 text-gray-600">
                The transaction you're looking for doesn't exist or has been removed.
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => navigate('/pos/transactions')}
              >
                Back to Transactions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/pos/transactions')}
          >
            Back to Transactions
          </Button>
          <Button variant="secondary" onClick={handleViewReceipt}>
            View Receipt
          </Button>
          <Button variant="primary" onClick={handleGenerateReceipt}>
            Generate Receipt
          </Button>
          {currentTransaction.transactionType === PosTransactionType.SALE && (
            <Button variant="danger" onClick={handleProcessReturn}>
              Process Return
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Transaction Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Transaction Number:</span>
                <p className="font-medium">{currentTransaction.saleNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <p className="font-medium">
                  {formatDateTime(currentTransaction.saleDate)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p>
                  <Badge
                    variant={
                      currentTransaction.transactionType === PosTransactionType.SALE
                        ? 'success'
                        : currentTransaction.transactionType === PosTransactionType.RETURN
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {currentTransaction.transactionType}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <p>
                  <Badge
                    variant={
                      currentTransaction.paymentStatus === PaymentStatus.PAID
                        ? 'success'
                        : currentTransaction.paymentStatus === PaymentStatus.PARTIAL
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {currentTransaction.paymentStatus}
                  </Badge>
                </p>
              </div>
              {currentTransaction.transactionType === PosTransactionType.RETURN && (
                <div>
                  <span className="text-gray-600">Return Reason:</span>
                  <p className="font-medium">
                    {currentTransaction.returnReason || 'No reason provided'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Customer:</span>
                <p className="font-medium">
                  {typeof currentTransaction.customer === 'object'
                    ? `${currentTransaction.customer.firstName} ${currentTransaction.customer.lastName}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Customer ID:</span>
                <p className="font-medium">
                  {typeof currentTransaction.customer === 'object'
                    ? currentTransaction.customer.customerNumber
                    : 'N/A'}
                </p>
              </div>
              {typeof currentTransaction.customer === 'object' && (
                <>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">
                      {currentTransaction.customer.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">
                      {currentTransaction.customer.phone || 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Session Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Session:</span>
                <p className="font-medium">
                  {typeof currentTransaction.posSession === 'object'
                    ? currentTransaction.posSession.sessionNumber
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Register:</span>
                <p className="font-medium">{currentTransaction.register}</p>
              </div>
              <div>
                <span className="text-gray-600">Cashier:</span>
                <p className="font-medium">
                  {typeof currentTransaction.cashier === 'object'
                    ? `${currentTransaction.cashier.firstName} ${currentTransaction.cashier.lastName}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-medium">
                  {typeof currentTransaction.location === 'object'
                    ? currentTransaction.location.name
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Items</h2>
          <Table
            columns={itemColumns}
            data={currentTransaction.items}
            isLoading={isLoading}
            emptyMessage="No items found"
          />
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
          <Table
            columns={paymentColumns}
            data={currentTransaction.paymentMethods}
            isLoading={isLoading}
            emptyMessage="No payment methods found"
          />
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(currentTransaction.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>{formatCurrency(currentTransaction.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(currentTransaction.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(currentTransaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change Due:</span>
              <span>{formatCurrency(currentTransaction.changeDue)}</span>
            </div>
          </div>
        </div>
      </Card>

      {currentTransaction.notes && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-2">Notes</h2>
            <p>{currentTransaction.notes}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PosTransactionDetail;
