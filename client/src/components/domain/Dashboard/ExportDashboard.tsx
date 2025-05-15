import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Button from '@/components/common/Button/Button';
import { formatDate } from '@/utils/date.utils';

interface ExportDashboardProps {
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

const ExportDashboard: React.FC<ExportDashboardProps> = ({ dateRange }) => {
  const { stats, isLoading } = useSelector((state: RootState) => state.dashboard);

  if (isLoading || !stats) {
    return null;
  }

  const generateCSV = (data: any[], headers: string[], filename: string) => {
    // Create CSV header row
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in the value
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPatientData = () => {
    // Prepare patient data for export
    const patientData = [
      {
        category: 'Total Patients',
        value: stats.totalPatients,
      },
      {
        category: 'Male Patients',
        value: stats.genderDistribution.male,
      },
      {
        category: 'Female Patients',
        value: stats.genderDistribution.female,
      },
      {
        category: 'Other Gender',
        value: stats.genderDistribution.other,
      },
      {
        category: 'Children (0-18)',
        value: stats.ageDistribution.children,
      },
      {
        category: 'Young Adults (19-35)',
        value: stats.ageDistribution.youngAdults,
      },
      {
        category: 'Middle Aged (36-50)',
        value: stats.ageDistribution.middleAged,
      },
      {
        category: 'Seniors (51-65)',
        value: stats.ageDistribution.seniors,
      },
      {
        category: 'Elderly (65+)',
        value: stats.ageDistribution.elderly,
      },
      {
        category: 'Patients with Allergies',
        value: stats.recordsDistribution.withAllergies,
      },
      {
        category: 'Patients with Medical Conditions',
        value: stats.recordsDistribution.withMedicalConditions,
      },
      {
        category: 'Patients with Medication History',
        value: stats.recordsDistribution.withMedicationHistory,
      },
      {
        category: 'Patients with Clinical Assessments',
        value: stats.recordsDistribution.withClinicalAssessments,
      },
      {
        category: 'Patients with Laboratory Findings',
        value: stats.recordsDistribution.withLaboratoryFindings,
      },
      {
        category: 'Patients with Drug Therapy Problems',
        value: stats.recordsDistribution.withDrugTherapyProblems,
      },
      {
        category: 'Patients with Care Plans',
        value: stats.recordsDistribution.withCarePlans,
      },
      {
        category: 'Patients with SOAP Notes',
        value: stats.recordsDistribution.withSoapNotes,
      },
    ];

    // Generate filename with date range if available
    let filename = 'patient_statistics';
    if (dateRange?.startDate && dateRange?.endDate) {
      filename += `_${formatDate(dateRange.startDate).replace(/\//g, '-')}_to_${formatDate(
        dateRange.endDate
      ).replace(/\//g, '-')}`;
    }
    filename += '.csv';

    generateCSV(patientData, ['category', 'value'], filename);
  };

  const exportMedicationData = () => {
    if (!stats.medicationStats) return;

    // Prepare medication category data
    const categoryData = stats.medicationStats.categoriesDistribution.map(item => ({
      category: item.name,
      count: item.count,
    }));

    // Generate filename with date range if available
    let filename = 'medication_categories';
    if (dateRange?.startDate && dateRange?.endDate) {
      filename += `_${formatDate(dateRange.startDate).replace(/\//g, '-')}_to_${formatDate(
        dateRange.endDate
      ).replace(/\//g, '-')}`;
    }
    filename += '.csv';

    generateCSV(categoryData, ['category', 'count'], filename);
  };

  const exportFrequentMedicationsData = () => {
    if (!stats.medicationStats) return;

    // Prepare frequent medications data
    const medicationData = stats.medicationStats.frequentMedications.map(item => ({
      medication: item.name,
      count: item.count,
    }));

    // Generate filename with date range if available
    let filename = 'frequent_medications';
    if (dateRange?.startDate && dateRange?.endDate) {
      filename += `_${formatDate(dateRange.startDate).replace(/\//g, '-')}_to_${formatDate(
        dateRange.endDate
      ).replace(/\//g, '-')}`;
    }
    filename += '.csv';

    generateCSV(medicationData, ['medication', 'count'], filename);
  };

  const exportDTPData = () => {
    if (!stats.dtpStats) return;

    // Prepare DTP data
    const dtpData = [
      {
        category: 'Total DTPs',
        count: stats.dtpStats.totalDTPs,
      },
      {
        category: 'Resolved DTPs',
        count: stats.dtpStats.resolvedDTPs,
      },
      {
        category: 'In Progress DTPs',
        count: stats.dtpStats.inProgressDTPs,
      },
      {
        category: 'Unresolved DTPs',
        count: stats.dtpStats.unresolvedDTPs,
      },
    ];

    // Add category distribution
    stats.dtpStats.categoriesDistribution.forEach(item => {
      dtpData.push({
        category: `Category: ${item.name}`,
        count: item.count,
      });
    });

    // Generate filename with date range if available
    let filename = 'dtp_statistics';
    if (dateRange?.startDate && dateRange?.endDate) {
      filename += `_${formatDate(dateRange.startDate).replace(/\//g, '-')}_to_${formatDate(
        dateRange.endDate
      ).replace(/\//g, '-')}`;
    }
    filename += '.csv';

    generateCSV(dtpData, ['category', 'count'], filename);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Export Dashboard Data</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={exportPatientData}>
          Export Patient Statistics
        </Button>
        <Button variant="outline" size="sm" onClick={exportMedicationData}>
          Export Medication Categories
        </Button>
        <Button variant="outline" size="sm" onClick={exportFrequentMedicationsData}>
          Export Frequent Medications
        </Button>
        <Button variant="outline" size="sm" onClick={exportDTPData}>
          Export DTP Statistics
        </Button>
      </div>
    </div>
  );
};

export default ExportDashboard;
