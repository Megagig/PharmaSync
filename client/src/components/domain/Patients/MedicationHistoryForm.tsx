import { useForm } from 'react-hook-form';
import { MedicationHistoryFormData } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface MedicationHistoryFormProps {
  initialData?: Partial<MedicationHistoryFormData>;
  onSubmit: (data: MedicationHistoryFormData) => void;
  isLoading: boolean;
}

const MedicationHistoryForm = ({
  initialData,
  onSubmit,
  isLoading,
}: MedicationHistoryFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MedicationHistoryFormData>({
    defaultValues: initialData || {
      startDate: formatDateToISO(new Date()),
      isCurrent: true,
    },
  });

  const isCurrent = watch('isCurrent');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Medication Name */}
        <div>
          <label htmlFor="medication" className="form-label">
            Medication Name
          </label>
          <input
            type="text"
            id="medication"
            className={`form-input ${errors.medication ? 'border-red-300' : ''}`}
            {...register('medication', { required: 'Medication name is required' })}
          />
          {errors.medication && <p className="form-error">{errors.medication.message}</p>}
        </div>

        {/* Purpose/Indication */}
        <div>
          <label htmlFor="purpose" className="form-label">
            Purpose/Indication
          </label>
          <input
            type="text"
            id="purpose"
            className={`form-input ${errors.purpose ? 'border-red-300' : ''}`}
            {...register('purpose', { required: 'Purpose is required' })}
          />
          {errors.purpose && <p className="form-error">{errors.purpose.message}</p>}
        </div>

        {/* Dosage */}
        <div>
          <label htmlFor="dosage" className="form-label">
            Dosage
          </label>
          <input
            type="text"
            id="dosage"
            placeholder="e.g., 500mg"
            className={`form-input ${errors.dosage ? 'border-red-300' : ''}`}
            {...register('dosage', { required: 'Dosage is required' })}
          />
          {errors.dosage && <p className="form-error">{errors.dosage.message}</p>}
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="form-label">
            Frequency
          </label>
          <input
            type="text"
            id="frequency"
            placeholder="e.g., Twice daily"
            className={`form-input ${errors.frequency ? 'border-red-300' : ''}`}
            {...register('frequency', { required: 'Frequency is required' })}
          />
          {errors.frequency && <p className="form-error">{errors.frequency.message}</p>}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="form-label">
            Duration
          </label>
          <input
            type="text"
            id="duration"
            placeholder="e.g., 7 days, 2 weeks, ongoing"
            className={`form-input ${errors.duration ? 'border-red-300' : ''}`}
            {...register('duration', { required: 'Duration is required' })}
          />
          {errors.duration && <p className="form-error">{errors.duration.message}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            className={`form-input ${errors.startDate ? 'border-red-300' : ''}`}
            {...register('startDate', { required: 'Start date is required' })}
          />
          {errors.startDate && <p className="form-error">{errors.startDate.message}</p>}
        </div>

        {/* Is Current */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isCurrent"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('isCurrent')}
          />
          <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-700">
            Currently Taking
          </label>
        </div>

        {/* End Date (only if not current) */}
        {!isCurrent && (
          <div>
            <label htmlFor="endDate" className="form-label">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className={`form-input ${errors.endDate ? 'border-red-300' : ''}`}
              {...register('endDate', {
                required: !isCurrent ? 'End date is required when not currently taking' : false,
              })}
            />
            {errors.endDate && <p className="form-error">{errors.endDate.message}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default MedicationHistoryForm;
