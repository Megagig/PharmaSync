import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPaymentById } from '@/store/slices/paymentsSlice';
import { PaymentDirection } from '@/types/payment.types';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { formatCurrency, formatDate } from '@/utils/formatters';

const PaymentReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPayment, isLoading, error } = useSelector(
    (state: RootState) => state.payments
  );
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchPaymentById(id) as any);
    }
  }, [dispatch, id]);

  const handlePrint = () => {
    const printContents = receiptRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment Receipt</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .receipt-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .receipt-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .receipt-info-section {
                flex: 1;
              }
              .receipt-info-label {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .receipt-details {
                margin-bottom: 20px;
              }
              .receipt-details-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #eee;
              }
              .receipt-details-label {
                font-weight: bold;
              }
              .receipt-amount {
                text-align: right;
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
              }
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
              }
              .signature-line {
                width: 200px;
                border-top: 1px solid #000;
                margin-top: 50px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${printContents}
            </div>
          </body>
        </html>
      `;

      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading payment receipt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Failed to load payment
      </div>
    );
  }

  const isReceived = currentPayment.direction === PaymentDirection.RECEIVED;
  const customer = typeof currentPayment.customer === 'object' ? currentPayment.customer : null;
  const supplier = typeof currentPayment.supplier === 'object' ? currentPayment.supplier : null;
  const invoice = typeof currentPayment.invoice === 'object' ? currentPayment.invoice : null;
  const sale = typeof currentPayment.sale === 'object' ? currentPayment.sale : null;
  const purchaseOrder = typeof currentPayment.purchaseOrder === 'object' ? currentPayment.purchaseOrder : null;
  const createdBy = typeof currentPayment.createdBy === 'object' ? currentPayment.createdBy : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Receipt</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/payments/${id}`)}>
            Back to Payment
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div ref={receiptRef} className="receipt">
            <div className="receipt-header">
              <h1 className="receipt-title">PharmaSync</h1>
              <p className="text-gray-500">
                Your Trusted Pharmaceutical Care Partner
              </p>
              <p className="text-gray-500">123 Health Street, Lagos, Nigeria</p>
              <p className="text-gray-500">Tel: +234 123 456 7890</p>
              <hr className="my-4" />
              <h2 className="text-xl font-semibold">
                {isReceived ? 'Payment Receipt' : 'Payment Voucher'}
              </h2>
              <p className="text-gray-700">
                Receipt No: {currentPayment.paymentNumber}
              </p>
              <p className="text-gray-700">
                Date: {formatDate(currentPayment.paymentDate)}
              </p>
            </div>

            <div className="receipt-info mt-6 grid grid-cols-2 gap-4">
              <div className="receipt-info-section">
                <h3 className="text-md font-semibold">
                  {isReceived ? 'Received From' : 'Paid To'}
                </h3>
                {isReceived && customer ? (
                  <div>
                    <p className="text-gray-700">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-gray-700">ID: {customer.customerNumber}</p>
                    {customer.phone && <p className="text-gray-700">Phone: {customer.phone}</p>}
                  </div>
                ) : supplier ? (
                  <div>
                    <p className="text-gray-700">{supplier.name}</p>
                    <p className="text-gray-700">ID: {supplier.supplierCode}</p>
                    {supplier.phone && <p className="text-gray-700">Phone: {supplier.phone}</p>}
                  </div>
                ) : (
                  <p className="text-gray-700">N/A</p>
                )}
              </div>
              <div className="receipt-info-section">
                <h3 className="text-md font-semibold">Payment Details</h3>
                <p className="text-gray-700">
                  Method: {currentPayment.paymentMethod.charAt(0).toUpperCase() + 
                          currentPayment.paymentMethod.slice(1)}
                </p>
                {currentPayment.reference && (
                  <p className="text-gray-700">Reference: {currentPayment.reference}</p>
                )}
                <p className="text-gray-700">
                  Processed by: {createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="receipt-details mt-6">
              <h3 className="text-md font-semibold mb-2">Payment For</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice ? `Payment for Invoice #${invoice.invoiceNumber}` :
                         sale ? `Payment for Sale #${sale.saleNumber}` :
                         purchaseOrder ? `Payment for Purchase Order #${purchaseOrder.orderNumber}` :
                         isReceived ? 'Customer Payment' : 'Supplier Payment'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentPayment.reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(currentPayment.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="receipt-amount mt-6 text-right">
              <p className="text-lg font-bold">
                <span className="font-medium">Total Amount:</span> {formatCurrency(currentPayment.amount)}
              </p>
            </div>

            {currentPayment.notes && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{currentPayment.notes}</p>
              </div>
            )}

            <div className="signature-section mt-10">
              <div className="signature-line">
                <p>Received By</p>
              </div>
              <div className="signature-line">
                <p>Authorized By</p>
              </div>
            </div>

            <div className="receipt-footer mt-8 text-center text-gray-500">
              <p>
                Thank you for choosing PharmaSync for your pharmaceutical
                needs.
              </p>
              <p>This is a computer-generated receipt and does not require a signature.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentReceipt;
