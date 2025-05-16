import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  PrescriptionFormData,
  PrescriptionItemFormData,
} from '@/types/prescription.types';
import { RootState } from '@/store/store';
import { fetchPatients } from '@/store/slices/patientSlice';
import Button from '@/components/common/Button/Button';
import PrescriptionItemForm from './PrescriptionItemForm';
import { formatDateToISO } from '@/utils/date.utils';

interface PrescriptionFormProps {
  initialData?: Partial<PrescriptionFormData>;
  onSubmit: (
    data: PrescriptionFormData & { items: PrescriptionItemFormData[] }
  ) => void;
  isLoading: boolean;
}

const PrescriptionForm = ({
  initialData,
  onSubmit,
  isLoading,
}: PrescriptionFormProps) => {
  const dispatch = useDispatch();
  const { patients } = useSelector((state: RootState) => state.patients);
  const [items, setItems] = useState<PrescriptionItemFormData[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    defaultValues: initialData || {
      prescriptionDate: formatDateToISO(new Date()),
      expiryDate: formatDateToISO(
        new Date(new Date().setMonth(new Date().getMonth() + 3))
      ),
    },
  });

  // Watch for patient selection changes
  const patientId = watch('patient');

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Update selectedPatientId when patient selection changes
  useEffect(() => {
    setSelectedPatientId(patientId || '');
  }, [patientId]);

  const handleAddItem = (item: PrescriptionItemFormData) => {
    setItems([...items, item]);
    setShowItemForm(false);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleFormSubmit = (data: PrescriptionFormData) => {
    if (items.length === 0) {
      alert('Please add at least one medication to the prescription');
      return;
    }
    onSubmit({ ...data, items });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Patient */}
        <div className="sm:col-span-2">
          <label htmlFor="patient" className="form-label">
            Patient
          </label>
          <select
            id="patient"
            className={`form-select ${errors.patient ? 'border-red-300' : ''}`}
            {...register('patient', { required: 'Patient is required' })}
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
          {errors.patient && (
            <p className="form-error">{errors.patient.message}</p>
          )}
        </div>

        {/* Prescription Date */}
        <div>
          <label htmlFor="prescriptionDate" className="form-label">
            Prescription Date
          </label>
          <input
            type="date"
            id="prescriptionDate"
            className="form-input"
            {...register('prescriptionDate')}
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expiryDate" className="form-label">
            Expiry Date
          </label>
          <input
            type="date"
            id="expiryDate"
            className={`form-input ${
              errors.expiryDate ? 'border-red-300' : ''
            }`}
            {...register('expiryDate', { required: 'Expiry date is required' })}
          />
          {errors.expiryDate && (
            <p className="form-error">{errors.expiryDate.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="form-input"
            {...register('notes')}
          ></textarea>
        </div>
      </div>

      {/* Prescription Items */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Prescription Items
          </h3>
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowItemForm(true)}
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
            Add Medication
          </Button>
        </div>

        {showItemForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Add Medication
            </h4>
            <PrescriptionItemForm
              onSubmit={handleAddItem}
              onCancel={() => setShowItemForm(false)}
              patientId={selectedPatientId}
            />
          </div>
        )}

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.medication}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dosage.amount} {item.dosage.unit},{' '}
                      {item.dosage.frequency} ({item.dosage.route})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.refills}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No medications added to this prescription yet.
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          type="button"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          Save Prescription
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionForm;
