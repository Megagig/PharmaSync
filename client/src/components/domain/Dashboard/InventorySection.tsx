import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { DateRange } from './DateRangeFilter';
import {
  fetchLowStockAlerts,
  fetchExpiringStockAlerts,
} from '@/store/slices/inventorySlice';
import { fetchInventoryReport } from '@/store/slices/reportsSlice';
import { formatCurrency } from '@/utils/formatters';

interface InventorySectionProps {
  dateRange: DateRange;
}

const InventorySection: React.FC<InventorySectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    lowStockAlerts,
    expiringStockAlerts,
    isLoading: inventoryLoading,
  } = useSelector((state: RootState) => state.inventory);

  const { inventoryReport, isLoading: reportLoading } = useSelector(
    (state: RootState) => state.reports
  );

  useEffect(() => {
    // Fetch inventory data
    dispatch(fetchLowStockAlerts());
    dispatch(fetchExpiringStockAlerts(90)); // Fetch expiring items within 90 days
    dispatch(fetchInventoryReport());
  }, [dispatch]);

  const isLoading = inventoryLoading || reportLoading;

  // Prepare data for charts
  const stockDistribution =
    inventoryReport?.categoryDistribution?.map((item) => ({
      name: item.category,
      value: item.count,
    })) || [];

  const stockStatus = [
    { name: 'In Stock', value: inventoryReport?.stockStatus?.inStock || 0 },
    { name: 'Low Stock', value: inventoryReport?.stockStatus?.lowStock || 0 },
    {
      name: 'Out of Stock',
      value: inventoryReport?.stockStatus?.outOfStock || 0,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Inventory Management
          </h2>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">
            Inventory Management
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inventory')}
          >
            View Inventory
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Stock Distribution
            </h3>
            <ChartContainer
              title="Stock Distribution"
              type={ChartType.PIE}
              data={stockDistribution}
              height={150}
              options={{
                showLegend: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
              }}
            />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Stock Status
            </h3>
            <ChartContainer
              title="Stock Status"
              type={ChartType.DOUGHNUT}
              data={stockStatus}
              height={150}
              options={{
                showLegend: true,
                colors: ['#10B981', '#F59E0B', '#EF4444'],
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Low Stock Alerts
            </h3>
            {lowStockAlerts && lowStockAlerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reorder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lowStockAlerts.slice(0, 3).map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          navigate(`/inventory/products/${item.productId}`)
                        }
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-500">
                          {item.currentStock}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.reorderLevel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No low stock items.</p>
            )}
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Expiring Soon
              <span className="ml-2 text-xs font-normal text-gray-500">
                (Next 90 days)
              </span>
            </h3>
            {expiringStockAlerts && expiringStockAlerts.length > 0 ? (
              <div>
                <div className="flex space-x-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    &lt; 30 days
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    30-60 days
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    60-90 days
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires In
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expiringStockAlerts.slice(0, 3).map((item, index) => (
                        <tr
                          key={item.id || index}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            navigate(`/inventory/products/${item.productId}`)
                          }
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.daysUntilExpiry <= 30
                                  ? 'bg-red-100 text-red-800'
                                  : item.daysUntilExpiry <= 60
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.daysUntilExpiry} days
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-right">
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => navigate('/inventory/expiry-tracking')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No products expiring soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InventorySection;
