import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchInvoiceById, updateInvoice } from '@/store/slices/invoicesSlice';
import { InvoiceStatus, InvoiceType } from '@/types/invoice.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentInvoice, isLoading, error } = useSelector(
    (state: RootState) => state.invoices
  );

  const [isEditing, setIsEditing] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentInvoice) {
      setInvoiceDate(currentInvoice.invoiceDate);
      setDueDate(currentInvoice.dueDate);
      setStatus(currentInvoice.status);
      setDiscount(currentInvoice.discount);
      setTax(currentInvoice.tax);
      setAmountPaid(currentInvoice.amountPaid);
      setNotes(currentInvoice.notes || '');
      setTermsAndConditions(currentInvoice.termsAndConditions || '');
    }
  }, [currentInvoice]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values
    if (currentInvoice) {
      setInvoiceDate(currentInvoice.invoiceDate);
      setDueDate(currentInvoice.dueDate);
      setStatus(currentInvoice.status);
      setDiscount(currentInvoice.discount);
      setTax(currentInvoice.tax);
      setAmountPaid(currentInvoice.amountPaid);
      setNotes(currentInvoice.notes || '');
      setTermsAndConditions(currentInvoice.termsAndConditions || '');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await dispatch(
        updateInvoice({
          id,
          updateData: {
            invoiceDate,
            dueDate,
            status: status as InvoiceStatus,
            discount,
            tax,
            amountPaid,
            notes,
            termsAndConditions,
          },
        }) as any
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  };

  const handlePrintInvoice = () => {
    if (id) {
      navigate(`/invoices/${id}/print`);
    }
  };

  const handleReceivePayment = () => {
    navigate(`/payments/new?invoice=${id}&direction=received`);
  };

  const handleMakePayment = () => {
    navigate(`/payments/new?invoice=${id}&direction=made`);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading invoice details...</p>
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
        Invoice not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Invoice: {currentInvoice.invoiceNumber}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
          {!isEditing && (
            <Button variant="primary" onClick={handleEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Invoice Information</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Invoice Number
                </span>
                <span className="block mt-1">
                  {currentInvoice.invoiceNumber}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Type
                </span>
                <span className="block mt-1">
                  {getTypeBadge(currentInvoice.type)}
                </span>
              </div>
              {currentInvoice.type === InvoiceType.SALES &&
                currentInvoice.customer && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Customer
                    </span>
                    <span className="block mt-1">
                      {typeof currentInvoice.customer === 'object'
                        ? `${currentInvoice.customer.firstName} ${currentInvoice.customer.lastName} (${currentInvoice.customer.customerNumber})`
                        : 'Unknown Customer'}
                    </span>
                  </div>
                )}
              {currentInvoice.type === InvoiceType.PURCHASE &&
                currentInvoice.supplier && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Supplier
                    </span>
                    <span className="block mt-1">
                      {typeof currentInvoice.supplier === 'object'
                        ? `${currentInvoice.supplier.name} (${currentInvoice.supplier.supplierCode})`
                        : 'Unknown Supplier'}
                    </span>
                  </div>
                )}
              {isEditing ? (
                <>
                  <DatePicker
                    label="Invoice Date"
                    value={invoiceDate}
                    onChange={(date) => setInvoiceDate(date)}
                    required
                  />
                  <DatePicker
                    label="Due Date"
                    value={dueDate}
                    onChange={(date) => setDueDate(date)}
                    required
                  />
                </>
              ) : (
                <>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Invoice Date
                    </span>
                    <span className="block mt-1">
                      {formatDate(currentInvoice.invoiceDate)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Due Date
                    </span>
                    <span className="block mt-1">
                      {formatDate(currentInvoice.dueDate)}
                    </span>
                  </div>
                </>
              )}
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Created By
                </span>
                <span className="block mt-1">
                  {typeof currentInvoice.createdBy === 'object'
                    ? `${currentInvoice.createdBy.firstName} ${currentInvoice.createdBy.lastName}`
                    : 'Unknown User'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Created At
                </span>
                <span className="block mt-1">
                  {formatDate(currentInvoice.createdAt)}
                </span>
              </div>
              {currentInvoice.sale && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Related Sale
                  </span>
                  <span className="block mt-1">
                    {typeof currentInvoice.sale === 'object'
                      ? `${currentInvoice.sale.saleNumber} (${formatDate(
                          currentInvoice.sale.saleDate
                        )})`
                      : 'Unknown Sale'}
                  </span>
                </div>
              )}
              {currentInvoice.purchaseOrder && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Related Purchase Order
                  </span>
                  <span className="block mt-1">
                    {typeof currentInvoice.purchaseOrder === 'object'
                      ? `${
                          currentInvoice.purchaseOrder.orderNumber
                        } (${formatDate(
                          currentInvoice.purchaseOrder.orderDate
                        )})`
                      : 'Unknown Purchase Order'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Status & Payment</h2>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value={InvoiceStatus.DRAFT}>Draft</option>
                    <option value={InvoiceStatus.SENT}>Sent</option>
                    <option value={InvoiceStatus.PAID}>Paid</option>
                    <option value={InvoiceStatus.PARTIAL}>Partial</option>
                    <option value={InvoiceStatus.OVERDUE}>Overdue</option>
                    <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
                  </Select>

                  <Input
                    type="number"
                    label="Discount (₦)"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />

                  <Input
                    type="number"
                    label="Tax (₦)"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />

                  <Input
                    type="number"
                    label="Amount Paid (₦)"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms and Conditions
                    </label>
                    <textarea
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <span className="block mt-1">
                      {getStatusBadge(currentInvoice.status)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Subtotal
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentInvoice.subtotal)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Discount
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentInvoice.discount)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Tax
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentInvoice.tax)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Total
                    </span>
                    <span className="block mt-1 text-lg font-bold">
                      {formatCurrency(currentInvoice.total)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Amount Paid
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentInvoice.amountPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Balance
                    </span>
                    <span className="block mt-1 font-semibold">
                      {formatCurrency(currentInvoice.balance)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Notes
                    </span>
                    <span className="block mt-1">
                      {currentInvoice.notes || 'No notes'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button variant="primary" onClick={handlePrintInvoice}>
                      Print Invoice
                    </Button>
                    {currentInvoice.status !== InvoiceStatus.PAID && (
                      <>
                        {currentInvoice.type === InvoiceType.SALES && (
                          <>
                            <Button
                              variant="success"
                              onClick={handleReceivePayment}
                            >
                              Receive Payment
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/reminders/new?invoice=${id}&type=invoice_${
                                    currentInvoice.status ===
                                    InvoiceStatus.OVERDUE
                                      ? 'overdue'
                                      : 'due'
                                  }`
                                )
                              }
                            >
                              Send Reminder
                            </Button>
                          </>
                        )}
                        {currentInvoice.type === InvoiceType.PURCHASE && (
                          <Button variant="success" onClick={handleMakePayment}>
                            Make Payment
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Invoice Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
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
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentInvoice.items.map((item, index) => {
                  const product =
                    typeof item.product === 'object' ? item.product : null;

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product ? product.name : 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.description}
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
                        {formatCurrency(item.tax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentInvoice.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-medium">
                    Discount:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentInvoice.discount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-medium">
                    Tax:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentInvoice.tax)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-bold">
                    Total:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {formatCurrency(currentInvoice.total)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-medium">
                    Amount Paid:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentInvoice.amountPaid)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-right font-bold">
                    Balance:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {formatCurrency(currentInvoice.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      {currentInvoice.termsAndConditions && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Terms and Conditions</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {currentInvoice.termsAndConditions}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InvoiceDetail;
