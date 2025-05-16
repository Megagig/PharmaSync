import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';
import { DateRange } from './DateRangeFilter';

interface MedicationSectionProps {
  dateRange: DateRange;
}

const MedicationSection: React.FC<MedicationSectionProps> = ({ dateRange }) => {
  const navigate = useNavigate();
  const { stats, isLoading } = useSelector((state: RootState) => state.dashboard);

  if (isLoading || !stats) {
    return (
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Medication Management</h2>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Prepare data for medication categories chart
  const categoriesData = stats.medicationStats?.categoriesDistribution || [];
  
  // Prepare data for frequent medications chart
  const frequentMedicationsData = stats.medicationStats?.frequentMedications || [];

  // Prepare data for DTP chart
  const dtpData = [
    { name: 'Resolved', value: stats.dtpStats?.resolvedDTPs || 0 },
    { name: 'In Progress', value: stats.dtpStats?.inProgressDTPs || 0 },
    { name: 'Unresolved', value: stats.dtpStats?.unresolvedDTPs || 0 },
  ];

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">Medication Management</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/medications')}
          >
            View All Medications
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Medication Categories</h3>
            <ChartContainer
              title="Medication Categories"
              type={ChartType.PIE}
              data={categoriesData.slice(0, 5).map(item => ({ name: item.name, value: item.count }))}
              height={150}
              options={{
                showLegend: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
              }}
            />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Drug Therapy Problems</h3>
            <ChartContainer
              title="Drug Therapy Problems"
              type={ChartType.DOUGHNUT}
              data={dtpData}
              height={150}
              options={{
                showLegend: true,
                colors: ['#10B981', '#F59E0B', '#EF4444'],
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">Frequently Used Medications</h3>
          {frequentMedicationsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {frequentMedicationsData.slice(0, 5).map((medication, index) => (
                    <tr 
                      key={index} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate('/medications')}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{medication.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{medication.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No medication usage data available.</p>
          )}
          {frequentMedicationsData.length > 5 && (
            <div className="mt-2 text-right">
              <Button 
                variant="text" 
                size="sm" 
                onClick={() => navigate('/reports/medication-usage')}
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

export default MedicationSection;
