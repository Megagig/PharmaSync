import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchBudgets } from '@/store/slices/budgetSlice';
import { BudgetStatus, BudgetPeriod } from '@/types/budget.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import Pagination from '@/components/common/Pagination/Pagination';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import Select from '@/components/common/Select/Select';
import { formatCurrency } from '@/utils/formatters';

const BudgetsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { budgets, isLoading, error, meta } = useSelector(
    (state: RootState) => state.budgets
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
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
    
    if (periodFilter) {
      filters.period = periodFilter;
    }
    
    dispatch(
      fetchBudgets({
        page: currentPage,
        limit,
        filters,
      }) as any
    );
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, periodFilter]);
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePeriodFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };
  
  const getStatusBadgeClass = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case BudgetStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case BudgetStatus.CLOSED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const calculateUtilization = (budget: any) => {
    if (!budget.totalActual || budget.totalBudgeted === 0) {
      return 0;
    }
    return (budget.totalActual / budget.totalBudgeted) * 100;
  };
  
  const columns = [
    {
      header: 'Budget Number',
      accessor: 'budgetNumber',
      cell: (row: any) => (
        <span className="font-medium text-blue-600 cursor-pointer" onClick={() => navigate(`/budgets/${row._id}`)}>
          {row.budgetNumber}
        </span>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
    },
    {
      header: 'Period',
      accessor: 'period',
      cell: (row: any) => (
        <span className="capitalize">
          {row.period}
        </span>
      ),
    },
    {
      header: 'Date Range',
      accessor: 'startDate',
      cell: (row: any) => (
        <span>
          {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Budgeted',
      accessor: 'totalBudgeted',
      cell: (row: any) => formatCurrency(row.totalBudgeted),
    },
    {
      header: 'Actual',
      accessor: 'totalActual',
      cell: (row: any) => formatCurrency(row.totalActual || 0),
    },
    {
      header: 'Utilization',
      accessor: 'utilization',
      cell: (row: any) => {
        const utilization = calculateUtilization(row);
        let colorClass = 'text-green-600';
        
        if (utilization > 100) {
          colorClass = 'text-red-600';
        } else if (utilization > 90) {
          colorClass = 'text-yellow-600';
        }
        
        return (
          <span className={colorClass}>
            {utilization.toFixed(1)}%
          </span>
        );
      },
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
            onClick={() => navigate(`/budgets/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate(`/budgets/${row._id}/edit`)}
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
        <h1 className="text-2xl font-semibold text-gray-900">Budgets</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/budgets/new')}
        >
          Create Budget
        </Button>
      </div>
      
      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <SearchInput
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full md:w-40"
              >
                <option value="">All Statuses</option>
                <option value={BudgetStatus.DRAFT}>Draft</option>
                <option value={BudgetStatus.ACTIVE}>Active</option>
                <option value={BudgetStatus.CLOSED}>Closed</option>
              </Select>
              <Select
                value={periodFilter}
                onChange={handlePeriodFilterChange}
                className="w-full md:w-40"
              >
                <option value="">All Periods</option>
                <option value={BudgetPeriod.MONTHLY}>Monthly</option>
                <option value={BudgetPeriod.QUARTERLY}>Quarterly</option>
                <option value={BudgetPeriod.YEARLY}>Yearly</option>
                <option value={BudgetPeriod.CUSTOM}>Custom</option>
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
          ) : budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No budgets found.</p>
              <Button
                variant="text"
                className="mt-2"
                onClick={() => navigate('/budgets/new')}
              >
                Create your first budget
              </Button>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={budgets}
                onRowClick={(row) => navigate(`/budgets/${row._id}`)}
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

export default BudgetsList;
