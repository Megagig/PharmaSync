import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchGeneralLedgerEntries, fetchAccounts } from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import { formatCurrency, formatDate } from '@/utils/formatters';

const GeneralLedgerList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { generalLedgerEntries, accounts, isLoading, error, meta } = useSelector(
    (state: RootState) => state.accounting
  );

  // Filter states
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load accounts for dropdown
    dispatch(fetchAccounts({ limit: 100 }) as any);
    
    loadGeneralLedgerEntries();
  }, [currentPage, accountId]);

  const loadGeneralLedgerEntries = () => {
    const filters: Record<string, any> = {};
    
    if (accountId) {
      filters.account = accountId;
    }
    
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    
    dispatch(fetchGeneralLedgerEntries({ page: currentPage, filters }) as any);
  };

  const handleSearch = () => {
    loadGeneralLedgerEntries();
  };

  const handleClearFilters = () => {
    setAccountId('');
    setStartDate('');
    setEndDate('');
    dispatch(fetchGeneralLedgerEntries({ page: 1 }) as any);
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      cell: (row: any) => formatDate(row.date),
    },
    {
      header: 'Account',
      accessor: 'account',
      cell: (row: any) => (
        typeof row.account === 'object' 
          ? `${row.account.accountNumber} - ${row.account.name}`
          : row.account
      ),
    },
    {
      header: 'Journal Entry',
      accessor: 'journalEntry',
      cell: (row: any) => (
        typeof row.journalEntry === 'object' 
          ? row.journalEntry.entryNumber
          : row.journalEntry
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row: any) => row.description,
    },
    {
      header: 'Reference',
      accessor: 'reference',
      cell: (row: any) => row.reference || '-',
    },
    {
      header: 'Debit',
      accessor: 'debit',
      cell: (row: any) => (row.debit > 0 ? formatCurrency(row.debit) : ''),
    },
    {
      header: 'Credit',
      accessor: 'credit',
      cell: (row: any) => (row.credit > 0 ? formatCurrency(row.credit) : ''),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      cell: (row: any) => formatCurrency(row.balance),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => 
              navigate(`/accounting/journal-entries/${
                typeof row.journalEntry === 'object' 
                  ? row.journalEntry._id
                  : row.journalEntry
              }`)
            }
          >
            View Entry
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/accounting/general-ledger/trial-balance')}
          >
            Trial Balance
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/accounting/journal-entries/new')}
          >
            Create Journal Entry
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.accountNumber} - {account.name}
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
            data={generalLedgerEntries}
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

export default GeneralLedgerList;
