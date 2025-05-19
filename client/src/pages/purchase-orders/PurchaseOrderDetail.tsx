import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchPurchaseOrderById,
  approvePurchaseOrder,
  markAsOrdered,
  cancelPurchaseOrder,
  clearCurrentPurchaseOrder,
} from '@/store/slices/purchaseOrderSlice';
import { PurchaseOrderStatus } from '@/types/purchaseOrder.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const PurchaseOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentPurchaseOrder, isLoading, error } = useSelector(
    (state: RootState) => state.purchaseOrders
  );

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchPurchaseOrderById(id) as any);
    }

    return () => {
      dispatch(clearCurrentPurchaseOrder());
    };
  }, [dispatch, id]);

  const handleApprove = async () => {
    if (id && window.confirm('Are you sure you want to approve this purchase order?')) {
      try {
        await dispatch(approvePurchaseOrder(id) as any).unwrap();
        showToast('Purchase order approved successfully', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to approve purchase order', 'error');
      }
    }
  };

  const handleMarkAsOrdered = async () => {
    if (id && window.confirm('Are you sure you want to mark this purchase order as ordered?')) {
      try {
        await dispatch(markAsOrdered(id) as any).unwrap();
        showToast('Purchase order marked as ordered successfully', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to mark purchase order as ordered', 'error');
      }
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showToast('Please provide a reason for cancellation', 'error');
      return;
    }

    if (id) {
      try {
        await dispatch(cancelPurchaseOrder({ id, reason: cancelReason }) as any).unwrap();
        setShowCancelModal(false);
        setCancelReason('');
        showToast('Purchase order cancelled successfully', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to cancel purchase order', 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return <Badge color="gray">Draft</Badge>;
      case PurchaseOrderStatus.PENDING:
        return <Badge color="yellow">Pending</Badge>;
      case PurchaseOrderStatus.APPROVED:
        return <Badge color="blue">Approved</Badge>;
      case PurchaseOrderStatus.ORDERED:
        return <Badge color="indigo">Ordered</Badge>;
      case PurchaseOrderStatus.PARTIAL:
        return <Badge color="purple">Partially Received</Badge>;
      case PurchaseOrderStatus.RECEIVED:
        return <Badge color="green">Received</Badge>;
      case PurchaseOrderStatus.CANCELLED:
        return <Badge color="red">Cancelled</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge color="red">Unpaid</Badge>;
      case 'partial':
        return <Badge color="yellow">Partial</Badge>;
      case 'paid':
        return <Badge color="green">Paid</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!currentPurchaseOrder) {
    return <div className="text-gray-500">Purchase order not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Purchase Order: {currentPurchaseOrder.orderNumber}
          </h1>
          <div className="mt-1 flex items-center space-x-2">
            {getStatusBadge(currentPurchaseOrder.status)}
            {getPaymentStatusBadge(currentPurchaseOrder.paymentStatus)}
          </div>
        </div>
        <div className="flex space-x-3">
          {currentPurchaseOrder.status === PurchaseOrderStatus.DRAFT && (
            <>
              <Button variant="primary" onClick={handleApprove}>
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/purchase-orders/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel
              </Button>
            </>
          )}
          {currentPurchaseOrder.status === PurchaseOrderStatus.APPROVED && (
            <>
              <Button variant="primary" onClick={handleMarkAsOrdered}>
                Mark as Ordered
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel
              </Button>
            </>
          )}
          {(currentPurchaseOrder.status === PurchaseOrderStatus.ORDERED ||
            currentPurchaseOrder.status === PurchaseOrderStatus.PARTIAL) && (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/purchase-orders/${id}/receive`)}
              >
                Receive Items
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/purchase-orders')}
          >
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Purchase Order Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Supplier
                </span>
                <span className="block mt-1">
                  {typeof currentPurchaseOrder.supplier === 'object'
                    ? currentPurchaseOrder.supplier.name
                    : currentPurchaseOrder.supplier}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Order Date
                </span>
                <span className="block mt-1">
                  {formatDate(currentPurchaseOrder.orderDate)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Expected Delivery
                </span>
                <span className="block mt-1">
                  {currentPurchaseOrder.expectedDeliveryDate
                    ? formatDate(currentPurchaseOrder.expectedDeliveryDate)
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Payment Terms
                </span>
                <span className="block mt-1">
                  {currentPurchaseOrder.paymentTerms
                    .replace(/_/g, ' ')
                    .toUpperCase()}
                </span>
              </div>
              {currentPurchaseOrder.deliveryDate && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Delivery Date
                  </span>
                  <span className="block mt-1">
                    {formatDate(currentPurchaseOrder.deliveryDate)}
                  </span>
                </div>
              )}
              {currentPurchaseOrder.notes && (
                <div className="col-span-2">
                  <span className="block text-sm font-medium text-gray-700">
                    Notes
                  </span>
                  <span className="block mt-1">
                    {currentPurchaseOrder.notes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span>{formatCurrency(currentPurchaseOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Discount</span>
                <span>{formatCurrency(currentPurchaseOrder.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax</span>
                <span>{formatCurrency(currentPurchaseOrder.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span>{formatCurrency(currentPurchaseOrder.shippingCost)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(currentPurchaseOrder.total)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subtotal
                  </th>
                  {(currentPurchaseOrder.status === PurchaseOrderStatus.PARTIAL ||
                    currentPurchaseOrder.status === PurchaseOrderStatus.RECEIVED) && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Received
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPurchaseOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {typeof item.medication === 'object'
                        ? item.medication.name
                        : 'Product ID: ' + item.medication}
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
                    {(currentPurchaseOrder.status === PurchaseOrderStatus.PARTIAL ||
                      currentPurchaseOrder.status === PurchaseOrderStatus.RECEIVED) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.receivedQuantity || 0} / {item.quantity}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Purchase Order"
      >
        <div className="space-y-4">
          <p>Are you sure you want to cancel this purchase order?</p>
          <div>
            <label
              htmlFor="cancelReason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for Cancellation
            </label>
            <textarea
              id="cancelReason"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseOrderDetail;
