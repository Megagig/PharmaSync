import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchPosSessions, deletePosSession, createPosSession, closePosSession } from '@/store/slices/posSlice';
import { PosSessionStatus, PosSessionCloseData } from '@/types/pos.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import Modal from '@/components/common/Modal/Modal';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';
import TextArea from '@/components/common/Textarea/Textarea';
import Alert from '@/components/common/Alert/Alert';

const PosSessionsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { sessions, isLoading, error, sessionsMeta } = useSelector(
    (state: RootState) => state.pos
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isReopening, setIsReopening] = useState(false);

  // Close session modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [sessionToClose, setSessionToClose] = useState<any>(null);
  const [actualClosingBalance, setActualClosingBalance] = useState(0);
  const [closeNotes, setCloseNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isClosingSession, setIsClosingSession] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [currentPage, status, location, dateRange]);

  useEffect(() => {
    // Fetch locations for the dropdown
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        if (Array.isArray(response.data.data)) {
          setLocations(response.data.data);
        } else {
          console.error('Unexpected API response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const loadSessions = () => {
    const params: any = {
      page: currentPage,
      limit: 10,
      status,
      location,
    };

    if (dateRange.startDate && dateRange.endDate) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    dispatch(fetchPosSessions(params) as any);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadSessions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setLocation('');
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateSession = () => {
    navigate('/pos/sessions/new');
  };

  const handleViewSession = (id: string) => {
    navigate(`/pos/sessions/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      const resultAction = await dispatch(
        deletePosSession(sessionToDelete) as any
      );

      if (deletePosSession.fulfilled.match(resultAction)) {
        showToast('POS session deleted successfully', 'success');
      } else if (resultAction.error) {
        const errorMessage =
          resultAction.error.message || 'Failed to delete POS session';
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Error deleting POS session:', error);
      showToast(error.message || 'Failed to delete POS session', 'error');
    } finally {
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const handleReopenSession = async (session: any) => {
    try {
      setIsReopening(true);
      const resultAction = await dispatch(createPosSession({
        location: session.location._id,
        register: session.register,
        openingBalance: session.actualClosingBalance || 0,
        notes: `Reopened from session ${session.sessionNumber}`
      }));

      if (createPosSession.fulfilled.match(resultAction)) {
        showToast('Session reopened successfully', 'success');
        navigate(`/pos/terminal?session=${resultAction.payload._id}`);
      } else {
        throw new Error('Failed to reopen session');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to reopen session', 'error');
    } finally {
      setIsReopening(false);
    }
  };

  const handleDateRangeChange = (newDateRange: { startDate: string; endDate: string } | null) => {
    setDateRange(newDateRange || { startDate: '', endDate: '' });
  };

  // Calculate variance and validate
  const variance = sessionToClose ? actualClosingBalance - sessionToClose.expectedClosingBalance : 0;
  const variancePercentage = sessionToClose && sessionToClose.expectedClosingBalance
    ? (variance / sessionToClose.expectedClosingBalance) * 100
    : 0;

  useEffect(() => {
    if (!showCloseModal || !sessionToClose) return;
    if (actualClosingBalance < 0) {
      setValidationError('Closing balance cannot be negative');
    } else if (Math.abs(variancePercentage) > 5) {
      setValidationError(`Warning: Variance is ${variancePercentage.toFixed(2)}% from expected balance`);
    } else {
      setValidationError(null);
    }
  }, [actualClosingBalance, sessionToClose, showCloseModal]);

  const handleOpenCloseModal = (session: any) => {
    setSessionToClose(session);
    setActualClosingBalance(session.totalPayments || 0);
    setCloseNotes('');
    setShowCloseModal(true);
  };

  const handleConfirmCloseSession = async () => {
    if (!sessionToClose) return;
    setIsClosingSession(true);
    try {
      const closeData: PosSessionCloseData = {
        actualClosingBalance,
        notes: closeNotes
      };
      await dispatch(closePosSession({ id: sessionToClose._id, closeData }) as any).unwrap();
      showToast('POS session closed successfully', 'success');
      setShowCloseModal(false);
      setSessionToClose(null);
      loadSessions();
    } catch (error: any) {
      showToast(error.message || 'Failed to close POS session', 'error');
    } finally {
      setIsClosingSession(false);
    }
  };

  const columns = [
    {
      header: 'Session Number',
      accessor: 'sessionNumber',
      cell: (session: any) => session.sessionNumber,
    },
    {
      header: 'Location',
      accessor: 'location',
      cell: (session: any) =>
        typeof session.location === 'object' ? session.location.name : 'N/A',
    },
    {
      header: 'Register',
      accessor: 'register',
      cell: (session: any) => session.register,
    },
    {
      header: 'Opened By',
      accessor: 'openedBy',
      cell: (session: any) =>
        typeof session.openedBy === 'object'
          ? `${session.openedBy.firstName} ${session.openedBy.lastName}`
          : 'N/A',
    },
    {
      header: 'Opening Time',
      accessor: 'openingTime',
      cell: (session: any) => formatDateTime(session.openingTime),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (session: any) => (
        <Badge
          color={session.status === PosSessionStatus.ACTIVE ? 'green' : 'gray'}
        >
          {session.status}
        </Badge>
      ),
    },
    {
      header: 'Opening Balance',
      accessor: 'openingBalance',
      cell: (session: any) => formatCurrency(session.openingBalance),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (session: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewSession(session._id)}
          >
            View
          </Button>
          {(session.status === 'open' || session.status === 'active') && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/pos/terminal?session=${session._id}`)}
              >
                Open Terminal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenCloseModal(session)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Close Session
              </Button>
            </>
          )}
          {session.status === PosSessionStatus.CLOSED && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleReopenSession(session)}
                disabled={isReopening}
              >
                {isReopening ? 'Reopening...' : 'Reopen Session'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(session._id)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">POS Sessions</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/pos/sessions/new')}
        >
          New Session
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value={PosSessionStatus.ACTIVE}>Active</option>
              <option value={PosSessionStatus.CLOSED}>Closed</option>
            </Select>

            <Select
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </Select>

            <DateRangePicker
              label="Date Range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateRangeChange}
            />

            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleSearch}
                className="w-full"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mb-6">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Table
            columns={columns}
            data={sessions}
            isLoading={isLoading}
            emptyMessage="No POS sessions found"
          />

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={sessionsMeta.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Delete POS Session"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this POS session? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirmDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Session Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close POS Session"
      >
        {sessionToClose && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Session Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Session Number:</span>
                  <span className="ml-2 font-medium">{sessionToClose.sessionNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Opened By:</span>
                  <span className="ml-2 font-medium">
                    {typeof sessionToClose.openedBy === 'object'
                      ? `${sessionToClose.openedBy.firstName} ${sessionToClose.openedBy.lastName}`
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Opening Time:</span>
                  <span className="ml-2 font-medium">{formatDateTime(sessionToClose.openingTime)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Opening Balance:</span>
                  <span className="ml-2 font-medium">{formatCurrency(sessionToClose.openingBalance)}</span>
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
                <span className="block text-gray-600 mb-1">Expected Closing Balance:</span>
                <span className="font-medium">{formatCurrency(sessionToClose.expectedClosingBalance)}</span>
              </div>
              <Input
                type="number"
                label="Actual Closing Balance (₦)"
                value={actualClosingBalance}
                onChange={e => setActualClosingBalance(parseFloat(e.target.value))}
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
                onChange={e => setCloseNotes(e.target.value)}
                placeholder="Any notes about the closing (e.g., reason for variance)"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCloseSession}
                disabled={!!validationError && !validationError.includes('Warning') || isClosingSession}
              >
                {isClosingSession ? 'Closing...' : 'Close Session'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PosSessionsList;
