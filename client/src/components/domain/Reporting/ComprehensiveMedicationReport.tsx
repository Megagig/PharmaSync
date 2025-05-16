import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ComprehensiveMedicationReport: React.FC = () => {
  const { medicationReport, isLoading } = useSelector(
    (state: RootState) => state.comprehensiveReports
  );

  if (!medicationReport) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-500">
          <p>No medication usage data available. Please generate a report.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Medication Usage Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Medications</p>
              <p className="text-2xl font-semibold text-gray-900">
                {medicationReport.summary.totalMedications}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Prescriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {medicationReport.summary.totalPrescriptions}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Dispensings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {medicationReport.summary.totalDispensings}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Top Prescribed Medications
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={medicationReport.topPrescribedMedications || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="medicationName" width={150} />
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                  <Bar dataKey="prescriptionCount" name="Prescription Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Top Dispensed Medications
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={medicationReport.topDispensedMedications || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="medicationName" width={150} />
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                  <Bar dataKey="dispensedCount" name="Dispensed Count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Medication Categories
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={medicationReport.summary.medicationCategories || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(medicationReport.summary.medicationCategories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Medication Usage Details
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generic Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescriptions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispensed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(medicationReport.medicationUsage || []).slice(0, 10).map((medication, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{medication.medicationName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medication.genericName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medication.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medication.prescriptionCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medication.dispensedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{medication.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(medicationReport.medicationUsage || []).length > 10 && (
            <div className="mt-4 text-center text-gray-500">
              <p>Showing 10 of {medicationReport.medicationUsage.length} medications. Export the report to see all data.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ComprehensiveMedicationReport;
