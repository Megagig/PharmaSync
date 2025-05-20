import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closePosSession } from '@/store/slices/posSlice';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/common/Button/Button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import Modal from '@/components/common/Modal/Modal';
import { AppDispatch } from '@/store/store';
import { PosSessionCloseData } from '@/types/pos.types';
import Input from '@/components/common/Input/Input';
import TextArea from '@/components/common/TextArea/TextArea';
import Alert from '@/components/common/Alert/Alert';

interface PosSession {
  _id: string;
  sessionNumber: string;
  openedBy: {
    firstName: string;
    lastName: string;
  };
  location: {
    name: string;
  };
  register: string;
  totalSales: number;
  totalPayments: number;
  status: string;
  openingTime: string;
  openingBalance: number;
  expectedClosingBalance: number;
}

interface PosHeaderProps {
  activeSession: PosSession | null;
  onExitTerminal: () => void;
}

const PosHeader: React.FC<PosHeaderProps> = ({ activeSession, onExitTerminal }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [actualClosingBalance, setActualClosingBalance] = useState(activeSession?.totalPayments ?? 0);
  const [closeNotes, setCloseNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate variance
  const expectedClosing = activeSession?.expectedClosingBalance ?? 0;
  const variance = actualClosingBalance - expectedClosing;
  const variancePercentage = expectedClosing !== 0 ? (variance / expectedClosing) * 100 : 0;

  // Validate closing balance
  useEffect(() => {
    if (actualClosingBalance < 0) {
      setValidationError('Closing balance cannot be negative');
    } else if (Math.abs(variancePercentage) > 5) {
      setValidationError(`Warning: Variance is ${variancePercentage.toFixed(2)}% from expected balance`);
    } else {
      setValidationError(null);
    }
  }, [actualClosingBalance, expectedClosing]);

  const handleCloseSession = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClose = async () => {
    try {
      const closeData: PosSessionCloseData = {
        actualClosingBalance,
        notes: closeNotes
      };

      await dispatch(closePosSession({
        id: activeSession && activeSession._id ? activeSession._id : '',
        closeData
      })).unwrap();

      showToast('POS session closed successfully', 'success');
      setIsClosingSession(false);
      setShowConfirmation(false);
      navigate('/pos/sessions');
    } catch (error: any) {
      showToast(error.message || 'Failed to close POS session', 'error');
    }
  };

  if (!activeSession) return null;

  return (
    <>
      <div className="bg-primary text-white px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">PharmaSync POS</h1>
          <div className="text-sm">
            <span className="opacity-80">Session:</span>{' '}
            <button
              className="font-medium underline"
              onClick={() => setShowSessionInfo(true)}
            >
              {activeSession.sessionNumber}
            </button>
          </div>
          <div className="text-sm">
            <span className="opacity-80">Register:</span>{' '}
            <span className="font-medium">{activeSession.register}</span>
          </div>
          <div className="text-sm">
            <span className="opacity-80">Location:</span>{' '}
            <span className="font-medium">
              {typeof activeSession.location === 'object'
                ? activeSession.location.name
                : 'Unknown'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pos/transactions')}
            className="text-white border-white hover:bg-white hover:text-primary"
          >
            Transactions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pos/returns/process')}
            className="text-white border-white hover:bg-white hover:text-primary"
          >
            Process Return
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/pos/sessions/${activeSession._id}`)}
            className="text-white border-white hover:bg-white hover:text-primary"
          >
            Session Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCloseSession}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Close Session
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExitTerminal}
          >
            Exit Terminal
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Session Closure"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to close this POS session? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowConfirmation(false);
                setIsClosingSession(true);
              }}
            >
              Proceed to Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Closing Modal */}
      <Modal
        isOpen={isClosingSession}
        onClose={() => setIsClosingSession(false)}
        title="Close POS Session"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Session Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Session Number:</span>
                <span className="ml-2 font-medium">{activeSession.sessionNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Opened By:</span>
                <span className="ml-2 font-medium">
                  {activeSession.openedBy.firstName} {activeSession.openedBy.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Opening Time:</span>
                <span className="ml-2 font-medium">
                  {formatDateTime(activeSession.openingTime)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Opening Balance:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(activeSession.openingBalance)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Sales:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(activeSession.totalSales)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Payments:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(activeSession.totalPayments)}
                </span>
              </div>
            </div>
          </div>

          {validationError && (
            <Alert
              type={validationError.includes('Warning') ? 'warning' : 'error'}
              message={validationError}
            />
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="block text-gray-600 mb-1">
                Expected Closing Balance:
              </span>
              <span className="font-medium">
                {formatCurrency(activeSession.expectedClosingBalance)}
              </span>
            </div>

            <Input
              type="number"
              label="Actual Closing Balance (₦)"
              value={actualClosingBalance}
              onChange={(e) => setActualClosingBalance(parseFloat(e.target.value))}
              min="0"
              step="0.01"
              required
              error={validationError && !validationError.includes('Warning') ? validationError : undefined}
            />

            <div>
              <span className="block text-gray-600 mb-1">Variance:</span>
              <span className={`font-medium ${variance !== 0 ? (variance > 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                {formatCurrency(variance)} ({variancePercentage.toFixed(2)}%)
              </span>
            </div>

            <TextArea
              label="Closing Notes"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Any notes about the closing (e.g., reason for variance)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsClosingSession(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmClose}
              disabled={!!validationError && !validationError.includes('Warning')}
            >
              Close Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Session Info Modal */}
      <Modal
        isOpen={showSessionInfo}
        onClose={() => setShowSessionInfo(false)}
        title="POS Session Information"
      >
        <div className="space-y-4">
          <div>
            <span className="block text-gray-600 mb-1">Session Number:</span>
            <span className="font-medium">{activeSession.sessionNumber}</span>
          </div>

          <div>
            <span className="block text-gray-600 mb-1">Location:</span>
            <span className="font-medium">
              {typeof activeSession.location === 'object'
                ? activeSession.location.name
                : 'Unknown'}
            </span>
          </div>

          <div>
            <span className="block text-gray-600 mb-1">Register:</span>
            <span className="font-medium">{activeSession.register}</span>
          </div>

          <div>
            <span className="block text-gray-600 mb-1">Opened By:</span>
            <span className="font-medium">
              {typeof activeSession.openedBy === 'object'
                ? `${activeSession.openedBy.firstName} ${activeSession.openedBy.lastName}`
                : 'Unknown'}
            </span>
          </div>

          <div>
            <span className="block text-gray-600 mb-1">Opening Time:</span>
            <span className="font-medium">
              {formatDateTime(activeSession.openingTime)}
            </span>
          </div>

          <div>
            <span className="block text-gray-600 mb-1">Opening Balance:</span>
            <span className="font-medium">
              {formatCurrency(activeSession.openingBalance)}
            </span>
          </div>

          <div>
            <span className="block text-gray-600 mb-1">Current Balance:</span>
            <span className="font-medium">
              {formatCurrency(activeSession.expectedClosingBalance)}
            </span>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={() => {
                setShowSessionInfo(false);
                navigate(`/pos/sessions/${activeSession._id}`);
              }}
            >
              View Full Details
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PosHeader;
