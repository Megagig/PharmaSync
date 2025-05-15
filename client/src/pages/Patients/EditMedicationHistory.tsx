import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPatientById, updateMedicationHistory, setError } from '@/store/slices/patientSlice';
import { MedicationHistory, MedicationHistoryFormData } from '@/types/patient.types';
import Card from '@/components/common/Card/Card';
import MedicationHistoryForm from '@/components/domain/Patients/MedicationHistoryForm';
import { formatDateToISO } from '@/utils/date.utils';

const EditMedicationHistory = () => {
  const { id, medicationId } = useParams<{ id: string; medicationId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPatient, isLoading, error } = useSelector((state: RootState) => state.patients);
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistory | null>(null);

  useEffect(() => {
    if (id && !currentPatient) {
      dispatch(fetchPatientById(id));
    } else if (currentPatient && medicationId) {
      const medication = currentPatient.medicationHistory.find(
        (med) => med._id === medicationId
      );
      if (medication) {
        setMedicationHistory(medication);
      } else {
        navigate(`/patients/${id}`);
      }
    }
    
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id, medicationId, currentPatient, navigate]);

  const handleSubmit = async (data: MedicationHistoryFormData) => {
    if (id && medicationId) {
      try {
        const resultAction = await dispatch(
          updateMedicationHistory({
            patientId: id,
            medicationId,
            medicationData: data,
          })
        );
        if (updateMedicationHistory.fulfilled.match(resultAction)) {
          navigate(`/patients/${id}`);
        }
      } catch (error) {
        console.error('Failed to update medication history:', error);
      }
    }
  };

  if (isLoading || !currentPatient || !medicationHistory) {
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

  const initialData: MedicationHistoryFormData = {
    medication: medicationHistory.medication,
    purpose: medicationHistory.purpose,
    dosage: medicationHistory.dosage,
    frequency: medicationHistory.frequency,
    duration: medicationHistory.duration,
    startDate: formatDateToISO(new Date(medicationHistory.startDate)),
    endDate: medicationHistory.endDate ? formatDateToISO(new Date(medicationHistory.endDate)) : undefined,
    isCurrent: medicationHistory.isCurrent,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Medication History</h1>
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
        <MedicationHistoryForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </Card>
    </div>
  );
};

export default EditMedicationHistory;
