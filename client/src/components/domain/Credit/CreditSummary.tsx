import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchCustomerCreditSummary, updateCreditLimit } from '@/store/slices/creditSlice';
import { CreditTransactionType } from '@/types/credit.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface CreditSummaryProps {
  customerId: string;
}

const CreditSummary: React.FC<CreditSummaryProps> = ({ customerId }) => {
  const dispatch = useDispatch();
  const { creditSummary, isLoading, error } = useSelector((state: RootState) => state.credit);

  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newCreditLimit, setNewCreditLimit] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerCreditSummary(customerId) as any);
    }
  }, [dispatch, customerId]);

  useEffect(() => {
    if (creditSummary) {
      setNewCreditLimit(creditSummary.creditLimit);
    }
  }, [creditSummary]);

  const handleUpdateCreditLimit = async () => {
    if (!reason) {
      alert('Please provide a reason for updating the credit limit');
      return;
    }

    try {
      await dispatch(
        updateCreditLimit({
          customerId,
          updateData: {
            creditLimit: newCreditLimit,
            reason,
          },
        }) as any
      );
      setIsEditingLimit(false);
      setReason('');
    } catch (error) {
      console.error('Failed to update credit limit:', error);
    }
  };

  const getTransactionTypeLabel = (type: CreditTransactionType): string => {
    switch (type) {
      case CreditTransactionType.CREDIT_INCREASE:
        return 'Credit Limit Increase';
      case CreditTransactionType.CREDIT_DECREASE:
        return 'Credit Limit Decrease';
      case CreditTransactionType.SALE_ON_CREDIT:
        return 'Sale on Credit';
      case CreditTransactionType.PAYMENT:
        return 'Payment';
      case CreditTransactionType.CREDIT_ADJUSTMENT:
        return 'Credit Adjustment';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-4 text-red-500">{error}</div>
      </Card>
    );
  }

  if (!creditSummary) {
    return (
      <Card>
        <div className="p-4 text-gray-500">No credit information available</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Credit Summary</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingLimit(true)}
          >
            Update Credit Limit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Credit Limit</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(creditSummary.creditLimit)}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Current Balance</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(creditSummary.currentBalance)}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Available Credit</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(creditSummary.availableCredit)}
            </div>
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-900 mb-2">Recent Transactions</h4>
        {creditSummary.transactions.length === 0 ? (
          <div className="text-gray-500">No recent transactions</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditSummary.transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {getTransactionTypeLabel(transaction.transactionType)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transactionType === CreditTransactionType.PAYMENT ||
                      transaction.transactionType === CreditTransactionType.CREDIT_DECREASE
                        ? `-${formatCurrency(transaction.amount)}`
                        : formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.balance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Limit Update Modal */}
      <Modal
        isOpen={isEditingLimit}
        onClose={() => setIsEditingLimit(false)}
        title="Update Credit Limit"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Credit Limit (₦)"
            value={newCreditLimit}
            onChange={(e) => setNewCreditLimit(Number(e.target.value))}
            min="0"
            step="0.01"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Update
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditingLimit(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateCreditLimit}
              disabled={!reason}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default CreditSummary;
