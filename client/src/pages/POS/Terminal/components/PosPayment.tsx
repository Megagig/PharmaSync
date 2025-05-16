import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { formatCurrency } from '@/utils/formatters';

interface PosPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (paymentMethods: any[]) => void;
}

const PosPayment = ({ isOpen, onClose, total, onComplete }: PosPaymentProps) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [currentMethod, setCurrentMethod] = useState('cash');
  const [currentAmount, setCurrentAmount] = useState(total);
  const [reference, setReference] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  
  const [totalPaid, setTotalPaid] = useState(0);
  const [changeDue, setChangeDue] = useState(0);
  const [remaining, setRemaining] = useState(total);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setPaymentMethods([]);
      setCurrentMethod('cash');
      setCurrentAmount(total);
      setReference('');
      setCardType('');
      setCardLast4('');
      setTotalPaid(0);
      setChangeDue(0);
      setRemaining(total);
    }
  }, [isOpen, total]);

  useEffect(() => {
    // Calculate totals when payment methods change
    const newTotalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
    setTotalPaid(newTotalPaid);
    
    const newRemaining = Math.max(0, total - newTotalPaid);
    setRemaining(newRemaining);
    
    const newChangeDue = Math.max(0, newTotalPaid - total);
    setChangeDue(newChangeDue);
    
    // Update current amount to remaining if there's still an amount to pay
    if (newRemaining > 0) {
      setCurrentAmount(newRemaining);
    }
  }, [paymentMethods, total]);

  const handleAddPaymentMethod = () => {
    if (currentAmount <= 0) {
      return;
    }

    const newPaymentMethod: any = {
      method: currentMethod,
      amount: currentAmount,
    };

    if (currentMethod === 'card') {
      newPaymentMethod.cardType = cardType;
      newPaymentMethod.cardLast4 = cardLast4;
      newPaymentMethod.reference = reference;
    } else if (currentMethod === 'transfer') {
      newPaymentMethod.reference = reference;
    }

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    
    // Reset form for next payment method
    setReference('');
    setCardType('');
    setCardLast4('');
  };

  const handleRemovePaymentMethod = (index: number) => {
    const newPaymentMethods = [...paymentMethods];
    newPaymentMethods.splice(index, 1);
    setPaymentMethods(newPaymentMethods);
  };

  const handleComplete = () => {
    if (totalPaid < total) {
      return; // Cannot complete if not fully paid
    }
    
    onComplete(paymentMethods);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment"
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-4">Add Payment Method</h3>
          
          <div className="space-y-4">
            <Select
              label="Payment Method"
              value={currentMethod}
              onChange={(e) => setCurrentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Bank Transfer</option>
              <option value="credit">Credit</option>
            </Select>
            
            <Input
              type="number"
              label="Amount (₦)"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(Number(e.target.value))}
              min="0"
              step="0.01"
            />
            
            {currentMethod === 'card' && (
              <>
                <Select
                  label="Card Type"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                >
                  <option value="">Select Card Type</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="verve">Verve</option>
                  <option value="other">Other</option>
                </Select>
                
                <Input
                  type="text"
                  label="Last 4 Digits"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  maxLength={4}
                  placeholder="e.g., 1234"
                />
                
                <Input
                  type="text"
                  label="Reference/Authorization"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., Transaction ID"
                />
              </>
            )}
            
            {currentMethod === 'transfer' && (
              <Input
                type="text"
                label="Reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., Transfer Reference"
              />
            )}
            
            <Button
              variant="primary"
              onClick={handleAddPaymentMethod}
              disabled={currentAmount <= 0}
              className="w-full"
            >
              Add Payment Method
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Payment Summary</h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <span>Total Amount:</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Total Paid:</span>
              <span className="font-medium">{formatCurrency(totalPaid)}</span>
            </div>
            {remaining > 0 ? (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Remaining:</span>
                <span>{formatCurrency(remaining)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Change Due:</span>
                <span>{formatCurrency(changeDue)}</span>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Payment Methods</h4>
            {paymentMethods.length === 0 ? (
              <p className="text-gray-500 text-sm">No payment methods added yet</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white p-2 border rounded-md"
                  >
                    <div>
                      <div className="font-medium capitalize">{method.method}</div>
                      {method.reference && (
                        <div className="text-xs text-gray-600">Ref: {method.reference}</div>
                      )}
                      {method.cardType && (
                        <div className="text-xs text-gray-600">
                          {method.cardType} **** {method.cardLast4}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">{formatCurrency(method.amount)}</span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemovePaymentMethod(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={totalPaid < total}
            >
              Complete Payment
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PosPayment;
