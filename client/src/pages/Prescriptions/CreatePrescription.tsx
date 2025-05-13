import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { createPrescription, setError } from '@/store/slices/prescriptionSlice';
import { PrescriptionFormData, PrescriptionItemFormData } from '@/types/prescription.types';
import Card from '@/components/common/Card/Card';
import PrescriptionForm from '@/components/domain/Prescriptions/PrescriptionForm';

const CreatePrescription = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.prescriptions);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch]);

  const handleSubmit = async (data: PrescriptionFormData & { items: PrescriptionItemFormData[] }) => {
    try {
      const resultAction = await dispatch(createPrescription(data));
      if (createPrescription.fulfilled.match(resultAction)) {
        navigate(`/prescriptions/${resultAction.payload.id}`);
      }
    } catch (error) {
      console.error('Failed to create prescription:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create Prescription</h1>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <PrescriptionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </Card>
    </div>
  );
};

export default CreatePrescription;
