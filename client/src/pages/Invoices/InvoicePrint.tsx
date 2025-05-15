import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchInvoiceById } from '@/store/slices/invoicesSlice';
import { InvoiceType } from '@/types/invoice.types';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { formatCurrency, formatDate } from '@/utils/formatters';

const InvoicePrint = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentInvoice, isLoading, error } = useSelector(
    (state: RootState) => state.invoices
  );
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id) as any);
    }
  }, [dispatch, id]);

  const handlePrint = () => {
    const printContents = invoiceRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .invoice {
                max-width: 800px;
                margin: 0 auto;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
              }
              .invoice-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .invoice-details {
                margin-bottom: 20px;
              }
              .invoice-details-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .invoice-details-column {
                flex: 1;
              }
              .invoice-details-label {
                font-weight: bold;
                margin-bottom: 5px;
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
              .invoice-total {
                text-align: right;
              }
              .invoice-total-row {
                margin: 5px 0;
              }
              .invoice-total-label {
                font-weight: bold;
                margin-right: 20px;
              }
              .invoice-footer {
                margin-top: 40px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="invoice">
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
        <p className="text-gray-500">Loading invoice...</p>
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

  if (!currentInvoice) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Failed to load invoice
      </div>
    );
  }

  const isSalesInvoice = currentInvoice.type === InvoiceType.SALES;
  const customer = typeof currentInvoice.customer === 'object' ? currentInvoice.customer : null;
  const supplier = typeof currentInvoice.supplier === 'object' ? currentInvoice.supplier : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Invoice</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/invoices/${id}`)}>
            Back to Invoice
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print Invoice
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div ref={invoiceRef} className="invoice">
            <div className="invoice-header">
              <div>
                <h1 className="invoice-title">PharmaSync</h1>
                <p>123 Health Street, Lagos, Nigeria</p>
                <p>Tel: +234 123 456 7890</p>
                <p>Email: info@pharmasync.com</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">
                  {isSalesInvoice ? 'Sales Invoice' : 'Purchase Invoice'}
                </h2>
                <p className="text-gray-700">
                  Invoice #: {currentInvoice.invoiceNumber}
                </p>
                <p className="text-gray-700">
                  Date: {formatDate(currentInvoice.invoiceDate)}
                </p>
                <p className="text-gray-700">
                  Due Date: {formatDate(currentInvoice.dueDate)}
                </p>
              </div>
            </div>

            <div className="invoice-details">
              <div className="invoice-details-row">
                <div className="invoice-details-column">
                  <p className="invoice-details-label">
                    {isSalesInvoice ? 'Bill To:' : 'Vendor:'}
                  </p>
                  {isSalesInvoice && customer ? (
                    <>
                      <p className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p>Customer ID: {customer.customerNumber}</p>
                      <p>{customer.email}</p>
                      <p>{customer.phone}</p>
                      <p>{customer.address}</p>
                    </>
                  ) : supplier ? (
                    <>
                      <p className="font-medium">{supplier.name}</p>
                      <p>Supplier ID: {supplier.supplierCode}</p>
                      <p>Contact: {supplier.contactPerson}</p>
                      <p>{supplier.email}</p>
                      <p>{supplier.phone}</p>
                      <p>{supplier.address}</p>
                    </>
                  ) : (
                    <p>No {isSalesInvoice ? 'customer' : 'supplier'} information</p>
                  )}
                </div>
                <div className="invoice-details-column text-right">
                  <p className="invoice-details-label">Payment Details:</p>
                  <p>Bank: First Bank of Nigeria</p>
                  <p>Account Name: PharmaSync Ltd</p>
                  <p>Account Number: 1234567890</p>
                  <p>Payment Terms: Due on receipt</p>
                </div>
              </div>
            </div>

            <div className="invoice-items mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
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
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentInvoice.items.map((item, index) => {
                    const product = typeof item.product === 'object' ? item.product : null;
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          {product ? product.name : 'Unknown Product'}
                        </td>
                        <td className="px-6 py-4">
                          {item.description}
                        </td>
                        <td className="px-6 py-4">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4">
                          {formatCurrency(item.discount)}
                        </td>
                        <td className="px-6 py-4">
                          {formatCurrency(item.tax)}
                        </td>
                        <td className="px-6 py-4">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="invoice-total mt-4">
                <div className="invoice-total-row">
                  <span className="invoice-total-label">Subtotal:</span>
                  <span>{formatCurrency(currentInvoice.subtotal)}</span>
                </div>
                <div className="invoice-total-row">
                  <span className="invoice-total-label">Discount:</span>
                  <span>{formatCurrency(currentInvoice.discount)}</span>
                </div>
                <div className="invoice-total-row">
                  <span className="invoice-total-label">Tax:</span>
                  <span>{formatCurrency(currentInvoice.tax)}</span>
                </div>
                <div className="invoice-total-row font-bold">
                  <span className="invoice-total-label">Total:</span>
                  <span>{formatCurrency(currentInvoice.total)}</span>
                </div>
                <div className="invoice-total-row">
                  <span className="invoice-total-label">Amount Paid:</span>
                  <span>{formatCurrency(currentInvoice.amountPaid)}</span>
                </div>
                <div className="invoice-total-row font-bold">
                  <span className="invoice-total-label">Balance Due:</span>
                  <span>{formatCurrency(currentInvoice.balance)}</span>
                </div>
              </div>

              {currentInvoice.notes && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Notes</h3>
                  <p className="text-gray-700">{currentInvoice.notes}</p>
                </div>
              )}

              {currentInvoice.termsAndConditions && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Terms and Conditions</h3>
                  <p className="text-gray-700">{currentInvoice.termsAndConditions}</p>
                </div>
              )}

              <div className="invoice-footer mt-8 text-center text-gray-500">
                <p>Thank you for your business!</p>
                <p>For any inquiries, please contact us at support@pharmasync.com</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoicePrint;
