import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchPosSessions, deletePosSession } from '@/store/slices/posSlice';
import { PosSessionStatus } from '@/types/pos.types';
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

const PosSessionsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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

    if (dateRange) {
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
    setDateRange(null);
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
          variant={
            session.status === PosSessionStatus.OPEN ? 'success' : 'info'
          }
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
          {session.status === PosSessionStatus.OPEN && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/pos/terminal?session=${session._id}`)}
            >
              Open Terminal
            </Button>
          )}
          {session.status === PosSessionStatus.CLOSED && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteClick(session._id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">POS Sessions</h1>
        <Button variant="primary" onClick={handleCreateSession}>
          Create New Session
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
              <option value={PosSessionStatus.OPEN}>Open</option>
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
              value={dateRange}
              onChange={setDateRange}
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
        title="Confirm Delete"
        size="sm"
      >
        <div className="p-6">
          <p className="mb-6">
            Are you sure you want to delete this POS session? This action cannot
            be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PosSessionsList;
