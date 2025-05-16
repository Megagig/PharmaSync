import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchTaxConfigurations } from '@/store/slices/accountingSlice';
import { TaxType } from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import { formatCurrency } from '@/utils/formatters';

const TaxConfigurationsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { taxConfigurations, isLoading, error, meta } = useSelector(
    (state: RootState) => state.accounting
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [isActive, setIsActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTaxConfigurations();
  }, [currentPage, type, isActive]);

  const loadTaxConfigurations = () => {
    const filters: Record<string, any> = {};
    
    if (type) {
      filters.type = type;
    }
    
    if (isActive !== '') {
      filters.isActive = isActive === 'true';
    }
    
    dispatch(fetchTaxConfigurations({ page: currentPage, filters }) as any);
  };

  const handleSearch = () => {
    if (search) {
      dispatch(fetchTaxConfigurations({ page: 1, filters: { search } }) as any);
    } else {
      loadTaxConfigurations();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setIsActive('');
    dispatch(fetchTaxConfigurations({ page: 1 }) as any);
  };

  const formatTaxType = (type: TaxType) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row: any) => row.name,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) => formatTaxType(row.type),
    },
    {
      header: 'Rate',
      accessor: 'rate',
      cell: (row: any) => `${row.rate}%`,
    },
    {
      header: 'Account',
      accessor: 'accountId',
      cell: (row: any) => (
        typeof row.accountId === 'object' && row.accountId
          ? `${row.accountId.accountNumber} - ${row.accountId.name}`
          : 'Not Assigned'
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row: any) => (
        row.isActive 
          ? <Badge color="green">Active</Badge>
          : <Badge color="gray">Inactive</Badge>
      ),
    },
    {
      header: 'Default',
      accessor: 'isDefault',
      cell: (row: any) => (
        row.isDefault 
          ? <Badge color="blue">Default</Badge>
          : ''
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/accounting/taxes/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/accounting/taxes/${row._id}/edit`)}
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
        <h1 className="text-2xl font-bold text-gray-900">Tax Configurations</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/accounting/taxes/new')}
        >
          Add New Tax Configuration
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tax name"
            />
            <Select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.values(TaxType).map((type) => (
                <option key={type} value={type}>
                  {formatTaxType(type)}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
            data={taxConfigurations}
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

export default TaxConfigurationsList;
