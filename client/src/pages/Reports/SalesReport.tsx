import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchSalesReport } from '@/store/slices/reportsSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

const SalesReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { salesReport, isLoading, error } = useSelector(
    (state: RootState) => state.reports
  );

  const [startDate, setStartDate] = useState(
    formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  );
  const [endDate, setEndDate] = useState(formatDateToISO(new Date()));

  useEffect(() => {
    dispatch(fetchSalesReport({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleGenerateReport = () => {
    dispatch(fetchSalesReport({ startDate, endDate }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Report</h1>
        <Button variant="outline" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Range</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleGenerateReport}
                isLoading={isLoading}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading sales report data...</p>
        </div>
      ) : salesReport ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sales
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  ₦{salesReport.summary.totalSales.toFixed(2)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Dispensings
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {salesReport.summary.totalDispensings}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Sale
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  ₦{salesReport.summary.averageSale.toFixed(2)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </h3>
                <p className="mt-2 text-sm text-gray-900">
                  {new Date(
                    salesReport.dateRange.startDate
                  ).toLocaleDateString()}{' '}
                  to{' '}
                  {new Date(salesReport.dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
            </Card>
          </div>

          {/* Sales by Date */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Sales by Date
              </h2>
              {salesReport.salesByDate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Sale
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.salesByDate.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{item.totalSales.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{(item.totalSales / item.count).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">
                  No sales data available for the selected period.
                </p>
              )}
            </div>
          </Card>

          {/* Payment Method Breakdown */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Method Breakdown
              </h2>
              {salesReport.paymentMethodBreakdown.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.paymentMethodBreakdown.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.paymentMethod.charAt(0).toUpperCase() +
                              item.paymentMethod.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{item.totalSales.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(
                              (item.totalSales /
                                salesReport.summary.totalSales) *
                              100
                            ).toFixed(2)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">
                  No payment method data available.
                </p>
              )}
            </div>
          </Card>

          {/* Top Selling Medications */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Top Selling Medications
              </h2>
              {salesReport.topSellingMedications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Sales
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.topSellingMedications.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.medicationName} ({item.strength})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{item.totalSales.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(
                              (item.totalSales /
                                salesReport.summary.totalSales) *
                              100
                            ).toFixed(2)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">
                  No medication sales data available.
                </p>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500">
              No sales report data available. Please generate a report.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesReport;
