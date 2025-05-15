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

const DrugTherapyProblemReport: React.FC = () => {
  const { drugTherapyProblems, isLoading } = useSelector((state: RootState) => state.reporting);

  if (isLoading || !drugTherapyProblems) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Format DTP status data for chart
  const dtpStatusData = [
    { name: 'Resolved', value: drugTherapyProblems.resolvedDTPs },
    { name: 'In Progress', value: drugTherapyProblems.inProgressDTPs },
    { name: 'Unresolved', value: drugTherapyProblems.unresolvedDTPs },
  ].filter(item => item.value > 0);

  // Format DTP by age group data for chart
  const dtpByAgeGroupData = [
    { name: '0-18', value: drugTherapyProblems.dtpByAgeGroup.children },
    { name: '19-35', value: drugTherapyProblems.dtpByAgeGroup.youngAdults },
    { name: '36-50', value: drugTherapyProblems.dtpByAgeGroup.middleAged },
    { name: '51-65', value: drugTherapyProblems.dtpByAgeGroup.seniors },
    { name: '65+', value: drugTherapyProblems.dtpByAgeGroup.elderly },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Drug Therapy Problems</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total DTPs</h3>
            </div>
            <div className="flex justify-center items-center h-32">
              <div className="text-5xl font-bold text-primary-600">{drugTherapyProblems.totalDTPs}</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Resolved DTPs</h3>
            </div>
            <div className="flex justify-center items-center h-32">
              <div className="text-5xl font-bold text-green-600">{drugTherapyProblems.resolvedDTPs}</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">In Progress DTPs</h3>
            </div>
            <div className="flex justify-center items-center h-32">
              <div className="text-5xl font-bold text-yellow-600">{drugTherapyProblems.inProgressDTPs}</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Resolution Rate</h3>
            </div>
            <div className="flex justify-center items-center h-32">
              <div className="text-5xl font-bold text-primary-600">
                {drugTherapyProblems.resolutionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">DTP Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dtpStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dtpStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === 'Resolved' 
                            ? '#10B981' 
                            : entry.name === 'In Progress' 
                              ? '#F59E0B' 
                              : '#EF4444'
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
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">DTP Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={drugTherapyProblems.dtpCategoriesChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {drugTherapyProblems.dtpCategoriesChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
      
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">DTPs by Age Group</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dtpByAgeGroupData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Drug Therapy Problems" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DrugTherapyProblemReport;
