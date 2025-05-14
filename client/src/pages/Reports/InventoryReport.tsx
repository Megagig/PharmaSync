import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchInventoryReport } from '@/store/slices/reportsSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const InventoryReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventoryReport, isLoading, error } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    dispatch(fetchInventoryReport());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchInventoryReport());
  };

  const getExpiryPeriodLabel = (period: string) => {
    switch (period) {
      case 'expired':
        return 'Expired';
      case 'within1Month':
        return 'Within 1 Month';
      case 'within3Months':
        return 'Within 3 Months';
      case 'within6Months':
        return 'Within 6 Months';
      case 'after6Months':
        return 'After 6 Months';
      default:
        return period;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Report</h1>
        <div className="flex space-x-3">
          <Button variant="primary" onClick={handleRefresh} isLoading={isLoading}>
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => navigate('/reports')}>
            Back to Reports
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading inventory report data...</p>
        </div>
      ) : inventoryReport ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Medications
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {inventoryReport.summary.totalMedications}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Stock
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {inventoryReport.summary.totalStock}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  ${inventoryReport.summary.totalValue.toFixed(2)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Low Stock Items
                </h3>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {inventoryReport.summary.lowStockCount}
                </p>
              </div>
            </Card>
          </div>

          {/* Stock by Category */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Stock by Category</h2>
              {inventoryReport.stockByCategory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Medications
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryReport.stockByCategory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.totalValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {((item.totalValue / inventoryReport.summary.totalValue) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No category data available.</p>
              )}
            </div>
          </Card>

          {/* Expiry Breakdown */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Expiry Breakdown</h2>
              {inventoryReport.expiryBreakdown.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Batches
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryReport.expiryBreakdown.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getExpiryPeriodLabel(item.expiryPeriod)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.totalValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {((item.totalValue / inventoryReport.summary.totalValue) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No expiry data available.</p>
              )}
            </div>
          </Card>

          {/* Inventory Turnover */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Turnover (Last 6 Months)</h2>
              {inventoryReport.inventoryTurnover.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Dispensed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Turnover Ratio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryReport.inventoryTurnover.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.medicationName} ({item.strength})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalDispensed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.turnoverRatio.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No turnover data available.</p>
              )}
              <p className="mt-4 text-sm text-gray-500">
                <strong>Note:</strong> Turnover ratio is calculated as (Total Dispensed / Current Stock).
                Higher values indicate faster-moving inventory.
              </p>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500">No inventory report data available. Please refresh the data.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryReport;
