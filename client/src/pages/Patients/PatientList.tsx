import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatients, deletePatient } from '@/store/slices/patientSlice';
import { formatDate, calculateAge } from '@/utils/date.utils';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import PatientFilters, {
  PatientFilterValues,
} from '@/components/domain/Patients/PatientFilters';

const PatientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, isLoading, error, totalPatients, totalPages, currentPage } =
    useSelector((state: RootState) => state.patients);
  const [filters, setFilters] = useState<PatientFilterValues>({
    search: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<any>({
    page: 1,
    limit: 10,
  });

  const fetchPatientsWithFilters = useCallback(
    (page = 1) => {
      const apiFilters: any = {
        page,
        limit: 10,
        search: filters.search || '',
      };

      if (filters.gender) {
        apiFilters.gender = filters.gender;
      }

      if (filters.bloodGroup) {
        apiFilters.bloodGroup = filters.bloodGroup;
      }

      if (filters.genotype) {
        apiFilters.genotype = filters.genotype;
      }

      if (filters.maritalStatus) {
        apiFilters.maritalStatus = filters.maritalStatus;
      }

      if (
        filters.ageRange &&
        (filters.ageRange[0] !== '' || filters.ageRange[1] !== '')
      ) {
        if (filters.ageRange[0] !== '') {
          apiFilters.minAge = filters.ageRange[0];
        }
        if (filters.ageRange[1] !== '') {
          apiFilters.maxAge = filters.ageRange[1];
        }
      }

      if (filters.hasAllergies !== null) {
        apiFilters.hasAllergies = filters.hasAllergies;
      }

      if (filters.hasMedicalConditions !== null) {
        apiFilters.hasMedicalConditions = filters.hasMedicalConditions;
      }

      if (filters.hasMedicationHistory !== null) {
        apiFilters.hasMedicationHistory = filters.hasMedicationHistory;
      }

      if (filters.hasClinicalAssessments !== null) {
        apiFilters.hasClinicalAssessments = filters.hasClinicalAssessments;
      }

      if (filters.hasLaboratoryFindings !== null) {
        apiFilters.hasLaboratoryFindings = filters.hasLaboratoryFindings;
      }

      if (filters.hasDrugTherapyProblems !== null) {
        apiFilters.hasDrugTherapyProblems = filters.hasDrugTherapyProblems;
      }

      if (filters.hasCarePlans !== null) {
        apiFilters.hasCarePlans = filters.hasCarePlans;
      }

      if (filters.hasSoapNotes !== null) {
        apiFilters.hasSoapNotes = filters.hasSoapNotes;
      }

      setCurrentFilters(apiFilters);
      dispatch(fetchPatients(apiFilters));
    },
    [dispatch, filters]
  );

  useEffect(() => {
    fetchPatientsWithFilters(1);
  }, [fetchPatientsWithFilters]);

  const handleFilterChange = (newFilters: PatientFilterValues) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchPatientsWithFilters(page);
  };

  const handleDeleteClick = (patientId: string) => {
    setPatientToDelete(patientId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      await dispatch(deletePatient(patientToDelete));
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPatientToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/patients/new')}
          leftIcon={
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Add Patient
        </Button>
      </div>

      <PatientFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No patients found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Gender
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Age
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Records
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {patient.firstName.charAt(0)}
                            {patient.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/patients/${patient.id}`}
                              className="hover:text-primary-600"
                            >
                              {patient.firstName} {patient.lastName}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {patient.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(new Date(patient.dateOfBirth))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies && patient.allergies.length > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Allergies
                          </span>
                        )}
                        {patient.medicationHistory &&
                          patient.medicationHistory.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Medications
                            </span>
                          )}
                        {patient.clinicalAssessments &&
                          patient.clinicalAssessments.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Assessments
                            </span>
                          )}
                        {patient.drugTherapyProblems &&
                          patient.drugTherapyProblems.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              DTP
                            </span>
                          )}
                        {patient.carePlans && patient.carePlans.length > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Care Plans
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        <Link
                          to={`/patients/${patient.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(patient.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * 10, totalPatients)}
              </span>{' '}
              of <span className="font-medium">{totalPatients}</span> results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Patient
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this patient? This
                        action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={confirmDelete}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelDelete}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
