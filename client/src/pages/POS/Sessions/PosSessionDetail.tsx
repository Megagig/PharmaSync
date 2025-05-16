import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPosSessionById, closePosSession } from '@/store/slices/posSlice';
import { PosSessionStatus } from '@/types/pos.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import TextArea from '@/components/common/TextArea/TextArea';
import Badge from '@/components/common/Badge/Badge';
import Table from '@/components/common/Table/Table';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

const PosSessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSession, isLoading, error } = useSelector(
    (state: RootState) => state.pos
  );
  const { showToast } = useToast();

  const [isClosingSession, setIsClosingSession] = useState(false);
  const [actualClosingBalance, setActualClosingBalance] = useState(0);
  const [closeNotes, setCloseNotes] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchPosSessionById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentSession) {
      setActualClosingBalance(currentSession.expectedClosingBalance);
    }
  }, [currentSession]);

  const handleOpenTerminal = () => {
    if (id) {
      navigate(`/pos/terminal?session=${id}`);
    }
  };

  const handleCloseSession = () => {
    setIsClosingSession(true);
  };

  const handleConfirmClose = async () => {
    if (!id) return;

    try {
      const resultAction = await dispatch(
        closePosSession({
          id,
          closeData: {
            actualClosingBalance,
            notes: closeNotes,
          },
        }) as any
      );

      if (closePosSession.fulfilled.match(resultAction)) {
        showToast('POS session closed successfully', 'success');
        setIsClosingSession(false);
      } else if (resultAction.error) {
        const errorMessage =
          resultAction.error.message || 'Failed to close POS session';
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Failed to close POS session:', error);
      showToast(error.message || 'Failed to close POS session', 'error');
    }
  };

  const transactionColumns = [
    {
      header: 'Transaction #',
      accessor: 'saleNumber',
      cell: (transaction: any) => transaction.saleNumber,
    },
    {
      header: 'Date',
      accessor: 'saleDate',
      cell: (transaction: any) => formatDateTime(transaction.saleDate),
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (transaction: any) => formatCurrency(transaction.total),
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      cell: (transaction: any) => (
        <Badge
          variant={
            transaction.paymentStatus === 'paid'
              ? 'success'
              : transaction.paymentStatus === 'partial'
              ? 'warning'
              : 'error'
          }
        >
          {transaction.paymentStatus}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (transaction: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/pos/transactions/${transaction._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-medium">Session not found</h2>
              <p className="mt-2 text-gray-600">
                The POS session you're looking for doesn't exist or has been removed.
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => navigate('/pos/sessions')}
              >
                Back to Sessions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">POS Session Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/pos/sessions')}>
            Back to Sessions
          </Button>
          {currentSession.status === PosSessionStatus.OPEN && (
            <>
              <Button variant="primary" onClick={handleOpenTerminal}>
                Open Terminal
              </Button>
              <Button variant="danger" onClick={handleCloseSession}>
                Close Session
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Session Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Session Number:</span>
                <p className="font-medium">{currentSession.sessionNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p>
                  <Badge
                    variant={
                      currentSession.status === PosSessionStatus.OPEN
                        ? 'success'
                        : 'info'
                    }
                  >
                    {currentSession.status}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-medium">
                  {typeof currentSession.location === 'object'
                    ? currentSession.location.name
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Register:</span>
                <p className="font-medium">{currentSession.register}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Timing</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Opened By:</span>
                <p className="font-medium">
                  {typeof currentSession.openedBy === 'object'
                    ? `${currentSession.openedBy.firstName} ${currentSession.openedBy.lastName}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Opening Time:</span>
                <p className="font-medium">
                  {formatDateTime(currentSession.openingTime)}
                </p>
              </div>
              {currentSession.status === PosSessionStatus.CLOSED && (
                <>
                  <div>
                    <span className="text-gray-600">Closed By:</span>
                    <p className="font-medium">
                      {typeof currentSession.closedBy === 'object'
                        ? `${currentSession.closedBy.firstName} ${currentSession.closedBy.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Closing Time:</span>
                    <p className="font-medium">
                      {formatDateTime(currentSession.closingTime || '')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Balance</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Opening Balance:</span>
                <p className="font-medium">
                  {formatCurrency(currentSession.openingBalance)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Expected Closing Balance:</span>
                <p className="font-medium">
                  {formatCurrency(currentSession.expectedClosingBalance)}
                </p>
              </div>
              {currentSession.status === PosSessionStatus.CLOSED && (
                <>
                  <div>
                    <span className="text-gray-600">Actual Closing Balance:</span>
                    <p className="font-medium">
                      {formatCurrency(currentSession.actualClosingBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cash Variance:</span>
                    <p
                      className={`font-medium ${
                        (currentSession.cashVariance || 0) < 0
                          ? 'text-red-600'
                          : (currentSession.cashVariance || 0) > 0
                          ? 'text-green-600'
                          : ''
                      }`}
                    >
                      {formatCurrency(currentSession.cashVariance || 0)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {currentSession.notes && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-2">Notes</h2>
            <p>{currentSession.notes}</p>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Transactions</h2>
          <Table
            columns={transactionColumns}
            data={
              Array.isArray(currentSession.transactions)
                ? currentSession.transactions
                : []
            }
            isLoading={isLoading}
            emptyMessage="No transactions found for this session"
          />
        </div>
      </Card>

      {/* Close Session Modal */}
      <Modal
        isOpen={isClosingSession}
        onClose={() => setIsClosingSession(false)}
        title="Close POS Session"
      >
        <div className="space-y-4">
          <p>
            You are about to close this POS session. Please count the cash in the
            drawer and enter the actual closing balance.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="block text-gray-600 mb-1">
                Expected Closing Balance:
              </span>
              <span className="font-medium">
                {formatCurrency(currentSession.expectedClosingBalance)}
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
            />

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
              variant="danger"
              onClick={handleConfirmClose}
              isLoading={isLoading}
            >
              Close Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PosSessionDetail;
