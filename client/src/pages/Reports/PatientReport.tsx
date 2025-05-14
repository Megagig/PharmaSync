import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientReport } from '@/store/slices/reportsSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const PatientReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientReport, isLoading, error } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    dispatch(fetchPatientReport());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPatientReport());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Patient Report</h1>
        <div className="flex space-x-3">
          <Button variant="primary" onClick={handleRefresh} isLoading={isLoading}>
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => navigate('/reports')}>
            Back to Reports
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading patient report data...</p>
        </div>
      ) : patientReport ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Patients
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {patientReport.summary.totalPatients}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Male Patients
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {patientReport.summary.maleCount}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {patientReport.summary.totalPatients > 0
                    ? ((patientReport.summary.maleCount / patientReport.summary.totalPatients) * 100).toFixed(2)
                    : 0}%
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Female Patients
                </h3>
                <p className="mt-2 text-3xl font-bold text-pink-600">
                  {patientReport.summary.femaleCount}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {patientReport.summary.totalPatients > 0
                    ? ((patientReport.summary.femaleCount / patientReport.summary.totalPatients) * 100).toFixed(2)
                    : 0}%
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other Gender
                </h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {patientReport.summary.otherGenderCount}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {patientReport.summary.totalPatients > 0
                    ? ((patientReport.summary.otherGenderCount / patientReport.summary.totalPatients) * 100).toFixed(2)
                    : 0}%
                </p>
              </div>
            </Card>
          </div>

          {/* Patients by Age Group */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Patients by Age Group</h2>
              {patientReport.patientsByAgeGroup.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age Group
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Patients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientReport.patientsByAgeGroup.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.ageGroup}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patientReport.summary.totalPatients > 0
                              ? ((item.count / patientReport.summary.totalPatients) * 100).toFixed(2)
                              : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No age group data available.</p>
              )}
            </div>
          </Card>

          {/* Top Medical Conditions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top Medical Conditions</h2>
              {patientReport.topMedicalConditions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Patients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Patients
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientReport.topMedicalConditions.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.condition}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patientReport.summary.totalPatients > 0
                              ? ((item.count / patientReport.summary.totalPatients) * 100).toFixed(2)
                              : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No medical condition data available.</p>
              )}
            </div>
          </Card>

          {/* Top Allergies */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top Allergies</h2>
              {patientReport.topAllergies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Allergen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number of Patients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Patients
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientReport.topAllergies.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.allergen}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patientReport.summary.totalPatients > 0
                              ? ((item.count / patientReport.summary.totalPatients) * 100).toFixed(2)
                              : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No allergy data available.</p>
              )}
            </div>
          </Card>

          {/* Patients with Most Prescriptions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Patients with Most Prescriptions (Last 6 Months)
              </h2>
              {patientReport.patientsWithMostPrescriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prescription Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientReport.patientsWithMostPrescriptions.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.patientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.prescriptionCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No prescription frequency data available.</p>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500">No patient report data available. Please refresh the data.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientReport;
