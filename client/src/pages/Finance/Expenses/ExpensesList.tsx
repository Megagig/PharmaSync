import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchExpenses } from '@/store/slices/expenseSlice';
import { ExpenseStatus, ExpenseCategory } from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import Select from '@/components/common/Select/Select';
import { formatCurrency } from '@/utils/formatters';

const ExpensesList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { expenses, isLoading, error, meta } = useSelector(
    (state: RootState) => state.expenses
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  useEffect(() => {
    const filters: Record<string, any> = {};
    
    if (searchTerm) {
      filters.search = searchTerm;
    }
    
    if (statusFilter) {
      filters.status = statusFilter;
    }
    
    if (categoryFilter) {
      filters.category = categoryFilter;
    }
    
    dispatch(
      fetchExpenses({
        page: currentPage,
        limit,
        filters,
      }) as any
    );
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, categoryFilter]);
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };
  
  const getStatusBadgeClass = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ExpenseStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case ExpenseStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ExpenseStatus.PAID:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const columns = [
    {
      header: 'Expense Number',
      accessor: 'expenseNumber',
      cell: (row: any) => (
        <span className="font-medium text-blue-600 cursor-pointer" onClick={() => navigate(`/expenses/${row._id}`)}>
          {row.expenseNumber}
        </span>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row: any) => (
        <span className="capitalize">
          {row.category.replace(/_/g, ' ')}
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
      cell: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate(`/expenses/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate(`/expenses/${row._id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/expenses/new')}
        >
          Create Expense
        </Button>
      </div>
      
      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <SearchInput
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full md:w-40"
              >
                <option value="">All Statuses</option>
                <option value={ExpenseStatus.PENDING}>Pending</option>
                <option value={ExpenseStatus.APPROVED}>Approved</option>
                <option value={ExpenseStatus.REJECTED}>Rejected</option>
                <option value={ExpenseStatus.PAID}>Paid</option>
              </Select>
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                className="w-full md:w-40"
              >
                <option value="">All Categories</option>
                {Object.values(ExpenseCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show:</span>
              <Select
                value={limit.toString()}
                onChange={handleLimitChange}
                className="w-20"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No expenses found.</p>
              <Button
                variant="text"
                className="mt-2"
                onClick={() => navigate('/expenses/new')}
              >
                Create your first expense
              </Button>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={expenses}
                onRowClick={(row) => navigate(`/expenses/${row._id}`)}
              />
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={meta.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpensesList;
