import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchExpenses } from '@/store/slices/expenseSlice';
import { ExpenseCategory, ExpenseStatus } from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import Badge from '@/components/common/Badge/Badge';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatDate } from '@/utils/formatters';

const ExpensesList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { expenses, isLoading, error, meta } = useSelector(
    (state: RootState) => state.expenses
  );

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadExpenses();
  }, [currentPage, category, status, dateRange]);

  const loadExpenses = () => {
    const filters: Record<string, any> = {};

    if (search) {
      filters.title = search;
    }

    if (category) {
      filters.category = category;
    }

    if (status) {
      filters.status = status;
    }

    if (dateRange) {
      filters.startDate = dateRange.startDate;
      filters.endDate = dateRange.endDate;
    }

    dispatch(fetchExpenses({ page: currentPage, limit: 10, filters }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setDateRange(null);
    setCurrentPage(1);
    dispatch(fetchExpenses({ page: 1, limit: 10 }));
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.PENDING:
        return <Badge color="yellow" text="Pending" />;
      case ExpenseStatus.APPROVED:
        return <Badge color="blue" text="Approved" />;
      case ExpenseStatus.PAID:
        return <Badge color="green" text="Paid" />;
      case ExpenseStatus.REJECTED:
        return <Badge color="red" text="Rejected" />;
      case ExpenseStatus.CANCELLED:
        return <Badge color="gray" text="Cancelled" />;
      default:
        return <Badge color="gray" text={status} />;
    }
  };

  const columns = [
    {
      header: 'Expense Number',
      accessor: 'expenseNumber',
      cell: (row: any) => row.expenseNumber,
    },
    {
      header: 'Title',
      accessor: 'title',
      cell: (row: any) => row.title,
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row: any) => (
        <span className="capitalize">
          {row.category.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row: any) => formatCurrency(row.amount),
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (row: any) => formatDate(row.date),
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
            onClick={() => navigate(`/expenses/${row._id}`)}
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
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/expenses/new')}
        >
          Add New Expense
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
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.values(ExpenseCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(ExpenseStatus).map((stat) => (
                <option key={stat} value={stat}>
                  {stat.charAt(0).toUpperCase() + stat.slice(1).toLowerCase()}
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
            data={expenses}
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

export default ExpensesList;
