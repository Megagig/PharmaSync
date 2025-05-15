import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPaymentById, updatePayment } from '@/store/slices/paymentsSlice';
import { PaymentMethod, PaymentDirection } from '@/types/payment.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

const PaymentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPayment, isLoading, error } = useSelector(
    (state: RootState) => state.payments
  );

  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchPaymentById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPayment) {
      setAmount(currentPayment.amount);
      setPaymentDate(currentPayment.paymentDate);
      setPaymentMethod(currentPayment.paymentMethod);
      setReference(currentPayment.reference || '');
      setNotes(currentPayment.notes || '');
    }
  }, [currentPayment]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values
    if (currentPayment) {
      setAmount(currentPayment.amount);
      setPaymentDate(currentPayment.paymentDate);
      setPaymentMethod(currentPayment.paymentMethod);
      setReference(currentPayment.reference || '');
      setNotes(currentPayment.notes || '');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await dispatch(
        updatePayment({
          id,
          updateData: {
            amount,
            paymentDate,
            paymentMethod: paymentMethod as PaymentMethod,
            reference,
            notes,
          },
        }) as any
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  const handlePrintReceipt = () => {
    if (id) {
      navigate(`/payments/${id}/receipt`);
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading payment details...</p>
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
        Payment not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment: {currentPayment.paymentNumber}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/payments')}>
            Back to Payments
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
            <h2 className="text-lg font-medium mb-4">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Payment Number
                </span>
                <span className="block mt-1">
                  {currentPayment.paymentNumber}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Direction
                </span>
                <span className="block mt-1">
                  {getDirectionBadge(currentPayment.direction)}
                </span>
              </div>
              {isEditing ? (
                <>
                  <Input
                    type="number"
                    label="Amount (₦)"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="0.01"
                    step="0.01"
                    required
                  />

                  <DatePicker
                    label="Payment Date"
                    value={paymentDate}
                    onChange={(date) => setPaymentDate(date)}
                    required
                  />

                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.CARD}>Card</option>
                    <option value={PaymentMethod.TRANSFER}>Transfer</option>
                    <option value={PaymentMethod.CHEQUE}>Cheque</option>
                    <option value={PaymentMethod.MOBILE_MONEY}>
                      Mobile Money
                    </option>
                    <option value={PaymentMethod.CREDIT}>Credit</option>
                  </Select>

                  <Input
                    label="Reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Transaction ID, Cheque Number, etc."
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
                      Amount
                    </span>
                    <span className="block mt-1 text-lg font-bold">
                      {formatCurrency(currentPayment.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Payment Date
                    </span>
                    <span className="block mt-1">
                      {formatDate(currentPayment.paymentDate)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Payment Method
                    </span>
                    <span className="block mt-1">
                      {getPaymentMethodBadge(currentPayment.paymentMethod)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Reference
                    </span>
                    <span className="block mt-1">
                      {currentPayment.reference || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Notes
                    </span>
                    <span className="block mt-1">
                      {currentPayment.notes || 'No notes'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Created By
                    </span>
                    <span className="block mt-1">
                      {typeof currentPayment.createdBy === 'object'
                        ? `${currentPayment.createdBy.firstName} ${currentPayment.createdBy.lastName}`
                        : 'Unknown User'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Created At
                    </span>
                    <span className="block mt-1">
                      {formatDate(currentPayment.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button variant="primary" onClick={handlePrintReceipt}>
                      Print Receipt
                    </Button>
                    {currentPayment.direction === PaymentDirection.RECEIVED &&
                      currentPayment.customer && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/reminders/new?payment=${id}&type=payment_thank_you&customer=${
                                typeof currentPayment.customer === 'object'
                                  ? currentPayment.customer._id
                                  : currentPayment.customer
                              }`
                            )
                          }
                        >
                          Send Thank You
                        </Button>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Related Information</h2>
            <div className="space-y-4">
              {currentPayment.customer && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Customer
                  </span>
                  <span className="block mt-1">
                    {typeof currentPayment.customer === 'object'
                      ? `${currentPayment.customer.firstName} ${currentPayment.customer.lastName} (${currentPayment.customer.customerNumber})`
                      : 'Unknown Customer'}
                  </span>
                </div>
              )}

              {currentPayment.supplier && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Supplier
                  </span>
                  <span className="block mt-1">
                    {typeof currentPayment.supplier === 'object'
                      ? `${currentPayment.supplier.name} (${currentPayment.supplier.supplierCode})`
                      : 'Unknown Supplier'}
                  </span>
                </div>
              )}

              {currentPayment.invoice && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Invoice
                  </span>
                  <span className="block mt-1">
                    {typeof currentPayment.invoice === 'object'
                      ? `${currentPayment.invoice.invoiceNumber} (${formatDate(
                          currentPayment.invoice.invoiceDate
                        )})`
                      : 'Unknown Invoice'}
                  </span>
                  {typeof currentPayment.invoice === 'object' && (
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/invoices/${currentPayment.invoice._id}`)
                        }
                      >
                        View Invoice
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {currentPayment.sale && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Sale
                  </span>
                  <span className="block mt-1">
                    {typeof currentPayment.sale === 'object'
                      ? `${currentPayment.sale.saleNumber} (${formatDate(
                          currentPayment.sale.saleDate
                        )})`
                      : 'Unknown Sale'}
                  </span>
                  {typeof currentPayment.sale === 'object' && (
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/sales/${currentPayment.sale._id}`)
                        }
                      >
                        View Sale
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {currentPayment.purchaseOrder && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Purchase Order
                  </span>
                  <span className="block mt-1">
                    {typeof currentPayment.purchaseOrder === 'object'
                      ? `${
                          currentPayment.purchaseOrder.orderNumber
                        } (${formatDate(
                          currentPayment.purchaseOrder.orderDate
                        )})`
                      : 'Unknown Purchase Order'}
                  </span>
                  {typeof currentPayment.purchaseOrder === 'object' && (
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/inventory/purchases/${currentPayment.purchaseOrder._id}`
                          )
                        }
                      >
                        View Purchase Order
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!currentPayment.customer &&
                !currentPayment.supplier &&
                !currentPayment.invoice &&
                !currentPayment.sale &&
                !currentPayment.purchaseOrder && (
                  <div className="text-gray-500">
                    No related information available
                  </div>
                )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentDetail;
