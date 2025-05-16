import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ComprehensiveDemographicsReport: React.FC = () => {
  const { patientReport, isLoading } = useSelector(
    (state: RootState) => state.comprehensiveReports
  );

  if (!patientReport) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-500">
          <p>No patient demographics data available. Please generate a report.</p>
        </div>
      </Card>
    );
  }

  // Prepare gender data for pie chart
  const genderData = [
    { name: 'Male', value: patientReport.summary.maleCount },
    { name: 'Female', value: patientReport.summary.femaleCount },
    { name: 'Other', value: patientReport.summary.otherGenderCount },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Patient Demographics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patientReport.summary.totalPatients}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Male Patients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patientReport.summary.maleCount} 
                <span className="text-sm text-gray-500 ml-1">
                  ({((patientReport.summary.maleCount / patientReport.summary.totalPatients) * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Female Patients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patientReport.summary.femaleCount}
                <span className="text-sm text-gray-500 ml-1">
                  ({((patientReport.summary.femaleCount / patientReport.summary.totalPatients) * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Gender Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
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
              Age Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={patientReport.patientsByAgeGroup || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                  <Bar dataKey="count" name="Patient Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Top Medical Conditions
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={patientReport.topMedicalConditions || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="condition" width={150} />
                <Tooltip formatter={(value) => value} />
                <Legend />
                <Bar dataKey="count" name="Patient Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Top Allergies
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={patientReport.topAllergies || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="allergen" width={150} />
                <Tooltip formatter={(value) => value} />
                <Legend />
                <Bar dataKey="count" name="Patient Count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComprehensiveDemographicsReport;
