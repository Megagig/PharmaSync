import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { generatePosReceipt, clearReceiptData } from '@/store/slices/posSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useReactToPrint } from 'react-to-print';

const PosTransactionReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { receiptData, isLoading, error } = useSelector(
    (state: RootState) => state.pos
  );
  
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(generatePosReceipt(id) as any);
    }

    return () => {
      dispatch(clearReceiptData());
    };
  }, [dispatch, id]);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${receiptData?.transactionNumber || 'POS'}`,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-red-600">Error</h2>
              <p className="mt-2 text-gray-600">{error}</p>
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

  if (!receiptData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-medium">Receipt not found</h2>
              <p className="mt-2 text-gray-600">
                The receipt you're looking for doesn't exist or has been removed.
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
        <h1 className="text-2xl font-bold">Receipt</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/pos/transactions/${id}`)}
          >
            Back to Transaction
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div
            ref={receiptRef}
            className="bg-white p-8 max-w-md mx-auto font-mono text-sm"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">PharmaSync</h2>
              <p>{receiptData.location}</p>
              {receiptData.address && <p>{receiptData.address}</p>}
              <p className="mt-2">
                {formatDateTime(receiptData.date)}
              </p>
              <p className="mt-1 font-bold">
                {receiptData.transactionType.toUpperCase()} RECEIPT
              </p>
              <p className="text-xs mt-1">
                Receipt #: {receiptData.transactionNumber}
              </p>
            </div>

            <div className="mb-4">
              <p>
                <span className="font-bold">Customer:</span> {receiptData.customer.name}
              </p>
              <p>
                <span className="font-bold">Customer ID:</span> {receiptData.customer.id}
              </p>
              <p>
                <span className="font-bold">Cashier:</span> {receiptData.cashier}
              </p>
            </div>

            <div className="border-t border-b border-gray-300 py-2 mb-4">
              <div className="grid grid-cols-12 font-bold mb-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {receiptData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 text-xs py-1">
                  <div className="col-span-6">{item.product}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    {formatCurrency(item.unitPrice)}
                  </div>
                  <div className="col-span-2 text-right">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(receiptData.subtotal)}</span>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(receiptData.discount)}</span>
                </div>
              )}
              {receiptData.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(receiptData.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>Total:</span>
                <span>{formatCurrency(receiptData.total)}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-1">Payment Methods:</p>
              {receiptData.paymentMethods.map((method, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="capitalize">{method.method}:</span>
                  <span>{formatCurrency(method.amount)}</span>
                </div>
              ))}
              {receiptData.changeDue > 0 && (
                <div className="flex justify-between font-bold mt-2">
                  <span>Change Due:</span>
                  <span>{formatCurrency(receiptData.changeDue)}</span>
                </div>
              )}
            </div>

            {receiptData.notes && (
              <div className="mb-4 text-xs">
                <p className="font-bold">Notes:</p>
                <p>{receiptData.notes}</p>
              </div>
            )}

            <div className="text-center text-xs mt-6">
              <p>Thank you for your business!</p>
              <p className="mt-1">
                For any inquiries, please contact us.
              </p>
              <p className="mt-4">
                Powered by PharmaSync
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PosTransactionReceipt;
