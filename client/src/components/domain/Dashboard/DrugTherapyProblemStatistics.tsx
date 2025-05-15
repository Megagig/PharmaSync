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
} from 'recharts';

const DrugTherapyProblemStatistics: React.FC = () => {
  const { stats, isLoading } = useSelector((state: RootState) => state.dashboard);

  if (isLoading || !stats) {
    return null;
  }

  // Prepare data for DTP categories chart
  const dtpCategoriesData = stats.dtpStats?.categoriesDistribution || [];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Drug Therapy Problem Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">DTP Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dtpCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dtpCategoriesData.map((entry, index) => (
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

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">DTP Statistics</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Total DTPs Identified</p>
                <p className="text-2xl font-bold text-blue-900">{stats.dtpStats?.totalDTPs || 0}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800">Resolved DTPs</p>
                <p className="text-2xl font-bold text-green-900">{stats.dtpStats?.resolvedDTPs || 0}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">In Progress DTPs</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.dtpStats?.inProgressDTPs || 0}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-800">Unresolved DTPs</p>
                <p className="text-2xl font-bold text-red-900">{stats.dtpStats?.unresolvedDTPs || 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DrugTherapyProblemStatistics;
