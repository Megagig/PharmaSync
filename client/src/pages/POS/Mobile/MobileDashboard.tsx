import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';
import PosAnalyticsService from '@/services/posAnalytics.service';
import { formatCurrency } from '@/utils/formatters';
import { 
  FaShoppingCart, 
  FaExchangeAlt, 
  FaChartLine, 
  FaBoxes,
  FaUsers,
  FaReceipt,
  FaSync
} from 'react-icons/fa';

const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

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

  return (
    <div className="mobile-dashboard pb-16">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">POS Dashboard</h1>
          <Button
            variant="text"
            onClick={handleRefresh}
            disabled={loading}
            className="p-1"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">Welcome, {user?.firstName}!</p>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/pos/mobile/terminal')}
            className="flex flex-col items-center justify-center py-4"
          >
            <FaShoppingCart className="text-xl mb-2" />
            <span className="text-sm">New Sale</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/pos/returns/process')}
            className="flex flex-col items-center justify-center py-4"
          >
            <FaExchangeAlt className="text-xl mb-2" />
            <span className="text-sm">Returns</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/pos/analytics')}
            className="flex flex-col items-center justify-center py-4"
          >
            <FaChartLine className="text-xl mb-2" />
            <span className="text-sm">Analytics</span>
          </Button>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Today's Summary</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Card className="animate-pulse p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </Card>
            <Card className="animate-pulse p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </Card>
          </div>
        ) : dashboardData ? (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Sales</div>
              <div className="text-xl font-bold">
                {formatCurrency(dashboardData.sales.today.total)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Transactions</div>
              <div className="text-xl font-bold">
                {dashboardData.sales.today.count}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-gray-600 mb-2">No data available</p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Card>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate('/pos/transactions')}
          >
            View All
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse p-4">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : dashboardData?.recentTransactions?.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentTransactions.slice(0, 3).map((transaction: any) => (
              <Card 
                key={transaction._id}
                className="p-4"
                onClick={() => navigate(`/pos/transactions/${transaction._id}`)}
              >
                <div className="flex justify-between mb-1">
                  <div className="font-medium">{transaction.saleNumber}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(transaction.saleDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {transaction.customer ? 
                    `${transaction.customer.firstName} ${transaction.customer.lastName}` : 
                    'Walk-in Customer'}
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600">
                    {transaction.transactionType}
                  </div>
                  <div className="font-medium">
                    {formatCurrency(transaction.total)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-gray-600">No recent transactions</p>
          </Card>
        )}
      </div>

      {/* Inventory Alerts */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Inventory Alerts</h2>
          <Button
            variant="text"
            size="sm"
            onClick={() => navigate('/inventory')}
          >
            View All
          </Button>
        </div>
        
        {loading ? (
          <Card className="animate-pulse p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ) : dashboardData?.products?.lowStock?.length > 0 ? (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Low Stock Items</h3>
            <ul className="space-y-2">
              {dashboardData.products.lowStock.slice(0, 3).map((product: any) => (
                <li key={product._id} className="flex justify-between">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {product.totalStock} left
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-gray-600">No inventory alerts</p>
          </Card>
        )}
      </div>

      {/* Additional Modules */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Modules</h2>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory')}
            className="flex flex-col items-center justify-center py-3"
          >
            <FaBoxes className="text-lg mb-1" />
            <span className="text-xs">Inventory</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/customers')}
            className="flex flex-col items-center justify-center py-3"
          >
            <FaUsers className="text-lg mb-1" />
            <span className="text-xs">Customers</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center py-3"
          >
            <FaReceipt className="text-lg mb-1" />
            <span className="text-xs">Reports</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
