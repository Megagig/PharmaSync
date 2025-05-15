import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchSaleById, updateSale } from '@/store/slices/salesSlice';
import { SaleStatus, PaymentStatus } from '@/types/sale.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

const SaleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSale, isLoading, error } = useSelector(
    (state: RootState) => state.sales
  );

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchSaleById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentSale) {
      setStatus(currentSale.status);
      setPaymentStatus(currentSale.paymentStatus);
      setPaymentMethod(currentSale.paymentMethod);
      setDiscount(currentSale.discount);
      setTax(currentSale.tax);
      setNotes(currentSale.notes || '');
    }
  }, [currentSale]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values
    if (currentSale) {
      setStatus(currentSale.status);
      setPaymentStatus(currentSale.paymentStatus);
      setPaymentMethod(currentSale.paymentMethod);
      setDiscount(currentSale.discount);
      setTax(currentSale.tax);
      setNotes(currentSale.notes || '');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await dispatch(
        updateSale({
          id,
          updateData: {
            status: status as SaleStatus,
            paymentStatus: paymentStatus as PaymentStatus,
            paymentMethod,
            discount,
            tax,
            notes,
          },
        }) as any
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update sale:', error);
    }
  };

  const handleGenerateReceipt = () => {
    if (id) {
      navigate(`/sales/${id}/receipt`);
    }
  };

  const handleCreateInvoice = () => {
    navigate(`/invoices/new?sale=${id}`);
  };

  const handleReceivePayment = () => {
    navigate(`/payments/new?sale=${id}&direction=received`);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading sale details...</p>
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

  if (!currentSale) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Sale not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Sale: {currentSale.saleNumber}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Back to Sales
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
            <h2 className="text-lg font-medium mb-4">Sale Information</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Sale Number
                </span>
                <span className="block mt-1">{currentSale.saleNumber}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Sale Date
                </span>
                <span className="block mt-1">
                  {formatDate(currentSale.saleDate)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Customer
                </span>
                <span className="block mt-1">
                  {typeof currentSale.customer === 'object'
                    ? `${currentSale.customer.firstName} ${currentSale.customer.lastName} (${currentSale.customer.customerNumber})`
                    : 'Unknown Customer'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Location
                </span>
                <span className="block mt-1">
                  {typeof currentSale.location === 'object'
                    ? currentSale.location.name
                    : 'Unknown Location'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Created By
                </span>
                <span className="block mt-1">
                  {typeof currentSale.createdBy === 'object'
                    ? `${currentSale.createdBy.firstName} ${currentSale.createdBy.lastName}`
                    : 'Unknown User'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Created At
                </span>
                <span className="block mt-1">
                  {formatDate(currentSale.createdAt)}
                </span>
              </div>
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
                    <option value={SaleStatus.COMPLETED}>Completed</option>
                    <option value={SaleStatus.PENDING}>Pending</option>
                    <option value={SaleStatus.RETURNED}>Returned</option>
                    <option value={SaleStatus.CANCELLED}>Cancelled</option>
                  </Select>

                  <Select
                    label="Payment Status"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value={PaymentStatus.PAID}>Paid</option>
                    <option value={PaymentStatus.PARTIAL}>Partial</option>
                    <option value={PaymentStatus.UNPAID}>Unpaid</option>
                  </Select>

                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                    <option value="credit">Credit</option>
                    <option value="multiple">Multiple</option>
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
                      {getStatusBadge(currentSale.status)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Payment Status
                    </span>
                    <span className="block mt-1">
                      {getPaymentStatusBadge(currentSale.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Payment Method
                    </span>
                    <span className="block mt-1 capitalize">
                      {currentSale.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Subtotal
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentSale.subtotal)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Discount
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentSale.discount)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Tax
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentSale.tax)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Total
                    </span>
                    <span className="block mt-1 text-lg font-bold">
                      {formatCurrency(currentSale.total)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Notes
                    </span>
                    <span className="block mt-1">
                      {currentSale.notes || 'No notes'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button variant="primary" onClick={handleGenerateReceipt}>
                      Generate Receipt
                    </Button>
                    <Button variant="secondary" onClick={handleCreateInvoice}>
                      Create Invoice
                    </Button>
                    {currentSale.paymentStatus !== PaymentStatus.PAID && (
                      <Button variant="success" onClick={handleReceivePayment}>
                        Receive Payment
                      </Button>
                    )}
                    {currentSale.status === SaleStatus.COMPLETED && (
                      <Button
                        variant="warning"
                        onClick={() =>
                          navigate(`/returns/new?sale=${currentSale._id}`)
                        }
                      >
                        Create Return
                      </Button>
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
          <h2 className="text-lg font-medium mb-4">Sale Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
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
                {currentSale.items.map((item, index) => {
                  const product =
                    typeof item.product === 'object' ? item.product : null;

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product ? product.name : 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.batchNumber}
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
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentSale.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-medium">
                    Discount:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentSale.discount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-medium">
                    Tax:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentSale.tax)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-right font-bold">
                    Total:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {formatCurrency(currentSale.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SaleDetail;
