import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchAccounts } from '@/store/slices/accountingSlice';
import { AccountType, AccountCategory, AccountStatus } from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency } from '@/utils/formatters';

const AccountsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accounts, isLoading, error, meta } = useSelector(
    (state: RootState) => state.accounting
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAccounts();
  }, [currentPage, type, category, status]);

  const loadAccounts = () => {
    const filters: Record<string, any> = {};
    
    if (type) {
      filters.type = type;
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (status) {
      filters.status = status;
    }
    
    dispatch(fetchAccounts({ page: currentPage, filters }) as any);
  };

  const handleSearch = () => {
    if (search) {
      dispatch(fetchAccounts({ page: 1, filters: { search } }) as any);
    } else {
      loadAccounts();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setCategory('');
    setStatus('');
    dispatch(fetchAccounts({ page: 1 }) as any);
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return <Badge color="green">{status}</Badge>;
      case AccountStatus.INACTIVE:
        return <Badge color="yellow">{status}</Badge>;
      case AccountStatus.ARCHIVED:
        return <Badge color="gray">{status}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Account Number',
      accessor: 'accountNumber',
      cell: (row: any) => row.accountNumber,
    },
    {
      header: 'Name',
      accessor: 'name',
      cell: (row: any) => row.name,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) => (
        <span className="capitalize">{row.type}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row: any) => (
        <span className="capitalize">{row.category.replace(/_/g, ' ')}</span>
      ),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      cell: (row: any) => formatCurrency(row.balance),
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
            onClick={() => navigate(`/accounting/accounts/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/accounting/accounts/${row._id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/accounting/accounts/new')}
        >
          Add New Account
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Account number or name"
            />
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.values(AccountType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.values(AccountCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(AccountStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
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
            data={accounts}
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

export default AccountsList;
