import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchBudgets } from '@/store/slices/budgetSlice';
import { BudgetPeriod, BudgetStatus } from '@/types/budget.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const BudgetsList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { budgets, isLoading, error, meta } = useSelector(
    (state: RootState) => state.budgets
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBudgets();
  }, [currentPage, period, status, dateRange]);

  const loadBudgets = () => {
    const filters: Record<string, any> = {};

    if (search) {
      filters.title = search;
    }

    if (period) {
      filters.period = period;
    }

    if (status) {
      filters.status = status;
    }

    if (dateRange) {
      filters.startDate = dateRange.startDate;
      filters.endDate = dateRange.endDate;
    }

    dispatch(fetchBudgets({ page: currentPage, limit: 10, filters }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadBudgets();
  };

  const handleClearFilters = () => {
    setSearch('');
    setPeriod('');
    setStatus('');
    setDateRange(null);
    setCurrentPage(1);
    dispatch(fetchBudgets({ page: 1, limit: 10 }));
  };

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.DRAFT:
        return <Badge color="gray" text="Draft" />;
      case BudgetStatus.ACTIVE:
        return <Badge color="green" text="Active" />;
      case BudgetStatus.CLOSED:
        return <Badge color="blue" text="Closed" />;
      case BudgetStatus.ARCHIVED:
        return <Badge color="yellow" text="Archived" />;
      default:
        return <Badge color="gray" text={status} />;
    }
  };

  const getPeriodBadge = (period: BudgetPeriod) => {
    switch (period) {
      case BudgetPeriod.MONTHLY:
        return <Badge color="blue" text="Monthly" />;
      case BudgetPeriod.QUARTERLY:
        return <Badge color="purple" text="Quarterly" />;
      case BudgetPeriod.YEARLY:
        return <Badge color="green" text="Yearly" />;
      case BudgetPeriod.CUSTOM:
        return <Badge color="gray" text="Custom" />;
      default:
        return <Badge color="gray" text={period} />;
    }
  };

  const columns = [
    {
      header: 'Budget Number',
      accessor: 'budgetNumber',
      cell: (row: any) => row.budgetNumber,
    },
    {
      header: 'Title',
      accessor: 'title',
      cell: (row: any) => row.title,
    },
    {
      header: 'Period',
      accessor: 'period',
      cell: (row: any) => getPeriodBadge(row.period),
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
      header: 'Total Budget',
      accessor: 'totalBudget',
      cell: (row: any) => formatCurrency(row.totalBudget),
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
            onClick={() => navigate(`/budgets/${row._id}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/budgets/new')}
        >
          Create New Budget
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="">All Periods</option>
              {Object.values(BudgetPeriod).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(BudgetStatus).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
            <DateRangePicker
              label="Date Range"
              value={dateRange}
              onChange={setDateRange}
            />
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
            data={budgets}
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

export default BudgetsList;
