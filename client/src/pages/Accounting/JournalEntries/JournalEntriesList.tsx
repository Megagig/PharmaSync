import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchJournalEntries } from '@/store/slices/accountingSlice';
import { JournalEntryStatus, JournalEntryType } from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

const JournalEntriesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { journalEntries, isLoading, error, meta } = useSelector(
    (state: RootState) => state.accounting
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadJournalEntries();
  }, [currentPage, status, type]);

  const loadJournalEntries = () => {
    const filters: Record<string, any> = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (type) {
      filters.type = type;
    }
    
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    
    dispatch(fetchJournalEntries({ page: currentPage, filters }) as any);
  };

  const handleSearch = () => {
    if (search) {
      dispatch(fetchJournalEntries({ page: 1, filters: { search } }) as any);
    } else {
      loadJournalEntries();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setStartDate('');
    setEndDate('');
    dispatch(fetchJournalEntries({ page: 1 }) as any);
  };

  const getStatusBadge = (status: JournalEntryStatus) => {
    switch (status) {
      case JournalEntryStatus.DRAFT:
        return <Badge color="yellow">{status}</Badge>;
      case JournalEntryStatus.POSTED:
        return <Badge color="green">{status}</Badge>;
      case JournalEntryStatus.REVERSED:
        return <Badge color="red">{status}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Entry Number',
      accessor: 'entryNumber',
      cell: (row: any) => row.entryNumber,
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (row: any) => formatDate(row.date),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row: any) => row.description,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) => (
        <span className="capitalize">{row.type}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'totalDebit',
      cell: (row: any) => formatCurrency(row.totalDebit),
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
            onClick={() => navigate(`/accounting/journal-entries/${row._id}`)}
          >
            View
          </Button>
          {row.status === JournalEntryStatus.DRAFT && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/accounting/journal-entries/${row._id}/edit`)}
            >
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/accounting/journal-entries/new')}
        >
          Create Journal Entry
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Entry number or description"
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(JournalEntryStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.values(JournalEntryType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={journalEntries}
            isLoading={isLoading}
            error={error}
          />
        </div>
        <div className="p-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={meta.pages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
};

export default JournalEntriesList;
