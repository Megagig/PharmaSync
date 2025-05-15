import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchLowStockAlerts,
  fetchExpiringStockAlerts,
  fetchInventoryValuation,
} from '@/store/slices/inventorySlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const InventoryDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    lowStockAlerts,
    expiringStockAlerts,
    inventoryValuation,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.inventory);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiryDays, setExpiryDays] = useState(90);

  useEffect(() => {
    dispatch(fetchLowStockAlerts(lowStockThreshold));
    dispatch(fetchExpiringStockAlerts(expiryDays));
    dispatch(fetchInventoryValuation());
  }, [dispatch, lowStockThreshold, expiryDays]);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLowStockThreshold(value);
    }
  };

  const handleExpiryDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setExpiryDays(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Inventory Dashboard
        </h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/movement')}
          >
            Inventory Movement
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/adjust')}
          >
            Adjust Inventory
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/purchase-orders/new')}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Quick Access Menu */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/products')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Products</h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/stock-levels')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Stock Levels
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/price-management')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pricing</h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/expiry-tracking')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Expiry Tracking
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/purchases')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Purchases
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/purchase-orders')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Purchase Orders
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/suppliers')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Suppliers
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/customers')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Customers
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/locations')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Locations
            </h3>
          </div>
        </Card>
        <Card>
          <div
            className="p-4 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/inventory/reports')}
          >
            <svg
              className="w-8 h-8 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports</h3>
          </div>
        </Card>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Total Inventory Value
            </h2>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : inventoryValuation ? (
              <p className="text-3xl font-bold text-indigo-600">
                ₦{inventoryValuation.totalValue.toFixed(2)}
              </p>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Low Stock Items
            </h2>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="text-3xl font-bold text-yellow-600">
                {lowStockAlerts.length}
              </p>
            )}
            <div className="mt-2">
              <label
                htmlFor="threshold"
                className="block text-sm font-medium text-gray-700"
              >
                Threshold
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="threshold"
                  className="form-input rounded-md"
                  value={lowStockThreshold}
                  onChange={handleThresholdChange}
                  min="1"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Expiring Items
            </h2>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="text-3xl font-bold text-red-600">
                {expiringStockAlerts.length}
              </p>
            )}
            <div className="mt-2">
              <label
                htmlFor="expiryDays"
                className="block text-sm font-medium text-gray-700"
              >
                Days until expiry
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="expiryDays"
                  className="form-input rounded-md"
                  value={expiryDays}
                  onChange={handleExpiryDaysChange}
                  min="1"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Low Stock Alerts
          </h2>
          {isLoading ? (
            <p className="text-gray-500">Loading low stock alerts...</p>
          ) : lowStockAlerts.length > 0 ? (
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
                      Reorder Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.name} ({alert.strength})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {alert.totalStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.reorderLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => navigate(`/medications/${alert.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate('/purchase-orders/new')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No low stock alerts found.</p>
          )}
        </div>
      </Card>

      {/* Expiring Stock Alerts */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Expiring Stock Alerts
          </h2>
          {isLoading ? (
            <p className="text-gray-500">Loading expiring stock alerts...</p>
          ) : expiringStockAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringStockAlerts.map((alert, index) => (
                    <tr
                      key={`${alert.medicationId}-${alert.batchNumber}-${index}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.medicationName} ({alert.strength})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.batchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(alert.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            alert.daysUntilExpiry <= 30
                              ? 'bg-red-100 text-red-800'
                              : alert.daysUntilExpiry <= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {alert.daysUntilExpiry}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() =>
                            navigate(`/medications/${alert.medicationId}`)
                          }
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate('/inventory/adjust')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No expiring stock alerts found.</p>
          )}
        </div>
      </Card>

      {/* Top Valued Medications */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Top Valued Medications
          </h2>
          {isLoading ? (
            <p className="text-gray-500">Loading inventory valuation...</p>
          ) : inventoryValuation &&
            inventoryValuation.medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryValuation.medications
                    .slice(0, 5)
                    .map((medication) => (
                      <tr key={medication.medicationId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.medicationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.totalStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{medication.value.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() =>
                              navigate(
                                `/medications/${medication.medicationId}`
                              )
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">
              No inventory valuation data available.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
