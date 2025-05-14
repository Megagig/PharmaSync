import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPrescriptionReport } from '@/store/slices/reportsSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

const PrescriptionReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptionReport, isLoading, error } = useSelector((state: RootState) => state.reports);

  const [startDate, setStartDate] = useState(
    formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  );
  const [endDate, setEndDate] = useState(formatDateToISO(new Date()));

  useEffect(() => {
    dispatch(fetchPrescriptionReport({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleGenerateReport = () => {
    dispatch(fetchPrescriptionReport({ startDate, endDate }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Prescription Report</h1>
        <Button variant="outline" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Date Range</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
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
              <Button variant="primary" onClick={handleGenerateReport} isLoading={isLoading}>
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
          <p className="text-gray-500">Loading prescription report data...</p>
        </div>
      ) : prescriptionReport ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Prescriptions
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {prescriptionReport.summary.totalPrescriptions}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-500">Active:</span>
                    <span className="ml-1 text-sm font-medium text-green-600">
                      {prescriptionReport.summary.activeCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Completed:</span>
                    <span className="ml-1 text-sm font-medium text-blue-600">
                      {prescriptionReport.summary.completedCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Pending:</span>
                    <span className="ml-1 text-sm font-medium text-yellow-600">
                      {prescriptionReport.summary.pendingCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Cancelled:</span>
                    <span className="ml-1 text-sm font-medium text-red-600">
                      {prescriptionReport.summary.cancelledCount}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Items Per Prescription
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {prescriptionReport.summary.averageItemsPerPrescription.toFixed(2)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </h3>
                <p className="mt-2 text-sm text-gray-900">
                  {new Date(prescriptionReport.dateRange.startDate).toLocaleDateString()} to{' '}
                  {new Date(prescriptionReport.dateRange.endDate).toLocaleDateString()}
                </p>
              </div>
            </Card>
          </div>

          {/* Prescriptions by Date */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Prescriptions by Date</h2>
              {prescriptionReport.prescriptionsByDate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Prescriptions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescriptionReport.prescriptionsByDate.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No prescription data available for the selected period.</p>
              )}
            </div>
          </Card>

          {/* Top Prescribed Medications */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top Prescribed Medications</h2>
              {prescriptionReport.topPrescribedMedications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prescription Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Prescriptions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescriptionReport.topPrescribedMedications.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.medicationName} ({item.strength})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.prescriptionCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {((item.prescriptionCount / prescriptionReport.summary.totalPrescriptions) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No medication prescription data available.</p>
              )}
            </div>
          </Card>

          {/* Status Distribution */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Prescription Status Distribution</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800">Active</h3>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {prescriptionReport.summary.activeCount}
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    {prescriptionReport.summary.totalPrescriptions > 0
                      ? ((prescriptionReport.summary.activeCount / prescriptionReport.summary.totalPrescriptions) * 100).toFixed(2)
                      : 0}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800">Completed</h3>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {prescriptionReport.summary.completedCount}
                  </p>
                  <p className="mt-1 text-sm text-blue-600">
                    {prescriptionReport.summary.totalPrescriptions > 0
                      ? ((prescriptionReport.summary.completedCount / prescriptionReport.summary.totalPrescriptions) * 100).toFixed(2)
                      : 0}%
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
                  <p className="mt-2 text-2xl font-bold text-yellow-600">
                    {prescriptionReport.summary.pendingCount}
                  </p>
                  <p className="mt-1 text-sm text-yellow-600">
                    {prescriptionReport.summary.totalPrescriptions > 0
                      ? ((prescriptionReport.summary.pendingCount / prescriptionReport.summary.totalPrescriptions) * 100).toFixed(2)
                      : 0}%
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800">Cancelled</h3>
                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {prescriptionReport.summary.cancelledCount}
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    {prescriptionReport.summary.totalPrescriptions > 0
                      ? ((prescriptionReport.summary.cancelledCount / prescriptionReport.summary.totalPrescriptions) * 100).toFixed(2)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500">No prescription report data available. Please generate a report.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionReport;
