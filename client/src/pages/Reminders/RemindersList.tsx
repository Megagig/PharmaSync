import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  fetchReminders, 
  generateInvoiceDueReminders, 
  generateInvoiceOverdueReminders 
} from '@/store/slices/remindersSlice';
import { ReminderStatus, ReminderType } from '@/types/reminder.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import Modal from '@/components/common/Modal/Modal';
import { formatDate } from '@/utils/formatters';

const RemindersList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { reminders, isLoading, error, meta } = useSelector((state: RootState) => state.reminders);

  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generationType, setGenerationType] = useState<'due' | 'overdue'>('due');

  useEffect(() => {
    loadReminders();
  }, [currentPage, type, status, dateRange]);

  const loadReminders = () => {
    dispatch(
      fetchReminders({
        page: currentPage,
        limit: 10,
        type,
        status,
        startDate: dateRange?.startDate || '',
        endDate: dateRange?.endDate || '',
      }) as any
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadReminders();
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setStatus('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleGenerateReminders = async (type: 'due' | 'overdue') => {
    setGenerationType(type);
    try {
      const resultAction = await dispatch(
        type === 'due'
          ? generateInvoiceDueReminders() as any
          : generateInvoiceOverdueReminders() as any
      );
      
      if (
        generateInvoiceDueReminders.fulfilled.match(resultAction) ||
        generateInvoiceOverdueReminders.fulfilled.match(resultAction)
      ) {
        setGeneratedCount(resultAction.payload.count);
        setShowGenerateModal(true);
      }
    } catch (error) {
      console.error('Failed to generate reminders:', error);
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case ReminderStatus.SENT:
        return <Badge color="success">Sent</Badge>;
      case ReminderStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case ReminderStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: ReminderType) => {
    switch (type) {
      case ReminderType.INVOICE_DUE:
        return <Badge color="info">Invoice Due</Badge>;
      case ReminderType.INVOICE_OVERDUE:
        return <Badge color="danger">Invoice Overdue</Badge>;
      case ReminderType.PAYMENT_THANK_YOU:
        return <Badge color="success">Payment Thank You</Badge>;
      case ReminderType.CUSTOM:
        return <Badge color="secondary">Custom</Badge>;
      default:
        return <Badge color="default">{type}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Subject',
      accessor: 'subject',
      cell: (row: any) => (
        <span className="font-medium text-primary-600">{row.subject}</span>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) => getTypeBadge(row.type),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row: any) => {
        const customer = row.customer as any;
        return customer ? `${customer.firstName} ${customer.lastName}` : 'N/A';
      },
    },
    {
      header: 'Scheduled Date',
      accessor: 'scheduledDate',
      cell: (row: any) => formatDate(row.scheduledDate),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/reminders/${row._id}`)}
          >
            View
          </Button>
          {row.status === ReminderStatus.PENDING && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/reminders/${row._id}/send`)}
            >
              Send
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Reminders</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleGenerateReminders('due')}
          >
            Generate Due Reminders
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleGenerateReminders('overdue')}
          >
            Generate Overdue Reminders
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/reminders/new')}
          >
            New Reminder
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              label="Search"
              placeholder="Search by subject"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: ReminderType.INVOICE_DUE, label: 'Invoice Due' },
                { value: ReminderType.INVOICE_OVERDUE, label: 'Invoice Overdue' },
                { value: ReminderType.PAYMENT_THANK_YOU, label: 'Payment Thank You' },
                { value: ReminderType.CUSTOM, label: 'Custom' },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: ReminderStatus.PENDING, label: 'Pending' },
                { value: ReminderStatus.SENT, label: 'Sent' },
                { value: ReminderStatus.CANCELLED, label: 'Cancelled' },
              ]}
            />
            <DateRangePicker
              label="Scheduled Date Range"
              startDate={dateRange?.startDate || ''}
              endDate={dateRange?.endDate || ''}
              onDateChange={setDateRange}
            />
          </div>

          <div className="flex justify-end space-x-2 mb-6">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Table
            columns={columns}
            data={reminders}
            isLoading={isLoading}
            emptyMessage="No reminders found"
          />

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>

      {/* Generate Reminders Result Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Reminders Generated"
      >
        <div className="p-4">
          <p className="mb-4">
            {generatedCount === 0
              ? `No new ${generationType === 'due' ? 'due' : 'overdue'} reminders needed at this time.`
              : `Successfully generated ${generatedCount} ${
                  generationType === 'due' ? 'due' : 'overdue'
                } reminders.`}
          </p>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowGenerateModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RemindersList;
