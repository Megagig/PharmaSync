import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/store';
import {
  fetchPatientById,
  addMedicationHistory,
} from '@/store/slices/patientSlice';
import { fetchMedications } from '@/store/slices/medicationSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Select from '@/components/common/Select/Select';
import { Medication } from '@/types/medication.types';

const AddPatientMedication = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    // We'll use currentPatient later when implementing more features
    isLoading: patientLoading,
    error: patientError,
  } = useSelector((state: RootState) => state.patients);

  const {
    medications,
    isLoading: medicationsLoading,
    error: medicationsError,
  } = useSelector((state: RootState) => state.medications);

  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchPatientById(id));
    }
    dispatch(fetchMedications({ page: 1, limit: 100 }));
  }, [dispatch, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedMedicationId) {
      setFormError('Please select a medication');
      return;
    }

    if (id) {
      try {
        const resultAction = await dispatch(
          addMedicationHistory({
            patientId: id,
            medicationData: {
              medication: selectedMedicationId,
              startDate: new Date().toISOString(),
              purpose: 'Treatment',
              dosage: 'As prescribed',
              frequency: 'As directed',
              duration: 'As needed',
              isCurrent: true,
            },
          })
        );

        if (addMedicationHistory.fulfilled.match(resultAction)) {
          navigate(`/patients/${id}`);
        }
      } catch (error) {
        console.error('Failed to add medication:', error);
        setFormError('Failed to add medication. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigate(`/patients/${id}`);
  };

  const isLoading = patientLoading || medicationsLoading;
  const error = patientError || medicationsError || formError;

  if (isLoading) {
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
        <h1 className="text-2xl font-semibold text-gray-900">
          Add Medication to Patient
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="medication"
                className="block text-sm font-medium text-gray-700"
              >
                Medication
              </label>
              <Select
                id="medication"
                value={selectedMedicationId}
                onChange={(e) => setSelectedMedicationId(e.target.value)}
                required
              >
                <option value="">Select a medication</option>
                {medications.map((medication: Medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name} {medication.strength}{' '}
                    {medication.dosageForm}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isLoading}>
                Add Medication
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddPatientMedication;
