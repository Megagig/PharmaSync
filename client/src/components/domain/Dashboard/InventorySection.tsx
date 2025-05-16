import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { DateRange } from './DateRangeFilter';

interface InventorySectionProps {
  dateRange: DateRange;
}

const InventorySection: React.FC<InventorySectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  
  // In a real implementation, this would come from the Redux store
  // For now, we'll use placeholder data
  const isLoading = false;
  
  const inventoryData = {
    lowStockItems: [
      { id: '1', name: 'Paracetamol 500mg', totalStock: 15, reorderLevel: 20 },
      { id: '2', name: 'Amoxicillin 250mg', totalStock: 8, reorderLevel: 15 },
      { id: '3', name: 'Metformin 500mg', totalStock: 12, reorderLevel: 25 },
    ],
    expiringItems: [
      { id: '1', name: 'Ciprofloxacin 500mg', expiryDate: '2023-12-15', daysUntilExpiry: 30, quantity: 45 },
      { id: '2', name: 'Diazepam 5mg', expiryDate: '2023-12-20', daysUntilExpiry: 35, quantity: 20 },
    ],
    inventoryValue: '₦3,450,000',
    stockDistribution: [
      { name: 'Antibiotics', value: 25 },
      { name: 'Analgesics', value: 30 },
      { name: 'Antidiabetics', value: 15 },
      { name: 'Antihypertensives', value: 20 },
      { name: 'Others', value: 10 },
    ],
    stockStatus: [
      { name: 'In Stock', value: 85 },
      { name: 'Low Stock', value: 10 },
      { name: 'Out of Stock', value: 5 },
    ],
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Inventory Management</h2>
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
          <h2 className="text-xl font-medium text-gray-900">Inventory Management</h2>
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
            <h3 className="text-md font-medium text-gray-700 mb-2">Stock Distribution</h3>
            <ChartContainer
              title="Stock Distribution"
              type={ChartType.PIE}
              data={inventoryData.stockDistribution}
              height={150}
              options={{
                showLegend: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
              }}
            />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Stock Status</h3>
            <ChartContainer
              title="Stock Status"
              type={ChartType.DOUGHNUT}
              data={inventoryData.stockStatus}
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
            <h3 className="text-md font-medium text-gray-700 mb-2">Low Stock Alerts</h3>
            {inventoryData.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.lowStockItems.map((item, index) => (
                      <tr 
                        key={index} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate('/inventory/products')}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-500">{item.totalStock}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.reorderLevel}</td>
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
            <h3 className="text-md font-medium text-gray-700 mb-2">Expiring Soon</h3>
            {inventoryData.expiringItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.expiringItems.map((item, index) => (
                      <tr 
                        key={index} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate('/inventory/products')}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-500">{item.daysUntilExpiry} days</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products expiring soon.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InventorySection;
