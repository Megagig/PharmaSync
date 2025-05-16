import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchExpenseSummary } from '@/store/slices/expenseSlice';
import { fetchBudgetSummary } from '@/store/slices/budgetSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import DateRangeFilter, { DateRange } from '@/components/domain/Dashboard/DateRangeFilter';

const FinanceReports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { expenseSummary, isLoading: expensesLoading } = useSelector(
    (state: RootState) => state.expenses
  );
  const { budgetSummary, isLoading: budgetsLoading } = useSelector(
    (state: RootState) => state.budgets
  );
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  
  const [activeTab, setActiveTab] = useState<'expenses' | 'budgets' | 'revenue' | 'profit'>('expenses');
  
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
  
  const isLoading = expensesLoading || budgetsLoading;
  
  // Mock revenue data (in a real app, this would come from an API)
  const revenueData = {
    totalRevenue: 1250000,
    revenueByMonth: [
      { month: 'Jan 2023', amount: 120000 },
      { month: 'Feb 2023', amount: 135000 },
      { month: 'Mar 2023', amount: 145000 },
      { month: 'Apr 2023', amount: 125000 },
      { month: 'May 2023', amount: 115000 },
      { month: 'Jun 2023', amount: 110000 },
      { month: 'Jul 2023', amount: 125000 },
      { month: 'Aug 2023', amount: 130000 },
      { month: 'Sep 2023', amount: 140000 },
      { month: 'Oct 2023', amount: 150000 },
      { month: 'Nov 2023', amount: 155000 },
      { month: 'Dec 2023', amount: 160000 },
    ],
    revenueByCategory: [
      { category: 'Prescription Sales', amount: 750000 },
      { category: 'OTC Sales', amount: 350000 },
      { category: 'Services', amount: 150000 },
    ],
    topProducts: [
      { product: 'Paracetamol 500mg', amount: 85000 },
      { product: 'Amoxicillin 250mg', amount: 75000 },
      { product: 'Metformin 500mg', amount: 65000 },
      { product: 'Lisinopril 10mg', amount: 55000 },
      { product: 'Amlodipine 5mg', amount: 45000 },
    ],
  };
  
  // Calculate profit data
  const totalExpenses = expenseSummary?.totalExpenses || 0;
  const totalRevenue = revenueData.totalRevenue;
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  
  // Prepare data for charts
  const expensesByCategoryData = expenseSummary?.expensesByCategory.map(item => ({
    name: item.category.replace(/_/g, ' ').toUpperCase(),
    value: item.amount,
  })) || [];
  
  const expensesByMonthData = expenseSummary?.expensesByMonth.map(item => ({
    name: item.month,
    value: item.amount,
  })) || [];
  
  const budgetsByCategoryData = budgetSummary?.budgetsByCategory.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.budgeted,
    actual: item.actual,
  })) || [];
  
  const budgetsByPeriodData = budgetSummary?.budgetsByPeriod.map(item => ({
    name: item.period,
    budgeted: item.budgeted,
    actual: item.actual,
  })) || [];
  
  const revenueByMonthData = revenueData.revenueByMonth.map(item => ({
    name: item.month,
    value: item.amount,
  }));
  
  const revenueByCategoryData = revenueData.revenueByCategory.map(item => ({
    name: item.category,
    value: item.amount,
  }));
  
  const profitByMonthData = revenueData.revenueByMonth.map((item, index) => {
    const expenseForMonth = expensesByMonthData.find(exp => exp.name === item.month)?.value || 0;
    return {
      name: item.month,
      revenue: item.amount,
      expenses: expenseForMonth,
      profit: item.amount - expenseForMonth,
    };
  });
  
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Finance Reports</h1>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Finance Reports</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/finance')}
        >
          Back to Finance Dashboard
        </Button>
      </div>
      
      <DateRangeFilter onRangeChange={handleDateRangeChange} />
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'budgets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('budgets')}
            >
              Budgets
            </button>
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('revenue')}
            >
              Revenue
            </button>
            <button
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'profit'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profit')}
            >
              Profit & Loss
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Total Expenses</p>
                  <p className="text-xl font-semibold text-blue-900">{formatCurrency(expenseSummary?.totalExpenses || 0)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700">Pending Expenses</p>
                  <p className="text-xl font-semibold text-yellow-900">{formatCurrency(expenseSummary?.pendingExpenses || 0)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Paid Expenses</p>
                  <p className="text-xl font-semibold text-green-900">{formatCurrency(expenseSummary?.paidExpenses || 0)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses by Category</h3>
                    <ChartContainer
                      title="Expenses by Category"
                      type={ChartType.PIE}
                      data={expensesByCategoryData}
                      height={300}
                      options={{
                        showLegend: true,
                        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                      }}
                    />
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses by Month</h3>
                    <ChartContainer
                      title="Expenses by Month"
                      type={ChartType.BAR}
                      data={expensesByMonthData}
                      height={300}
                      options={{
                        showLegend: false,
                        colors: ['#3B82F6'],
                        yAxisLabel: 'Amount (₦)',
                      }}
                    />
                  </div>
                </Card>
              </div>
              
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Suppliers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenseSummary?.topSuppliers.map((supplier, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.supplier}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(supplier.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPercentage(supplier.amount / (expenseSummary?.totalExpenses || 1))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'budgets' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Total Budgeted</p>
                  <p className="text-xl font-semibold text-blue-900">{formatCurrency(budgetSummary?.totalBudgeted || 0)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Total Spent</p>
                  <p className="text-xl font-semibold text-green-900">{formatCurrency(budgetSummary?.totalSpent || 0)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">Budget Utilization</p>
                  <p className="text-xl font-semibold text-purple-900">{formatPercentage(budgetSummary?.budgetUtilization / 100 || 0)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual by Category</h3>
                    <ChartContainer
                      title="Budget vs Actual by Category"
                      type={ChartType.BAR}
                      data={budgetsByCategoryData.map(item => ({
                        name: item.name,
                        budgeted: item.value,
                        actual: item.actual,
                      }))}
                      height={300}
                      options={{
                        showLegend: true,
                        colors: ['#3B82F6', '#10B981'],
                        yAxisLabel: 'Amount (₦)',
                      }}
                    />
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual by Period</h3>
                    <ChartContainer
                      title="Budget vs Actual by Period"
                      type={ChartType.BAR}
                      data={budgetsByPeriodData}
                      height={300}
                      options={{
                        showLegend: true,
                        colors: ['#3B82F6', '#10B981'],
                        yAxisLabel: 'Amount (₦)',
                      }}
                    />
                  </div>
                </Card>
              </div>
              
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Utilization by Category</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {budgetSummary?.budgetsByCategory.map((category, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.category.charAt(0).toUpperCase() + category.category.slice(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(category.budgeted)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(category.actual)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <span className={`mr-2 ${
                                  category.utilization > 100 ? 'text-red-600' : 
                                  category.utilization > 90 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {category.utilization}%
                                </span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      category.utilization > 100 ? 'bg-red-600' : 
                                      category.utilization > 90 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`} 
                                    style={{ width: `${Math.min(category.utilization, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Total Revenue</p>
                  <p className="text-xl font-semibold text-green-900">{formatCurrency(revenueData.totalRevenue)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Prescription Sales</p>
                  <p className="text-xl font-semibold text-blue-900">{formatCurrency(revenueData.revenueByCategory[0].amount)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">OTC Sales</p>
                  <p className="text-xl font-semibold text-purple-900">{formatCurrency(revenueData.revenueByCategory[1].amount)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Month</h3>
                    <ChartContainer
                      title="Revenue by Month"
                      type={ChartType.LINE}
                      data={revenueByMonthData}
                      height={300}
                      options={{
                        showLegend: false,
                        colors: ['#10B981'],
                        yAxisLabel: 'Amount (₦)',
                      }}
                    />
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
                    <ChartContainer
                      title="Revenue by Category"
                      type={ChartType.PIE}
                      data={revenueByCategoryData}
                      height={300}
                      options={{
                        showLegend: true,
                        colors: ['#3B82F6', '#10B981', '#F59E0B'],
                      }}
                    />
                  </div>
                </Card>
              </div>
              
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products by Revenue</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {revenueData.topProducts.map((product, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.product}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatPercentage(product.amount / revenueData.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'profit' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Total Revenue</p>
                  <p className="text-xl font-semibold text-green-900">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700">Total Expenses</p>
                  <p className="text-xl font-semibold text-red-900">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Net Profit</p>
                  <p className="text-xl font-semibold text-blue-900">{formatCurrency(profit)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">Profit Margin</p>
                  <p className="text-xl font-semibold text-purple-900">{formatPercentage(profitMargin / 100)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs Expenses</h3>
                    <ChartContainer
                      title="Revenue vs Expenses"
                      type={ChartType.BAR}
                      data={[
                        { name: 'Revenue', value: totalRevenue },
                        { name: 'Expenses', value: totalExpenses },
                        { name: 'Profit', value: profit },
                      ]}
                      height={300}
                      options={{
                        showLegend: false,
                        colors: ['#10B981', '#EF4444', '#3B82F6'],
                        yAxisLabel: 'Amount (₦)',
                      }}
                    />
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profit by Month</h3>
                    <ChartContainer
                      title="Profit by Month"
                      type={ChartType.LINE}
                      data={profitByMonthData.map(item => ({
                        name: item.name,
                        value: item.profit,
                      }))}
                      height={300}
                      options={{
                        showLegend: false,
                        colors: ['#3B82F6'],
                        yAxisLabel: 'Amount (₦)',
                      }}
                    />
                  </div>
                </Card>
              </div>
              
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Profit & Loss</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profitByMonthData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(item.revenue)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(item.expenses)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{formatCurrency(item.profit)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                              {formatPercentage(item.revenue > 0 ? item.profit / item.revenue : 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceReports;
