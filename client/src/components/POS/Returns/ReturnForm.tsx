import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import CustomerSearch from '@/components/common/CustomerSearch/CustomerSearch';
import { useToast } from '@/hooks/useToast';
import PosReturnService from '@/services/posReturn.service';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ReturnFormProps {
  onComplete?: (returnData: any) => void;
}

const ReturnForm: React.FC<ReturnFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [returnableDays, setReturnableDays] = useState<number>(30);
  const [returnableTransactions, setReturnableTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);

  // Transaction state
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Return state
  const [returnType, setReturnType] = useState<'full' | 'partial'>('full');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [returnReason, setReturnReason] = useState<string>('');
  const [returnReasonDetails, setReturnReasonDetails] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [notes, setNotes] = useState<string>('');

  // Load returnable transactions when customer changes
  useEffect(() => {
    if (selectedCustomer && selectedCustomer._id) {
      fetchReturnableTransactions();
    } else {
      setReturnableTransactions([]);
      setSelectedTransaction(null);
      setTransactionDetails(null);
    }
  }, [selectedCustomer, returnableDays]);

  // Load transaction details when transaction changes
  useEffect(() => {
    if (selectedTransaction) {
      fetchTransactionDetails();
    } else {
      setTransactionDetails(null);
      setSelectedItems([]);
    }
  }, [selectedTransaction]);

  // Fetch returnable transactions for the selected customer
  const fetchReturnableTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const transactions = await PosReturnService.getReturnableTransactions(
        selectedCustomer._id,
        returnableDays
      );
      setReturnableTransactions(transactions);
      setLoadingTransactions(false);
    } catch (error) {
      console.error('Error fetching returnable transactions:', error);
      showToast('Failed to fetch returnable transactions', 'error');
      setLoadingTransactions(false);
    }
  };

  // Fetch transaction details for the selected transaction
  const fetchTransactionDetails = async () => {
    try {
      setLoadingDetails(true);
      const details = await PosReturnService.getTransactionForReturn(
        selectedTransaction._id
      );
      setTransactionDetails(details);
      
      // Initialize selected items for full return
      if (returnType === 'full') {
        setSelectedItems(details.items.map((item: any) => ({
          ...item,
          originalItemId: item._id,
          returnQuantity: item.quantity,
          selected: true,
        })));
      } else {
        setSelectedItems([]);
      }
      
      setLoadingDetails(false);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      showToast('Failed to fetch transaction details', 'error');
      setLoadingDetails(false);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedTransaction(null);
  };

  // Handle transaction selection
  const handleTransactionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const transactionId = e.target.value;
    if (!transactionId) {
      setSelectedTransaction(null);
      return;
    }
    
    const transaction = returnableTransactions.find(t => t._id === transactionId);
    setSelectedTransaction(transaction);
  };

  // Handle return type change
  const handleReturnTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'full' | 'partial';
    setReturnType(type);
    
    if (transactionDetails) {
      if (type === 'full') {
        // Select all items for full return
        setSelectedItems(transactionDetails.items.map((item: any) => ({
          ...item,
          originalItemId: item._id,
          returnQuantity: item.quantity,
          selected: true,
        })));
      } else {
        // Clear selection for partial return
        setSelectedItems([]);
      }
    }
  };

  // Handle item selection for partial return
  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (returnType === 'partial') {
      if (selected) {
        // Add item to selected items
        const item = transactionDetails.items.find((i: any) => i._id === itemId);
        if (item) {
          setSelectedItems([
            ...selectedItems,
            {
              ...item,
              originalItemId: item._id,
              returnQuantity: item.quantity,
              selected: true,
            },
          ]);
        }
      } else {
        // Remove item from selected items
        setSelectedItems(selectedItems.filter(item => item.originalItemId !== itemId));
      }
    }
  };

  // Handle item quantity change for partial return
  const handleQuantityChange = (itemId: string, quantity: number) => {
    const updatedItems = selectedItems.map(item => {
      if (item.originalItemId === itemId) {
        return {
          ...item,
          returnQuantity: quantity,
        };
      }
      return item;
    });
    setSelectedItems(updatedItems);
  };

  // Process return
  const handleProcessReturn = async () => {
    try {
      if (!selectedTransaction) {
        showToast('Please select a transaction to return', 'error');
        return;
      }
      
      if (!returnReason) {
        showToast('Please select a return reason', 'error');
        return;
      }
      
      if (returnType === 'partial' && selectedItems.length === 0) {
        showToast('Please select at least one item to return', 'error');
        return;
      }
      
      // Prepare payment methods
      const paymentMethods = [
        {
          method: paymentMethod,
          amount: calculateTotalRefund(),
        },
      ];
      
      let returnData;
      let result;
      
      if (returnType === 'full') {
        // Process full return
        returnData = {
          originalTransactionId: selectedTransaction._id,
          returnReason,
          returnReasonDetails,
          paymentMethods,
          notes,
        };
        
        result = await PosReturnService.processFullReturn(returnData);
      } else {
        // Process partial return
        const returnItems = selectedItems.map(item => ({
          originalItemId: item.originalItemId,
          product: item.product._id,
          quantity: item.returnQuantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        }));
        
        returnData = {
          originalTransactionId: selectedTransaction._id,
          returnItems,
          returnReason,
          returnReasonDetails,
          paymentMethods,
          notes,
        };
        
        result = await PosReturnService.processPartialReturn(returnData);
      }
      
      showToast('Return processed successfully', 'success');
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(result);
      } else {
        // Navigate to return details
        navigate(`/pos/returns/${result._id}`);
      }
    } catch (error) {
      console.error('Error processing return:', error);
      showToast('Failed to process return', 'error');
    }
  };

  // Calculate total refund amount
  const calculateTotalRefund = () => {
    if (!transactionDetails) return 0;
    
    if (returnType === 'full') {
      return transactionDetails.total;
    } else {
      // Calculate total for selected items
      return selectedItems.reduce((total, item) => {
        const itemTotal = (item.unitPrice * item.returnQuantity) - 
                         ((item.discount || 0) * (item.returnQuantity / item.quantity));
        return total + itemTotal;
      }, 0);
    }
  };

  return (
    <div className="return-form">
      <Card className="mb-4">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Process Return</h2>
          
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <CustomerSearch
              value={selectedCustomer}
              onChange={handleCustomerSelect}
              placeholder="Search for customer..."
            />
          </div>
          
          {/* Return Period */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Period (Days)
            </label>
            <Input
              type="number"
              value={returnableDays}
              onChange={(e) => setReturnableDays(Number(e.target.value))}
              min={1}
              max={365}
            />
          </div>
          
          {/* Transaction Selection */}
          {selectedCustomer && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Transaction
              </label>
              {loadingTransactions ? (
                <p>Loading transactions...</p>
              ) : returnableTransactions.length === 0 ? (
                <p>No returnable transactions found for this customer.</p>
              ) : (
                <Select
                  value={selectedTransaction?._id || ''}
                  onChange={handleTransactionSelect}
                >
                  <option value="">Select a transaction</option>
                  {returnableTransactions.map((transaction) => (
                    <option key={transaction._id} value={transaction._id}>
                      {transaction.saleNumber} - {formatDate(transaction.saleDate)} - {formatCurrency(transaction.total)}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          )}
          
          {/* Return Type */}
          {selectedTransaction && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Type
              </label>
              <Select
                value={returnType}
                onChange={handleReturnTypeChange}
              >
                <option value="full">Full Return</option>
                <option value="partial">Partial Return</option>
              </Select>
            </div>
          )}
        </div>
      </Card>
      
      {/* Transaction Details */}
      {selectedTransaction && transactionDetails && (
        <Card className="mb-4">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Transaction #:</strong> {transactionDetails.saleNumber}</p>
                <p><strong>Date:</strong> {formatDate(transactionDetails.saleDate)}</p>
                <p><strong>Total:</strong> {formatCurrency(transactionDetails.total)}</p>
              </div>
              <div>
                <p><strong>Customer:</strong> {transactionDetails.customer?.firstName} {transactionDetails.customer?.lastName}</p>
                <p><strong>Cashier:</strong> {transactionDetails.cashier?.firstName} {transactionDetails.cashier?.lastName}</p>
                <p><strong>Location:</strong> {transactionDetails.location?.name}</p>
              </div>
            </div>
            
            {/* Items */}
            <h4 className="font-medium mb-2">Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {returnType === 'partial' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionDetails.items.map((item: any) => {
                    const selectedItem = selectedItems.find(i => i.originalItemId === item._id);
                    const isSelected = !!selectedItem;
                    
                    return (
                      <tr key={item._id}>
                        {returnType === 'partial' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => handleItemSelect(item._id, e.target.checked)}
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {returnType === 'partial' && isSelected ? (
                            <Input
                              type="number"
                              value={selectedItem.returnQuantity}
                              onChange={(e) => handleQuantityChange(item._id, Number(e.target.value))}
                              min={1}
                              max={item.quantity}
                              className="w-20"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
      
      {/* Return Details */}
      {selectedTransaction && transactionDetails && (
        <Card className="mb-4">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Return Details</h3>
            
            {/* Return Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Reason
              </label>
              <Select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
                <option value="wrong_item">Wrong Item</option>
                <option value="customer_dissatisfied">Customer Dissatisfied</option>
                <option value="adverse_reaction">Adverse Reaction</option>
                <option value="prescription_change">Prescription Change</option>
                <option value="other">Other</option>
              </Select>
            </div>
            
            {/* Return Reason Details */}
            {returnReason === 'other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason Details
                </label>
                <Input
                  type="text"
                  value={returnReasonDetails}
                  onChange={(e) => setReturnReasonDetails(e.target.value)}
                  placeholder="Please provide details..."
                  required
                />
              </div>
            )}
            
            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Method
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="store_credit">Store Credit</option>
              </Select>
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
            
            {/* Total Refund */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Refund
              </label>
              <div className="text-xl font-bold">
                {formatCurrency(calculateTotalRefund())}
              </div>
            </div>
            
            {/* Process Return Button */}
            <Button
              variant="primary"
              onClick={handleProcessReturn}
              disabled={!selectedTransaction || !returnReason || (returnType === 'partial' && selectedItems.length === 0)}
              className="w-full"
            >
              Process Return
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReturnForm;
