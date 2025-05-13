import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchPrescriptionById, dispenseMedication, setError } from '@/store/slices/prescriptionSlice';
import { DispensingFormData } from '@/types/prescription.types';
import Card from '@/components/common/Card/Card';
import DispensingForm from '@/components/domain/Prescriptions/DispensingForm';

const DispenseMedication = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPrescription, isLoading, error } = useSelector(
    (state: RootState) => state.prescriptions
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPrescriptionById(id));
    }

    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id]);

  const handleSubmit = async (data: DispensingFormData) => {
    if (id) {
      try {
        const resultAction = await dispatch(
          dispenseMedication({
            prescriptionId: id,
            dispensingData: data,
          })
        );
        if (dispenseMedication.fulfilled.match(resultAction)) {
          navigate(`/prescriptions/${id}`);
        }
      } catch (error) {
        console.error('Failed to dispense medication:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading prescription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (!currentPrescription) {
    return (
      <div className="p-4 text-sm text-gray-700 bg-gray-100 rounded-md">
        Prescription not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dispense Medication
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Prescription: {currentPrescription.prescriptionNumber}
          </p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {typeof currentPrescription.patient === 'object'
                  ? `${currentPrescription.patient.firstName} ${currentPrescription.patient.lastName}`
                  : currentPrescription.patient}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescription Date
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(currentPrescription.prescriptionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(currentPrescription.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <DispensingForm
            prescriptionId={id || ''}
            prescriptionItems={currentPrescription.items.map((item) => ({
              _id: item._id || '',
              medication: typeof item.medication === 'object'
                ? {
                    id: item.medication.id,
                    name: item.medication.name,
                    strength: item.medication.strength,
                  }
                : {
                    id: item.medication,
                    name: 'Unknown Medication',
                    strength: '',
                  },
              quantity: item.quantity,
              refillsRemaining: item.refillsRemaining,
            }))}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};

export default DispenseMedication;
