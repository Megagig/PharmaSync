import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  fetchCustomerCreditTransactions, 
  createCreditTransaction 
} from '@/store/slices/creditSlice';
import { CreditTransactionType } from '@/types/credit.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Modal from '@/components/common/Modal/Modal';
import Pagination from '@/components/common/Pagination/Pagination';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface CreditTransactionsProps {
  customerId: string;
}

const CreditTransactions: React.FC<CreditTransactionsProps> = ({ customerId }) => {
  const dispatch = useDispatch();
  const { transactions, isLoading, error, meta } = useSelector((state: RootState) => state.credit);

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<CreditTransactionType>(
    CreditTransactionType.CREDIT_ADJUSTMENT
  );
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (customerId) {
      dispatch(
        fetchCustomerCreditTransactions({
          customerId,
          page: currentPage,
          limit: 10,
        }) as any
      );
    }
  }, [dispatch, customerId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddTransaction = async () => {
    if (!description) {
      alert('Please provide a description for the transaction');
      return;
    }

    if (amount <= 0) {
      alert('Amount must be greater than zero');
      return;
    }

    try {
      await dispatch(
        createCreditTransaction({
          customerId,
          transactionData: {
            transactionType,
            amount,
            description,
            reference: reference || undefined,
          },
        }) as any
      );
      setIsAddingTransaction(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create credit transaction:', error);
    }
  };

  const resetForm = () => {
    setTransactionType(CreditTransactionType.CREDIT_ADJUSTMENT);
    setAmount(0);
    setDescription('');
    setReference('');
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

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Credit Transactions</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingTransaction(true)}
          >
            Add Transaction
          </Button>
        </div>

        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-500">No credit transactions found</div>
        ) : (
          <>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.reference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddingTransaction}
        onClose={() => setIsAddingTransaction(false)}
        title="Add Credit Transaction"
      >
        <div className="space-y-4">
          <Select
            label="Transaction Type"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as CreditTransactionType)}
            required
          >
            <option value={CreditTransactionType.CREDIT_ADJUSTMENT}>Credit Adjustment</option>
            <option value={CreditTransactionType.CREDIT_INCREASE}>Credit Limit Increase</option>
            <option value={CreditTransactionType.CREDIT_DECREASE}>Credit Limit Decrease</option>
          </Select>
          <Input
            type="number"
            label="Amount (₦)"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="0.01"
            step="0.01"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            ></textarea>
          </div>
          <Input
            label="Reference (Optional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Invoice number, receipt number, etc."
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddingTransaction(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTransaction}
              disabled={!description || amount <= 0}
            >
              Add Transaction
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default CreditTransactions;
