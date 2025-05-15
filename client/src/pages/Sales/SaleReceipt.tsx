import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  generateReceipt,
  clearReceiptData,
  setError,
} from '@/store/slices/salesSlice';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { formatCurrency } from '@/utils/formatters';

const SaleReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { receiptData, isLoading, error } = useSelector(
    (state: RootState) => state.sales
  );
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(generateReceipt(id) as any);
    }

    // Clear receipt data when component unmounts
    return () => {
      dispatch(clearReceiptData());
    };
  }, [dispatch, id]);

  const handlePrint = () => {
    const printContents = receiptRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sale Receipt</title>
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
              .receipt-info {
                margin-bottom: 20px;
              }
              .receipt-info-section {
                margin-bottom: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              .receipt-total {
                text-align: right;
              }
              .receipt-total p {
                margin: 5px 0;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
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
        <p className="text-gray-500">Generating receipt...</p>
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

  if (!receiptData) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Failed to generate receipt
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sale Receipt</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/sales/${id}`)}>
            Back to Sale
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
              <h1 className="text-2xl font-bold">PharmaSync</h1>
              <p className="text-gray-500">
                Your Trusted Pharmaceutical Care Partner
              </p>
              <p className="text-gray-500">123 Health Street, Lagos, Nigeria</p>
              <p className="text-gray-500">Tel: +234 123 456 7890</p>
              <hr className="my-4" />
              <h2 className="text-xl font-semibold">Receipt</h2>
              <p className="text-gray-700">
                Receipt No: {receiptData.saleNumber}
              </p>
              <p className="text-gray-700">
                Date: {new Date(receiptData.date).toLocaleDateString()}
              </p>
            </div>

            <div className="receipt-info mt-6 grid grid-cols-2 gap-4">
              <div className="receipt-info-section">
                <h3 className="text-md font-semibold">Customer Information</h3>
                <p className="text-gray-700">
                  Name: {receiptData.customer.name}
                </p>
                <p className="text-gray-700">ID: {receiptData.customer.id}</p>
              </div>
              <div className="receipt-info-section">
                <h3 className="text-md font-semibold">Sold By</h3>
                <p className="text-gray-700">{receiptData.soldBy}</p>
                <p className="text-gray-700">
                  Payment Method:{' '}
                  {receiptData.paymentMethod.charAt(0).toUpperCase() +
                    receiptData.paymentMethod.slice(1)}
                </p>
              </div>
            </div>

            <div className="receipt-items mt-6">
              <h3 className="text-md font-semibold mb-2">Items</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receiptData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.discount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-total mt-4 text-right">
                <p className="text-gray-700">
                  <span className="font-medium">Subtotal:</span> ₦
                  {receiptData.subtotal.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Discount:</span> ₦
                  {receiptData.discount.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Tax:</span> ₦
                  {receiptData.tax.toFixed(2)}
                </p>
                <p className="text-lg font-bold">
                  <span className="font-medium">Total:</span> ₦
                  {receiptData.total.toFixed(2)}
                </p>
              </div>

              <div className="receipt-footer mt-8 text-center text-gray-500">
                <p>
                  Thank you for choosing PharmaSync for your pharmaceutical
                  needs.
                </p>
                <p>We wish you good health!</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SaleReceipt;
