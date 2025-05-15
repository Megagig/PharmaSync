import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const PatientOutcomesReport: React.FC = () => {
  const { patientOutcomes, isLoading } = useSelector((state: RootState) => state.reporting);

  if (isLoading || !patientOutcomes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Format care plan status data for chart
  const carePlanStatusData = [
    { name: 'Completed', value: patientOutcomes.carePlans.completed },
    { name: 'In Progress', value: patientOutcomes.carePlans.inProgress },
    { name: 'Other', value: patientOutcomes.carePlans.total - patientOutcomes.carePlans.completed - patientOutcomes.carePlans.inProgress },
  ].filter(item => item.value > 0);

  // Format SOAP note follow-up data for chart
  const soapNoteFollowUpData = [
    { name: 'Completed', value: patientOutcomes.soapNotes.followUpCompleted },
    { name: 'Scheduled', value: patientOutcomes.soapNotes.followUpScheduled },
    { name: 'No Follow-up', value: patientOutcomes.soapNotes.total - patientOutcomes.soapNotes.followUpCompleted - patientOutcomes.soapNotes.followUpScheduled },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Patient Outcomes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Care Plans</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-900">Total Care Plans</h4>
                </div>
                <div className="flex justify-center items-center h-32">
                  <div className="text-5xl font-bold text-primary-600">{patientOutcomes.carePlans.total}</div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-900">Completion Rate</h4>
                </div>
                <div className="flex justify-center items-center h-32">
                  <div className="text-5xl font-bold text-green-600">
                    {patientOutcomes.carePlans.completionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <Card>
            <div className="p-4">
              <h4 className="text-base font-medium text-gray-900 mb-4">Care Plan Status</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={carePlanStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {carePlanStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Completed' 
                              ? '#10B981' 
                              : entry.name === 'In Progress' 
                                ? '#F59E0B' 
                                : '#6B7280'
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">SOAP Notes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-900">Total SOAP Notes</h4>
                </div>
                <div className="flex justify-center items-center h-32">
                  <div className="text-5xl font-bold text-primary-600">{patientOutcomes.soapNotes.total}</div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-900">Follow-up Completion Rate</h4>
                </div>
                <div className="flex justify-center items-center h-32">
                  <div className="text-5xl font-bold text-green-600">
                    {patientOutcomes.soapNotes.followUpCompletionRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <Card>
            <div className="p-4">
              <h4 className="text-base font-medium text-gray-900 mb-4">SOAP Note Follow-ups</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={soapNoteFollowUpData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {soapNoteFollowUpData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Completed' 
                              ? '#10B981' 
                              : entry.name === 'Scheduled' 
                                ? '#F59E0B' 
                                : '#6B7280'
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Outcome Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Metric
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Value
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Care Plan Completion Rate
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patientOutcomes.carePlans.completionRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Percentage of care plans that have been completed
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Follow-up Completion Rate
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patientOutcomes.soapNotes.followUpCompletionRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Percentage of scheduled follow-ups that have been completed
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Care Plans per Patient
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(patientOutcomes.carePlans.total / (patientOutcomes.carePlans.total > 0 ? patientOutcomes.carePlans.total : 1)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Average number of care plans per patient
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    SOAP Notes per Patient
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(patientOutcomes.soapNotes.total / (patientOutcomes.soapNotes.total > 0 ? patientOutcomes.soapNotes.total : 1)).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Average number of SOAP notes per patient
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientOutcomesReport;
