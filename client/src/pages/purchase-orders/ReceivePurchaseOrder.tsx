import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchPurchaseOrderById,
  receivePurchaseOrder,
  clearCurrentPurchaseOrder,
} from '@/store/slices/purchaseOrderSlice';
import { PurchaseOrderStatus, PurchaseOrderReceiveData } from '@/types/purchaseOrder.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const ReceivePurchaseOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentPurchaseOrder, isLoading, error } = useSelector(
    (state: RootState) => state.purchaseOrders
  );

  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [receiveItems, setReceiveItems] = useState<
    {
      itemId: string;
      receivedQuantity: number;
      batchNumber: string;
      expiryDate: string;
      maxQuantity: number;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPurchaseOrderById(id) as any);
    }

    return () => {
      dispatch(clearCurrentPurchaseOrder());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPurchaseOrder && currentPurchaseOrder.items) {
      // Initialize receive items based on purchase order items
      const items = currentPurchaseOrder.items.map((item) => {
        const remainingQuantity = item.quantity - (item.receivedQuantity || 0);
        return {
          itemId: item.id,
          receivedQuantity: remainingQuantity > 0 ? remainingQuantity : 0,
          batchNumber: '',
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
            .toISOString()
            .split('T')[0], // Default to 2 years from now
          maxQuantity: remainingQuantity,
        };
      });
      setReceiveItems(items);
    }
  }, [currentPurchaseOrder]);

  const handleReceiveQuantityChange = (index: number, value: number) => {
    const newItems = [...receiveItems];
    newItems[index].receivedQuantity = Math.min(
      Math.max(0, value), // Ensure value is not negative
      newItems[index].maxQuantity // Ensure value does not exceed max quantity
    );
    setReceiveItems(newItems);
  };

  const handleBatchNumberChange = (index: number, value: string) => {
    const newItems = [...receiveItems];
    newItems[index].batchNumber = value;
    setReceiveItems(newItems);
  };

  const handleExpiryDateChange = (index: number, value: string) => {
    const newItems = [...receiveItems];
    newItems[index].expiryDate = value;
    setReceiveItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const invalidItems = receiveItems.filter(
      (item) => item.receivedQuantity > 0 && !item.batchNumber
    );
    if (invalidItems.length > 0) {
      showToast(
        'Please provide batch numbers for all items being received',
        'error'
      );
      return;
    }

    const invalidDates = receiveItems.filter(
      (item) => item.receivedQuantity > 0 && !item.expiryDate
    );
    if (invalidDates.length > 0) {
      showToast(
        'Please provide expiry dates for all items being received',
        'error'
      );
      return;
    }

    // Check if any items are being received
    const itemsToReceive = receiveItems.filter(
      (item) => item.receivedQuantity > 0
    );
    if (itemsToReceive.length === 0) {
      showToast('Please receive at least one item', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare receive data
      const receiveData: PurchaseOrderReceiveData = {
        deliveryDate,
        items: itemsToReceive.map((item) => ({
          itemId: item.itemId,
          receivedQuantity: item.receivedQuantity,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
        notes,
      };

      // Dispatch receive action
      await dispatch(
        receivePurchaseOrder({ id: id!, receiveData }) as any
      ).unwrap();

      showToast('Purchase order items received successfully', 'success');
      navigate(`/purchase-orders/${id}`);
    } catch (error: any) {
      showToast(
        error.message || 'Failed to receive purchase order items',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !currentPurchaseOrder) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check if purchase order can be received
  if (
    currentPurchaseOrder.status !== PurchaseOrderStatus.ORDERED &&
    currentPurchaseOrder.status !== PurchaseOrderStatus.PARTIAL
  ) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Receive Purchase Order
        </h1>
        <Card>
          <div className="p-6">
            <p className="text-red-500">
              This purchase order cannot be received because its status is{' '}
              {currentPurchaseOrder.status}.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/purchase-orders/${id}`)}
              className="mt-4"
            >
              Back to Purchase Order
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Receive Purchase Order: {currentPurchaseOrder.orderNumber}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate(`/purchase-orders/${id}`)}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Delivery Date"
                value={deliveryDate}
                onChange={(date) => setDeliveryDate(date)}
                required
              />
              <div className="md:col-span-2">
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
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Receive Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previously Received
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receive Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPurchaseOrder.items.map((item, index) => {
                    const remainingQuantity =
                      item.quantity - (item.receivedQuantity || 0);
                    return (
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
                          {item.receivedQuantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="number"
                            value={receiveItems[index]?.receivedQuantity || 0}
                            onChange={(e) =>
                              handleReceiveQuantityChange(
                                index,
                                parseInt(e.target.value)
                              )
                            }
                            min={0}
                            max={remainingQuantity}
                            disabled={remainingQuantity <= 0}
                            className="w-24"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="text"
                            value={receiveItems[index]?.batchNumber || ''}
                            onChange={(e) =>
                              handleBatchNumberChange(index, e.target.value)
                            }
                            disabled={
                              !receiveItems[index] ||
                              receiveItems[index].receivedQuantity <= 0
                            }
                            placeholder="Enter batch number"
                            className="w-40"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="date"
                            value={receiveItems[index]?.expiryDate || ''}
                            onChange={(e) =>
                              handleExpiryDateChange(index, e.target.value)
                            }
                            disabled={
                              !receiveItems[index] ||
                              receiveItems[index].receivedQuantity <= 0
                            }
                            className="w-40"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/purchase-orders/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Receiving...' : 'Receive Items'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReceivePurchaseOrder;
