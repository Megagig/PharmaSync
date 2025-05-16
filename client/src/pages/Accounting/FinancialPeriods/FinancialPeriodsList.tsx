import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchFinancialPeriods } from '@/store/slices/accountingSlice';
import { FinancialPeriodStatus } from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import { formatDate } from '@/utils/formatters';

const FinancialPeriodsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { financialPeriods, isLoading, error, meta } = useSelector(
    (state: RootState) => state.accounting
  );

  // Filter states
  const [status, setStatus] = useState('');
  const [isFiscalYear, setIsFiscalYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadFinancialPeriods();
  }, [currentPage, status, isFiscalYear]);

  const loadFinancialPeriods = () => {
    const filters: Record<string, any> = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (isFiscalYear !== '') {
      filters.isFiscalYear = isFiscalYear === 'true';
    }
    
    dispatch(fetchFinancialPeriods({ page: currentPage, filters }) as any);
  };

  const handleClearFilters = () => {
    setStatus('');
    setIsFiscalYear('');
    dispatch(fetchFinancialPeriods({ page: 1 }) as any);
  };

  const getStatusBadge = (status: FinancialPeriodStatus) => {
    switch (status) {
      case FinancialPeriodStatus.OPEN:
        return <Badge color="green">{status}</Badge>;
      case FinancialPeriodStatus.CLOSED:
        return <Badge color="yellow">{status}</Badge>;
      case FinancialPeriodStatus.LOCKED:
        return <Badge color="red">{status}</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row: any) => row.name,
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      cell: (row: any) => formatDate(row.startDate),
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      cell: (row: any) => formatDate(row.endDate),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => getStatusBadge(row.status),
    },
    {
      header: 'Fiscal Year',
      accessor: 'isFiscalYear',
      cell: (row: any) => (row.isFiscalYear ? 'Yes' : 'No'),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/accounting/financial-periods/${row._id}`)}
          >
            View
          </Button>
          {row.status === FinancialPeriodStatus.OPEN && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/accounting/financial-periods/${row._id}/edit`)}
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
        <h1 className="text-2xl font-bold text-gray-900">Financial Periods</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/accounting/financial-periods/new')}
        >
          Create Financial Period
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(FinancialPeriodStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
            <Select
              label="Fiscal Year"
              value={isFiscalYear}
              onChange={(e) => setIsFiscalYear(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Fiscal Year</option>
              <option value="false">Regular Period</option>
            </Select>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button variant="primary" onClick={loadFinancialPeriods}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={financialPeriods}
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

export default FinancialPeriodsList;
