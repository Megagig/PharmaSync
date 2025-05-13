import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientById, addAllergy, setError } from '@/store/slices/patientSlice';
import { Allergy } from '@/types/patient.types';
import Card from '@/components/common/Card/Card';
import AllergyForm from '@/components/domain/Patients/AllergyForm';

const AddAllergy = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPatient, isLoading, error } = useSelector((state: RootState) => state.patients);

  useEffect(() => {
    if (id && !currentPatient) {
      dispatch(fetchPatientById(id));
    }
    
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id, currentPatient]);

  const handleSubmit = async (data: Allergy) => {
    if (id) {
      try {
        const resultAction = await dispatch(addAllergy({ patientId: id, allergyData: data }));
        if (addAllergy.fulfilled.match(resultAction)) {
          navigate(`/patients/${id}`);
        }
      } catch (error) {
        console.error('Failed to add allergy:', error);
      }
    }
  };

  if (isLoading && !currentPatient) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Add Allergy</h1>
      </div>

      {error && (
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
      )}

      <Card>
        <AllergyForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default AddAllergy;
