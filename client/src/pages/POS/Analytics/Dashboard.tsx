import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader/PageHeader';
import Card from '@/components/common/Card/Card';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';
import PosAnalyticsService from '@/services/posAnalytics.service';
import {
  SalesSummaryCard,
  SalesChart,
  TopProductsTable,
  InventoryStatusCard,
} from '@/components/POS/Analytics';
import { formatDate } from '@/utils/formatters';
import { FaSync } from 'react-icons/fa';

const PosDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [period, setPeriod] = useState<string>('daily');
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await PosAnalyticsService.getDashboardAnalytics();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date,
    }));
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      
      // Fetch sales analytics with filters
      const salesData = await PosAnalyticsService.getSalesAnalytics({
        startDate: dateRange.startDate ? formatDate(dateRange.startDate, 'YYYY-MM-DD') : undefined,
        endDate: dateRange.endDate ? formatDate(dateRange.endDate, 'YYYY-MM-DD') : undefined,
        period: period as any,
      });
      
      // Update only the sales part of the dashboard data
      setDashboardData(prev => ({
        ...prev,
        sales: {
          ...prev.sales,
          byDay: salesData.salesByPeriod,
        },
      }));
      
      showToast('Dashboard data updated', 'success');
    } catch (error) {
      console.error('Error applying filters:', error);
      showToast('Failed to update dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-dashboard-page">
      <PageHeader
        title="POS Dashboard"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'POS', path: '/pos' },
          { label: 'Analytics', path: '/pos/analytics' },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />
      
      <div className="mb-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange('startDate', date)}
                  maxDate={dateRange.endDate || new Date()}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange('endDate', date)}
                  minDate={dateRange.startDate}
                  maxDate={new Date()}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <Select
                  value={period}
                  onChange={handlePeriodChange}
                  className="w-full"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="primary"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {loading && !dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : dashboardData ? (
        <>
          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SalesSummaryCard
              title="Today's Sales"
              amount={dashboardData.sales.today.total}
              count={dashboardData.sales.today.count}
              loading={loading}
            />
            <SalesSummaryCard
              title="Yesterday's Sales"
              amount={dashboardData.sales.yesterday.total}
              count={dashboardData.sales.yesterday.count}
              previousAmount={dashboardData.sales.today.total}
              previousCount={dashboardData.sales.today.count}
              loading={loading}
            />
            <SalesSummaryCard
              title="This Week's Sales"
              amount={dashboardData.sales.thisWeek.total}
              count={dashboardData.sales.thisWeek.count}
              loading={loading}
            />
            <SalesSummaryCard
              title="This Month's Sales"
              amount={dashboardData.sales.thisMonth.total}
              count={dashboardData.sales.thisMonth.count}
              previousAmount={dashboardData.sales.lastMonth.total}
              previousCount={dashboardData.sales.lastMonth.count}
              loading={loading}
            />
          </div>
          
          {/* Sales Chart */}
          <div className="mb-6">
            <SalesChart
              data={dashboardData.sales.byDay}
              title="Sales Trend"
              loading={loading}
            />
          </div>
          
          {/* Products and Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <TopProductsTable
                products={dashboardData.products.topSelling}
                title="Top Selling Products"
                loading={loading}
              />
            </div>
            <div>
              <InventoryStatusCard
                totalProducts={dashboardData.products.lowStock.length + dashboardData.products.expiringSoon.length}
                totalStock={dashboardData.products.lowStock.reduce((sum, item) => sum + item.totalStock, 0) + 
                           dashboardData.products.expiringSoon.reduce((sum, item) => sum + item.totalStock, 0)}
                totalValue={dashboardData.products.lowStock.reduce((sum, item) => sum + (item.totalStock * item.costPrice), 0) + 
                           dashboardData.products.expiringSoon.reduce((sum, item) => sum + (item.totalStock * item.costPrice), 0)}
                lowStockCount={dashboardData.products.lowStock.length}
                expiringCount={dashboardData.products.expiringSoon.length}
                loading={loading}
              />
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="mb-6">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cashier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recentTransactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.saleNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.saleDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.customer ? 
                              `${transaction.customer.firstName} ${transaction.customer.lastName}` : 
                              'Walk-in Customer'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.cashier ? 
                              `${transaction.cashier.firstName} ${transaction.cashier.lastName}` : 
                              'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.transactionType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(transaction.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p>No data available. Please refresh the dashboard.</p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            className="mt-4"
          >
            Refresh Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default PosDashboard;
