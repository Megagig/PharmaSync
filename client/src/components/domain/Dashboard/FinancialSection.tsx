import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchExpenseSummary } from '@/store/slices/expenseSlice';
import { fetchBudgetSummary } from '@/store/slices/budgetSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { DateRange } from './DateRangeFilter';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface FinancialSectionProps {
  dateRange: DateRange;
}

const FinancialSection: React.FC<FinancialSectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { expenseSummary, isLoading: expensesLoading } = useSelector(
    (state: RootState) => state.expenses
  );
  const { budgetSummary, isLoading: budgetsLoading } = useSelector(
    (state: RootState) => state.budgets
  );

  const isLoading = expensesLoading || budgetsLoading;

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(
        fetchExpenseSummary({
          startDate: dateRange.startDate.toISOString().split('T')[0],
          endDate: dateRange.endDate.toISOString().split('T')[0],
        }) as any
      );
    } else {
      dispatch(fetchExpenseSummary({}) as any);
    }
    dispatch(fetchBudgetSummary() as any);
  }, [dispatch, dateRange]);

  // Prepare financial data from API responses
  const totalRevenue = 1250000; // This would come from sales API
  const totalExpenses = expenseSummary?.totalExpenses || 0;
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const financialData = {
    revenue: formatCurrency(totalRevenue),
    expenses: formatCurrency(totalExpenses),
    profit: formatCurrency(profit),
    profitMargin: formatPercentage(profitMargin / 100),
    revenueVsExpenses: [
      { name: 'Revenue', value: totalRevenue },
      { name: 'Expenses', value: totalExpenses },
      { name: 'Profit', value: profit },
    ],
    expenseBreakdown: expenseSummary?.expensesByCategory?.map((item) => ({
      name: item.category.replace(/_/g, ' ').toUpperCase(),
      value: item.amount,
    })) || [
      { name: 'Inventory', value: 450000 },
      { name: 'Salaries', value: 180000 },
      { name: 'Rent', value: 60000 },
      { name: 'Utilities', value: 35000 },
      { name: 'Other', value: 25000 },
    ],
    recentTransactions: [
      {
        id: '1',
        description: 'Inventory Purchase',
        date: '2023-11-05',
        amount: formatCurrency(120000),
        type: 'Expense',
      },
      {
        id: '2',
        description: 'Sales Revenue',
        date: '2023-11-06',
        amount: formatCurrency(85000),
        type: 'Income',
      },
      {
        id: '3',
        description: 'Utility Bill',
        date: '2023-11-07',
        amount: formatCurrency(15000),
        type: 'Expense',
      },
    ],
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Financial Overview
          </h2>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Format expense breakdown data for chart
  const expenseData = financialData.expenseBreakdown.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">
            Financial Overview
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/accounting')}
          >
            View Accounting
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">Revenue</p>
            <p className="text-xl font-semibold text-blue-900">
              {financialData.revenue}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-700">Expenses</p>
            <p className="text-xl font-semibold text-red-900">
              {financialData.expenses}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">Profit</p>
            <p className="text-xl font-semibold text-green-900">
              {financialData.profit}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-700">Profit Margin</p>
            <p className="text-xl font-semibold text-purple-900">
              {financialData.profitMargin}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Revenue vs Expenses
            </h3>
            <ChartContainer
              title="Revenue vs Expenses"
              type={ChartType.BAR}
              data={financialData.revenueVsExpenses}
              height={150}
              options={{
                showLegend: false,
                colors: ['#3B82F6', '#EF4444', '#10B981'],
                yAxisLabel: 'Amount (₦)',
              }}
            />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Expense Breakdown
            </h3>
            <ChartContainer
              title="Expense Breakdown"
              type={ChartType.PIE}
              data={expenseData}
              height={150}
              options={{
                showLegend: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Recent Transactions
          </h3>
          {financialData.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.recentTransactions.map(
                    (transaction, index) => (
                      <tr
                        key={index}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate('/accounting/journal-entries')}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {transaction.amount}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.type === 'Income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent transactions.</p>
          )}
          {financialData.recentTransactions.length > 0 && (
            <div className="mt-2 text-right">
              <Button
                variant="text"
                size="sm"
                onClick={() => navigate('/accounting/journal-entries')}
              >
                View All Transactions
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FinancialSection;
