import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchExpenseSummary } from '@/store/slices/expenseSlice';
import { fetchBudgetSummary } from '@/store/slices/budgetSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const FinanceDashboard = () => {
  const dispatch = useDispatch();
  const { expenseSummary, isLoading: expensesLoading } = useSelector(
    (state: RootState) => state.expenses
  );
  const { budgetSummary, isLoading: budgetsLoading } = useSelector(
    (state: RootState) => state.budgets
  );

  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = () => {
    if (dateRange) {
      dispatch(
        fetchExpenseSummary({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        })
      );
    } else {
      dispatch(fetchExpenseSummary({}));
    }
    dispatch(fetchBudgetSummary());
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleClearFilters = () => {
    setDateRange(null);
    dispatch(fetchExpenseSummary({}));
  };

  // Prepare chart data for expenses by category
  const expensesByCategoryData = {
    labels:
      expenseSummary?.expensesByCategory.map((item) =>
        item.category.replace(/_/g, ' ').toLowerCase()
      ) || [],
    datasets: [
      {
        label: 'Amount',
        data: expenseSummary?.expensesByCategory.map((item) => item.amount) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for budget utilization
  const budgetUtilizationData = {
    labels: ['Budget Utilized', 'Budget Remaining'],
    datasets: [
      {
        data: [
          budgetSummary?.totalSpent || 0,
          Math.max(
            0,
            (budgetSummary?.totalBudgeted || 0) - (budgetSummary?.totalSpent || 0)
          ),
        ],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow">
              <DateRangePicker
                label="Date Range"
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button variant="primary" onClick={handleRefresh}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Total Expenses</h2>
            <p className="text-3xl font-bold text-primary-600">
              {expenseSummary
                ? formatCurrency(expenseSummary.totalExpenses)
                : 'Loading...'}
            </p>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="font-medium">
                  {expenseSummary
                    ? formatCurrency(expenseSummary.pendingExpenses)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Paid</p>
                <p className="font-medium">
                  {expenseSummary
                    ? formatCurrency(expenseSummary.paidExpenses)
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Budget Overview</h2>
            <p className="text-3xl font-bold text-primary-600">
              {budgetSummary
                ? formatCurrency(budgetSummary.totalBudgeted)
                : 'Loading...'}
            </p>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Spent</p>
                <p className="font-medium">
                  {budgetSummary
                    ? formatCurrency(budgetSummary.totalSpent)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Utilization</p>
                <p className="font-medium">
                  {budgetSummary
                    ? formatPercentage(budgetSummary.budgetUtilization)
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">Active Budgets</h2>
            <p className="text-3xl font-bold text-primary-600">
              {budgetSummary ? budgetSummary.activeBudgets : 'Loading...'}
            </p>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Total Budgets</p>
                <p className="font-medium">
                  {budgetSummary ? budgetSummary.totalBudgets : '-'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
            {expensesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : expenseSummary?.expensesByCategory.length ? (
              <div className="h-64">
                <Bar
                  data={expensesByCategoryData}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y' as const,
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Budget Utilization</h2>
            {budgetsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : budgetSummary ? (
              <div className="h-64">
                <Pie data={budgetUtilizationData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No budget data available
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
          {expensesLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : expenseSummary?.recentExpenses.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenseSummary.recentExpenses.map((expense) => (
                    <tr key={expense._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.expenseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {expense.category.replace(/_/g, ' ').toLowerCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            expense.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : expense.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : expense.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent expenses found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
