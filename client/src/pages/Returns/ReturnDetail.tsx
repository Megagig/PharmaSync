import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  fetchReturnById, 
  updateReturn, 
  approveReturn, 
  processRefund 
} from '@/store/slices/returnsSlice';
import { ReturnStatus, RefundStatus } from '@/types/return.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

const ReturnDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentReturn, isLoading, error } = useSelector((state: RootState) => state.returns);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  
  // Refund form state
  const [refundStatus, setRefundStatus] = useState(RefundStatus.PENDING);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState<'cash' | 'card' | 'transfer' | 'credit' | 'store_credit'>('cash');
  const [refundReference, setRefundReference] = useState('');
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0]);
  const [refundNotes, setRefundNotes] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchReturnById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentReturn) {
      setStatus(currentReturn.status);
      setNotes(currentReturn.notes || '');
      setRefundAmount(currentReturn.total);
    }
  }, [currentReturn]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values
    if (currentReturn) {
      setStatus(currentReturn.status);
      setNotes(currentReturn.notes || '');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await dispatch(
        updateReturn({
          id,
          updateData: {
            status: status as ReturnStatus,
            notes,
          },
        }) as any
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update return:', error);
    }
  };

  const handleApprove = async () => {
    if (!id || !user) return;

    try {
      await dispatch(
        approveReturn({
          id,
          approveData: {
            approvedBy: user.id,
            notes: `Approved by ${user.firstName} ${user.lastName}`,
          },
        }) as any
      );
    } catch (error) {
      console.error('Failed to approve return:', error);
    }
  };

  const handleProcessRefund = () => {
    setIsProcessingRefund(true);
  };

  const handleCancelRefund = () => {
    setIsProcessingRefund(false);
  };

  const handleSaveRefund = async () => {
    if (!id) return;

    try {
      await dispatch(
        processRefund({
          id,
          refundData: {
            refundStatus,
            refundAmount,
            refundMethod,
            refundReference,
            refundDate,
            notes: refundNotes,
          },
        }) as any
      );
      setIsProcessingRefund(false);
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.COMPLETED:
        return <Badge color="success">Completed</Badge>;
      case ReturnStatus.APPROVED:
        return <Badge color="info">Approved</Badge>;
      case ReturnStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case ReturnStatus.REJECTED:
        return <Badge color="danger">Rejected</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const getRefundStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.PROCESSED:
        return <Badge color="success">Processed</Badge>;
      case RefundStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case RefundStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading return details...</p>
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

  if (!currentReturn) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        Return not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Return: {currentReturn.returnNumber}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/returns')}>
            Back to Returns
          </Button>
          {!isEditing && !isProcessingRefund && (
            <Button variant="primary" onClick={handleEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Return Information</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Return Number
                </span>
                <span className="block mt-1">{currentReturn.returnNumber}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Return Date
                </span>
                <span className="block mt-1">
                  {formatDate(currentReturn.returnDate)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Customer
                </span>
                <span className="block mt-1">
                  {typeof currentReturn.customer === 'object'
                    ? `${currentReturn.customer.firstName} ${currentReturn.customer.lastName} (${currentReturn.customer.customerNumber})`
                    : 'Unknown Customer'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Related Sale
                </span>
                <span className="block mt-1">
                  {typeof currentReturn.sale === 'object'
                    ? `${currentReturn.sale.saleNumber} (${formatDate(currentReturn.sale.saleDate)})`
                    : 'Unknown Sale'}
                </span>
                {typeof currentReturn.sale === 'object' && (
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/sales/${currentReturn.sale._id}`)}
                    >
                      View Sale
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Created By
                </span>
                <span className="block mt-1">
                  {typeof currentReturn.createdBy === 'object'
                    ? `${currentReturn.createdBy.firstName} ${currentReturn.createdBy.lastName}`
                    : 'Unknown User'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Created At
                </span>
                <span className="block mt-1">
                  {formatDate(currentReturn.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Status & Refund</h2>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value={ReturnStatus.PENDING}>Pending</option>
                    <option value={ReturnStatus.APPROVED}>Approved</option>
                    <option value={ReturnStatus.COMPLETED}>Completed</option>
                    <option value={ReturnStatus.REJECTED}>Rejected</option>
                  </Select>

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
              ) : isProcessingRefund ? (
                <>
                  <Select
                    label="Refund Status"
                    value={refundStatus}
                    onChange={(e) => setRefundStatus(e.target.value as RefundStatus)}
                  >
                    <option value={RefundStatus.PROCESSED}>Processed</option>
                    <option value={RefundStatus.CANCELLED}>Cancelled</option>
                  </Select>

                  <Input
                    type="number"
                    label="Refund Amount (₦)"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />

                  <Select
                    label="Refund Method"
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                    <option value="credit">Credit</option>
                    <option value="store_credit">Store Credit</option>
                  </Select>

                  <Input
                    label="Reference"
                    value={refundReference}
                    onChange={(e) => setRefundReference(e.target.value)}
                    placeholder="Transaction ID, Receipt Number, etc."
                  />

                  <DatePicker
                    label="Refund Date"
                    value={refundDate}
                    onChange={(date) => setRefundDate(date)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={refundNotes}
                      onChange={(e) => setRefundNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancelRefund}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveRefund}>
                      Process Refund
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
                      {getStatusBadge(currentReturn.status)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Refund Status
                    </span>
                    <span className="block mt-1">
                      {getRefundStatusBadge(currentReturn.refundStatus)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Subtotal
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentReturn.subtotal)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Tax
                    </span>
                    <span className="block mt-1">
                      {formatCurrency(currentReturn.tax)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Total
                    </span>
                    <span className="block mt-1 text-lg font-bold">
                      {formatCurrency(currentReturn.total)}
                    </span>
                  </div>
                  {currentReturn.refundStatus === RefundStatus.PROCESSED && (
                    <>
                      <div>
                        <span className="block text-sm font-medium text-gray-700">
                          Refund Amount
                        </span>
                        <span className="block mt-1 font-semibold">
                          {formatCurrency(currentReturn.refundAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700">
                          Refund Method
                        </span>
                        <span className="block mt-1 capitalize">
                          {currentReturn.refundMethod || 'N/A'}
                        </span>
                      </div>
                      {currentReturn.refundReference && (
                        <div>
                          <span className="block text-sm font-medium text-gray-700">
                            Reference
                          </span>
                          <span className="block mt-1">
                            {currentReturn.refundReference}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="block text-sm font-medium text-gray-700">
                          Refund Date
                        </span>
                        <span className="block mt-1">
                          {currentReturn.refundDate ? formatDate(currentReturn.refundDate) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700">
                          Processed By
                        </span>
                        <span className="block mt-1">
                          {typeof currentReturn.processedBy === 'object'
                            ? `${currentReturn.processedBy.firstName} ${currentReturn.processedBy.lastName}`
                            : 'Unknown User'}
                        </span>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Notes
                    </span>
                    <span className="block mt-1">
                      {currentReturn.notes || 'No notes'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {currentReturn.status === ReturnStatus.PENDING && (
                      <Button variant="primary" onClick={handleApprove}>
                        Approve Return
                      </Button>
                    )}
                    {currentReturn.status === ReturnStatus.APPROVED && 
                     currentReturn.refundStatus === RefundStatus.PENDING && (
                      <Button variant="success" onClick={handleProcessRefund}>
                        Process Refund
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
          <h2 className="text-lg font-medium mb-4">Return Items</h2>
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
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return to Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReturn.items.map((item, index) => {
                  const product = typeof item.product === 'object' ? item.product : null;
                  
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
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-6 py-4">
                        {item.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {item.condition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.returnToStock ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentReturn.subtotal)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">
                    Tax:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(currentReturn.tax)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-bold">
                    Total:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {formatCurrency(currentReturn.total)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReturnDetail;
