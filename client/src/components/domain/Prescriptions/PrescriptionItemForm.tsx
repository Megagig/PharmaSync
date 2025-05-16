import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { PrescriptionItemFormData } from '@/types/prescription.types';
import { RootState } from '@/store/store';
import { fetchMedications } from '@/store/slices/medicationSlice';
import { fetchPatientById } from '@/store/slices/patientSlice';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface PrescriptionItemFormProps {
  initialData?: Partial<PrescriptionItemFormData>;
  onSubmit: (data: PrescriptionItemFormData) => void;
  onCancel: () => void;
  patientId?: string;
}

const PrescriptionItemForm = ({
  initialData,
  onSubmit,
  onCancel,
  patientId,
}: PrescriptionItemFormProps) => {
  const dispatch = useDispatch();
  const { medications } = useSelector((state: RootState) => state.medications);
  const { currentPatient } = useSelector((state: RootState) => state.patients);
  const [patientMedications, setPatientMedications] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionItemFormData>({
    defaultValues: initialData || {
      quantity: 1,
      refills: 0,
      startDate: formatDateToISO(new Date()),
      dosage: {
        amount: 1,
        unit: 'tablet',
        frequency: 'once daily',
        route: 'oral',
      },
    },
  });

  // Fetch all medications that require prescription
  useEffect(() => {
    dispatch(
      fetchMedications({
        page: 1,
        limit: 100,
        requiresPrescription: true,
      })
    );
  }, [dispatch]);

  // Fetch patient data if patientId is provided
  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId));
    }
  }, [dispatch, patientId]);

  // Extract patient medications when patient data is loaded
  useEffect(() => {
    if (currentPatient && currentPatient.medications) {
      setPatientMedications(
        currentPatient.medications.map((med) =>
          typeof med === 'string' ? med : med.id || med._id
        )
      );
    }
  }, [currentPatient]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        {/* Medication */}
        <div className="sm:col-span-2">
          <label htmlFor="medication" className="form-label">
            Medication
          </label>
          <select
            id="medication"
            className={`form-select ${
              errors.medication ? 'border-red-300' : ''
            }`}
            {...register('medication', { required: 'Medication is required' })}
          >
            <option value="">Select a medication</option>

            {/* Show patient medications first if available */}
            {patientMedications.length > 0 && (
              <>
                <optgroup label="Patient's Medications">
                  {medications
                    .filter((med) =>
                      patientMedications.includes(med.id || med._id)
                    )
                    .map((medication) => (
                      <option
                        key={medication.id || medication._id}
                        value={medication.id || medication._id}
                      >
                        {medication.name} ({medication.strength})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Other Medications">
                  {medications
                    .filter(
                      (med) => !patientMedications.includes(med.id || med._id)
                    )
                    .map((medication) => (
                      <option
                        key={medication.id || medication._id}
                        value={medication.id || medication._id}
                      >
                        {medication.name} ({medication.strength})
                      </option>
                    ))}
                </optgroup>
              </>
            )}

            {/* Show all medications if patient has no medications */}
            {patientMedications.length === 0 &&
              medications.map((medication) => (
                <option
                  key={medication.id || medication._id}
                  value={medication.id || medication._id}
                >
                  {medication.name} ({medication.strength})
                </option>
              ))}
          </select>
          {errors.medication && (
            <p className="form-error">{errors.medication.message}</p>
          )}
        </div>

        {/* Dosage Amount */}
        <div>
          <label htmlFor="dosage.amount" className="form-label">
            Amount
          </label>
          <input
            type="number"
            id="dosage.amount"
            className={`form-input ${
              errors.dosage?.amount ? 'border-red-300' : ''
            }`}
            step="0.01"
            min="0"
            {...register('dosage.amount', {
              required: 'Amount is required',
              valueAsNumber: true,
            })}
          />
          {errors.dosage?.amount && (
            <p className="form-error">{errors.dosage.amount.message}</p>
          )}
        </div>

        {/* Dosage Unit */}
        <div>
          <label htmlFor="dosage.unit" className="form-label">
            Unit
          </label>
          <input
            type="text"
            id="dosage.unit"
            className={`form-input ${
              errors.dosage?.unit ? 'border-red-300' : ''
            }`}
            {...register('dosage.unit', { required: 'Unit is required' })}
          />
          {errors.dosage?.unit && (
            <p className="form-error">{errors.dosage.unit.message}</p>
          )}
        </div>

        {/* Dosage Frequency */}
        <div>
          <label htmlFor="dosage.frequency" className="form-label">
            Frequency
          </label>
          <input
            type="text"
            id="dosage.frequency"
            className={`form-input ${
              errors.dosage?.frequency ? 'border-red-300' : ''
            }`}
            {...register('dosage.frequency', {
              required: 'Frequency is required',
            })}
          />
          {errors.dosage?.frequency && (
            <p className="form-error">{errors.dosage.frequency.message}</p>
          )}
        </div>

        {/* Dosage Route */}
        <div>
          <label htmlFor="dosage.route" className="form-label">
            Route
          </label>
          <input
            type="text"
            id="dosage.route"
            className={`form-input ${
              errors.dosage?.route ? 'border-red-300' : ''
            }`}
            {...register('dosage.route', { required: 'Route is required' })}
          />
          {errors.dosage?.route && (
            <p className="form-error">{errors.dosage.route.message}</p>
          )}
        </div>

        {/* Dosage Instructions */}
        <div className="sm:col-span-2">
          <label htmlFor="dosage.instructions" className="form-label">
            Instructions
          </label>
          <textarea
            id="dosage.instructions"
            rows={2}
            className="form-input"
            {...register('dosage.instructions')}
          ></textarea>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="form-label">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            className={`form-input ${errors.quantity ? 'border-red-300' : ''}`}
            min="1"
            step="1"
            {...register('quantity', {
              required: 'Quantity is required',
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Quantity must be at least 1',
              },
            })}
          />
          {errors.quantity && (
            <p className="form-error">{errors.quantity.message}</p>
          )}
        </div>

        {/* Refills */}
        <div>
          <label htmlFor="refills" className="form-label">
            Refills
          </label>
          <input
            type="number"
            id="refills"
            className={`form-input ${errors.refills ? 'border-red-300' : ''}`}
            min="0"
            step="1"
            {...register('refills', {
              required: 'Refills is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Refills must be at least 0',
              },
            })}
          />
          {errors.refills && (
            <p className="form-error">{errors.refills.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            className="form-input"
            {...register('startDate')}
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="form-label">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            className="form-input"
            {...register('endDate')}
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            className="form-input"
            {...register('notes')}
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Add Medication
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionItemForm;
