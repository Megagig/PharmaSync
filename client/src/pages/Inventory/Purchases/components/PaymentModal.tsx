import React from 'react';
import Modal from '@/components/common/Modal/Modal';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import { formatCurrency } from '@/utils/formatters';
import { PaymentMethod } from '@/types/payment.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentAmount: string;
  setPaymentAmount: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  paymentReference: string;
  setPaymentReference: (value: string) => void;
  paymentNotes: string;
  setPaymentNotes: (value: string) => void;
  isSubmittingPayment: boolean;
  onSubmit: () => void;
  // Optional props for displaying context
  totalAmount?: number;
  amountPaid?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
  paymentNotes,
  setPaymentNotes,
  isSubmittingPayment,
  onSubmit,
  totalAmount,
  amountPaid,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
    >
      <div className="space-y-4">
        {/* Payment Summary Information */}
        {totalAmount && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">Total Amount</span>
                <span className="block mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">Amount Paid</span>
                <span className="block mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(amountPaid || 0)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">Remaining</span>
                <span className="block mt-1 text-lg font-semibold text-red-600">
                  {formatCurrency(Math.max(0, (totalAmount || 0) - (amountPaid || 0)))}
                </span>
              </div>
            </div>
          </div>
        )}

        <Input
          type="number"
          label="Payment Amount (₦)"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          required
        >
          <option value={PaymentMethod.CASH}>Cash</option>
          <option value={PaymentMethod.CARD}>Card</option>
          <option value={PaymentMethod.TRANSFER}>Bank Transfer</option>
          <option value={PaymentMethod.CHEQUE}>Cheque</option>
          <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
        </Select>
        <Input
          label="Reference (Optional)"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
        />
        <Input
          label="Notes (Optional)"
          value={paymentNotes}
          onChange={(e) => setPaymentNotes(e.target.value)}
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmittingPayment}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmittingPayment}
          >
            {isSubmittingPayment ? <Spinner size="sm" /> : 'Record Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
