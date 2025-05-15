import { useForm } from 'react-hook-form';
import { ClinicalAssessmentFormData } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface ClinicalAssessmentFormProps {
  initialData?: Partial<ClinicalAssessmentFormData>;
  onSubmit: (data: ClinicalAssessmentFormData) => void;
  isLoading: boolean;
}

const ClinicalAssessmentForm = ({
  initialData,
  onSubmit,
  isLoading,
}: ClinicalAssessmentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalAssessmentFormData>({
    defaultValues: initialData || {
      date: formatDateToISO(new Date()),
      palor: false,
      dehydration: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Date */}
        <div>
          <label htmlFor="date" className="form-label">
            Assessment Date
          </label>
          <input
            type="date"
            id="date"
            className={`form-input ${errors.date ? 'border-red-300' : ''}`}
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        {/* Blood Pressure */}
        <div>
          <label htmlFor="bloodPressure" className="form-label">
            Blood Pressure (mmHg)
          </label>
          <input
            type="text"
            id="bloodPressure"
            placeholder="e.g., 120/80"
            className={`form-input ${errors.bloodPressure ? 'border-red-300' : ''}`}
            {...register('bloodPressure', { required: 'Blood pressure is required' })}
          />
          {errors.bloodPressure && <p className="form-error">{errors.bloodPressure.message}</p>}
        </div>

        {/* Respiratory Rate */}
        <div>
          <label htmlFor="respiratoryRate" className="form-label">
            Respiratory Rate (breaths/min)
          </label>
          <input
            type="text"
            id="respiratoryRate"
            placeholder="e.g., 16"
            className={`form-input ${errors.respiratoryRate ? 'border-red-300' : ''}`}
            {...register('respiratoryRate', { required: 'Respiratory rate is required' })}
          />
          {errors.respiratoryRate && <p className="form-error">{errors.respiratoryRate.message}</p>}
        </div>

        {/* Temperature */}
        <div>
          <label htmlFor="temperature" className="form-label">
            Temperature (°C)
          </label>
          <input
            type="text"
            id="temperature"
            placeholder="e.g., 37.0"
            className={`form-input ${errors.temperature ? 'border-red-300' : ''}`}
            {...register('temperature', { required: 'Temperature is required' })}
          />
          {errors.temperature && <p className="form-error">{errors.temperature.message}</p>}
        </div>

        {/* Heart Sounds */}
        <div>
          <label htmlFor="heartSounds" className="form-label">
            Heart Sounds
          </label>
          <input
            type="text"
            id="heartSounds"
            placeholder="e.g., Normal S1, S2"
            className={`form-input ${errors.heartSounds ? 'border-red-300' : ''}`}
            {...register('heartSounds', { required: 'Heart sounds description is required' })}
          />
          {errors.heartSounds && <p className="form-error">{errors.heartSounds.message}</p>}
        </div>

        {/* Palor */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="palor"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('palor')}
          />
          <label htmlFor="palor" className="ml-2 block text-sm text-gray-700">
            Palor Present
          </label>
        </div>

        {/* Dehydration */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="dehydration"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('dehydration')}
          />
          <label htmlFor="dehydration" className="ml-2 block text-sm text-gray-700">
            Dehydration Present
          </label>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="form-label">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="form-input"
            {...register('notes')}
          ></textarea>
        </div>
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

export default ClinicalAssessmentForm;
