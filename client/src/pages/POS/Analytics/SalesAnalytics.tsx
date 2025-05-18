import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader/PageHeader';
import Card from '@/components/common/Card/Card';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';
import PosAnalyticsService from '@/services/posAnalytics.service';
import { SalesChart } from '@/components/POS/Analytics';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { FaSync, FaDownload } from 'react-icons/fa';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesAnalytics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [period, setPeriod] = useState<string>('daily');
  const [location, setLocation] = useState<string>('');
  const [locations, setLocations] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSalesData();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      // This would be replaced with an actual API call to get locations
      setLocations([
        { _id: 'location1', name: 'Main Store' },
        { _id: 'location2', name: 'Branch 1' },
        { _id: 'location3', name: 'Branch 2' },
      ]);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const data = await PosAnalyticsService.getSalesAnalytics({
        startDate: dateRange.startDate ? formatDate(dateRange.startDate, 'YYYY-MM-DD') : undefined,
        endDate: dateRange.endDate ? formatDate(dateRange.endDate, 'YYYY-MM-DD') : undefined,
        period: period as any,
        location,
      });
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      showToast('Failed to fetch sales data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSalesData();
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

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation(e.target.value);
  };

  const handleApplyFilters = () => {
    fetchSalesData();
  };

  const handleExportReport = () => {
    // This would be replaced with an actual export function
    showToast('Export functionality not implemented yet', 'info');
  };

  // Prepare payment method chart data
  const paymentMethodChartData = salesData ? {
    labels: salesData.salesByPaymentMethod.map(item => item._id),
    datasets: [
      {
        data: salesData.salesByPaymentMethod.map(item => item.totalSales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare category chart data
  const categoryChartData = salesData ? {
    labels: salesData.salesByCategory.map(item => item.categoryName || 'Uncategorized'),
    datasets: [
      {
        label: 'Sales by Category',
        data: salesData.salesByCategory.map(item => item.totalSales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="sales-analytics-page">
      <PageHeader
        title="Sales Analytics"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'POS', path: '/pos' },
          { label: 'Analytics', path: '/pos/analytics' },
          { label: 'Sales', path: '/pos/analytics/sales' },
        ]}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleExportReport}
              disabled={loading || !salesData}
            >
              <FaDownload className="mr-2" />
              Export
            </Button>
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Select
                  value={location}
                  onChange={handleLocationChange}
                  className="w-full"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
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
      
      {loading && !salesData ? (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : salesData ? (
        <>
          {/* Sales Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Total Sales</h3>
                <div className="text-3xl font-bold">{formatCurrency(salesData.summary.totalSales)}</div>
                <div className="text-sm text-gray-500">
                  {salesData.summary.startDate && salesData.summary.endDate ? (
                    `${new Date(salesData.summary.startDate).toLocaleDateString()} - ${new Date(salesData.summary.endDate).toLocaleDateString()}`
                  ) : 'All time'}
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Transaction Count</h3>
                <div className="text-3xl font-bold">{salesData.summary.totalCount}</div>
                <div className="text-sm text-gray-500">
                  {period === 'daily' ? 'Daily average: ' : 'Average: '}
                  {(salesData.summary.totalCount / salesData.salesByPeriod.length).toFixed(1)}
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Average Sale</h3>
                <div className="text-3xl font-bold">{formatCurrency(salesData.summary.averageSale)}</div>
                <div className="text-sm text-gray-500">Per transaction</div>
              </div>
            </Card>
          </div>
          
          {/* Sales Chart */}
          <div className="mb-6">
            <SalesChart
              data={salesData.salesByPeriod}
              title={`Sales Trend (${period})`}
            />
          </div>
          
          {/* Payment Method and Category Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Sales by Payment Method</h3>
                <div className="h-64">
                  {paymentMethodChartData && (
                    <Pie
                      data={paymentMethodChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw as number;
                                const total = (context.dataset.data as number[]).reduce((a, b) => (a as number) + (b as number), 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Sales by Category</h3>
                <div className="h-64">
                  {categoryChartData && (
                    <Bar
                      data={categoryChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw as number;
                                return `${label}: ${formatCurrency(value)}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p>No data available. Please apply filters and refresh.</p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            className="mt-4"
          >
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default SalesAnalytics;
