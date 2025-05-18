import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button/Button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import Modal from '@/components/common/Modal/Modal';

interface PosHeaderProps {
  activeSession: any;
  onExitTerminal: () => void;
}

const PosHeader = ({ activeSession, onExitTerminal }: PosHeaderProps) => {
  const navigate = useNavigate();
  const [showSessionInfo, setShowSessionInfo] = useState(false);

  if (!activeSession) return null;

  return (
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
          variant="danger"
          size="sm"
          onClick={onExitTerminal}
        >
          Exit Terminal
        </Button>
      </div>

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
    </div>
  );
};

export default PosHeader;
