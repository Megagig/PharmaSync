import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { DateRange } from './DateRangeFilter';

interface PatientSectionProps {
  dateRange: DateRange;
}

const PatientSection: React.FC<PatientSectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  const { stats, isLoading } = useSelector((state: RootState) => state.dashboard);

  if (isLoading || !stats) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Patient Management</h2>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Prepare data for gender distribution chart
  const genderData = [
    { name: 'Male', value: stats.genderDistribution.male },
    { name: 'Female', value: stats.genderDistribution.female },
    { name: 'Other', value: stats.genderDistribution.other },
  ];

  // Prepare data for age distribution chart
  const ageData = [
    { name: '0-18', value: stats.ageDistribution.children },
    { name: '19-35', value: stats.ageDistribution.youngAdults },
    { name: '36-50', value: stats.ageDistribution.middleAged },
    { name: '51-65', value: stats.ageDistribution.seniors },
    { name: '65+', value: stats.ageDistribution.elderly },
  ];

  // Upcoming follow-ups
  const upcomingFollowUps = stats.upcomingFollowUps || [];

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">Patient Management</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/patients')}
          >
            View All Patients
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Gender Distribution</h3>
            <ChartContainer
              title="Gender Distribution"
              type={ChartType.PIE}
              data={genderData}
              height={150}
              options={{
                showLegend: true,
                colors: ['#3B82F6', '#EC4899', '#8B5CF6'],
              }}
            />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Age Distribution</h3>
            <ChartContainer
              title="Age Distribution"
              type={ChartType.BAR}
              data={ageData}
              height={150}
              options={{
                showLegend: false,
                colors: ['#3B82F6'],
                xAxisLabel: 'Age Group',
                yAxisLabel: 'Count',
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Upcoming Follow-ups</h3>
          {upcomingFollowUps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingFollowUps.slice(0, 3).map((followUp, index) => (
                    <tr 
                      key={index} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/patients/${followUp.patientId}`)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{followUp.patientName}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{followUp.date}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{followUp.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming follow-ups scheduled.</p>
          )}
          {upcomingFollowUps.length > 3 && (
            <div className="mt-2 text-right">
              <Button 
                variant="text" 
                size="sm" 
                onClick={() => navigate('/calendar')}
              >
                View All
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PatientSection;
