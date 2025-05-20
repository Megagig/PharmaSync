import React, { useState } from 'react';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { formatCurrency } from '@/utils/formatters';

interface PaymentMethod {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface Payment {
  method: string;
  amount: number;
  reference: string;
}

interface PosPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (payments: Payment[]) => void;
  paymentMethods: PaymentMethod[];
}

const PosPayment: React.FC<PosPaymentProps> = ({
  isOpen,
  onClose,
  total,
  onComplete,
  paymentMethods = [],
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate remaining amount
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = total - totalPaid;

  // Handle adding payment
  const handleAddPayment = () => {
    if (!selectedMethod || !amount || Number(amount) <= 0) {
      return;
    }

    const newPayment: Payment = {
      method: selectedMethod,
      amount: Number(amount),
      reference: reference || '',
    };

    setPayments([...payments, newPayment]);
    setSelectedMethod('');
    setAmount('');
    setReference('');
  };

  // Handle removing payment
  const handleRemovePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  // Handle completing payment
  const handleComplete = () => {
    if (totalPaid < total) {
      return;
    }
    onComplete(payments);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment"
      size="lg"
    >
      <div className="space-y-4">
        {/* Payment summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Remaining:</span>
            <span
              className={`text-lg font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'
                }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Add payment form */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Select
              label="Payment Method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="">Select Method</option>
              {paymentMethods
                .filter((method) => method.isActive)
                .map((method) => (
                  <option key={method._id} value={method._id}>
                    {method.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Input
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Input
              type="text"
              label="Reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleAddPayment}
          disabled={!selectedMethod || !amount || Number(amount) <= 0}
        >
          Add Payment
        </Button>

        {/* Payment list */}
        {payments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Payment Details</h3>
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <span className="font-medium">
                      {paymentMethods.find((m) => m._id === payment.method)?.name}
                    </span>
                    {payment.reference && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({payment.reference})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => handleRemovePayment(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={totalPaid < total || isLoading}
          >
            {isLoading ? 'Processing...' : 'Complete Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PosPayment;
