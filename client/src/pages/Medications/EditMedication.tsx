import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchMedicationById, updateMedication, setError } from '@/store/slices/medicationSlice';
import { MedicationFormData } from '@/types/medication.types';
import Card from '@/components/common/Card/Card';
import MedicationForm from '@/components/domain/Medications/MedicationForm';

const EditMedication = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentMedication, isLoading, error } = useSelector(
    (state: RootState) => state.medications
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchMedicationById(id));
    }
    
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id]);

  const handleSubmit = async (data: MedicationFormData) => {
    if (id) {
      try {
        const resultAction = await dispatch(updateMedication({ id, medicationData: data }));
        if (updateMedication.fulfilled.match(resultAction)) {
          navigate(`/medications/${id}`);
        }
      } catch (error) {
        console.error('Failed to update medication:', error);
      }
    }
  };

  if (isLoading && !currentMedication) {
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

  if (!currentMedication) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Medication not found.</p>
      </div>
    );
  }

  const initialData: MedicationFormData = {
    name: currentMedication.name,
    genericName: currentMedication.genericName,
    brandName: currentMedication.brandName,
    description: currentMedication.description,
    type: currentMedication.type,
    category: currentMedication.category,
    dosageForm: currentMedication.dosageForm,
    strength: currentMedication.strength,
    manufacturer: currentMedication.manufacturer,
    nafdacNumber: currentMedication.nafdacNumber,
    requiresPrescription: currentMedication.requiresPrescription,
    standardDosage: currentMedication.standardDosage,
    storageConditions: currentMedication.storageConditions,
    minimumStockLevel: currentMedication.minimumStockLevel,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Medication</h1>
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
        <MedicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default EditMedication;
