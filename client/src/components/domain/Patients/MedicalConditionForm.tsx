import { useForm } from 'react-hook-form';
import { MedicalCondition } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface MedicalConditionFormProps {
  initialData?: Partial<MedicalCondition>;
  onSubmit: (data: MedicalCondition) => void;
  isLoading: boolean;
}

const MedicalConditionForm = ({
  initialData,
  onSubmit,
  isLoading,
}: MedicalConditionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicalCondition>({
    defaultValues: initialData || {
      diagnosisDate: formatDateToISO(new Date()),
      status: 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Condition */}
        <div className="sm:col-span-2">
          <label htmlFor="condition" className="form-label">
            Condition
          </label>
          <input
            type="text"
            id="condition"
            className={`form-input ${errors.condition ? 'border-red-300' : ''}`}
            {...register('condition', { required: 'Condition is required' })}
          />
          {errors.condition && <p className="form-error">{errors.condition.message}</p>}
        </div>

        {/* Diagnosis Date */}
        <div>
          <label htmlFor="diagnosisDate" className="form-label">
            Diagnosis Date
          </label>
          <input
            type="date"
            id="diagnosisDate"
            className={`form-input ${errors.diagnosisDate ? 'border-red-300' : ''}`}
            {...register('diagnosisDate', { required: 'Diagnosis date is required' })}
          />
          {errors.diagnosisDate && (
            <p className="form-error">{errors.diagnosisDate.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            className={`form-input ${errors.status ? 'border-red-300' : ''}`}
            {...register('status', { required: 'Status is required' })}
          >
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="in_remission">In Remission</option>
          </select>
          {errors.status && <p className="form-error">{errors.status.message}</p>}
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

export default MedicalConditionForm;
