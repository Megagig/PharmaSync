import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { DateRange } from './DateRangeFilter';

interface SalesSectionProps {
  dateRange: DateRange;
}

const SalesSection: React.FC<SalesSectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  
  // In a real implementation, this would come from the Redux store
  // For now, we'll use placeholder data
  const isLoading = false;
  
  const salesData = {
    totalSales: '₦1,250,000',
    salesCount: 145,
    averageSale: '₦8,620',
    salesTrend: [
      { date: '2023-11-01', value: 42000 },
      { date: '2023-11-02', value: 38000 },
      { date: '2023-11-03', value: 45000 },
      { date: '2023-11-04', value: 40000 },
      { date: '2023-11-05', value: 35000 },
      { date: '2023-11-06', value: 48000 },
      { date: '2023-11-07', value: 52000 },
    ],
    paymentMethods: [
      { name: 'Cash', value: 65 },
      { name: 'Card', value: 25 },
      { name: 'Transfer', value: 8 },
      { name: 'Credit', value: 2 },
    ],
    recentSales: [
      { id: '1', customer: 'John Doe', date: '2023-11-07', amount: '₦12,500', status: 'Completed' },
      { id: '2', customer: 'Jane Smith', date: '2023-11-07', amount: '₦8,750', status: 'Completed' },
      { id: '3', customer: 'Robert Johnson', date: '2023-11-06', amount: '₦15,200', status: 'Completed' },
    ],
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Sales & POS</h2>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Format sales trend data for chart
  const salesTrendData = salesData.salesTrend.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    value: item.value,
  }));

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">Sales & POS</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/pos')}
          >
            Open POS
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">Total Sales</p>
            <p className="text-xl font-semibold text-blue-900">{salesData.totalSales}</p>
            <p className="text-xs text-blue-600">{salesData.salesCount} transactions</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">Average Sale</p>
            <p className="text-xl font-semibold text-green-900">{salesData.averageSale}</p>
            <p className="text-xs text-green-600">Per transaction</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg cursor-pointer" onClick={() => navigate('/reports/sales')}>
            <p className="text-sm text-purple-700">Sales Reports</p>
            <p className="text-xl font-semibold text-purple-900">View Details</p>
            <p className="text-xs text-purple-600">Comprehensive analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Sales Trend</h3>
            <ChartContainer
              title="Sales Trend"
              type={ChartType.LINE}
              data={salesTrendData}
              height={150}
              options={{
                showLegend: false,
                colors: ['#3B82F6'],
                xAxisLabel: 'Date',
                yAxisLabel: 'Amount (₦)',
              }}
            />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Payment Methods</h3>
            <ChartContainer
              title="Payment Methods"
              type={ChartType.PIE}
              data={salesData.paymentMethods}
              height={150}
              options={{
                showLegend: true,
                colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Recent Sales</h3>
          {salesData.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.recentSales.map((sale, index) => (
                    <tr 
                      key={index} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate('/pos/transactions')}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{sale.customer}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{sale.amount}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent sales.</p>
          )}
          {salesData.recentSales.length > 0 && (
            <div className="mt-2 text-right">
              <Button 
                variant="text" 
                size="sm" 
                onClick={() => navigate('/pos/transactions')}
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

export default SalesSection;
