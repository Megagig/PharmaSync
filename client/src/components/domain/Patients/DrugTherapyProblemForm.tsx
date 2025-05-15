import { useForm } from 'react-hook-form';
import { DrugTherapyProblemFormData, DrugTherapyProblemType } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface DrugTherapyProblemFormProps {
  initialData?: Partial<DrugTherapyProblemFormData>;
  onSubmit: (data: DrugTherapyProblemFormData) => void;
  isLoading: boolean;
}

const DrugTherapyProblemForm = ({
  initialData,
  onSubmit,
  isLoading,
}: DrugTherapyProblemFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DrugTherapyProblemFormData>({
    defaultValues: initialData || {
      date: formatDateToISO(new Date()),
      isResolved: false,
    },
  });

  const isResolved = watch('isResolved');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Date */}
        <div>
          <label htmlFor="date" className="form-label">
            Date Identified
          </label>
          <input
            type="date"
            id="date"
            className={`form-input ${errors.date ? 'border-red-300' : ''}`}
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        {/* Problem Type */}
        <div>
          <label htmlFor="type" className="form-label">
            Problem Type
          </label>
          <select
            id="type"
            className={`form-input ${errors.type ? 'border-red-300' : ''}`}
            {...register('type', { required: 'Problem type is required' })}
          >
            <option value="">Select Problem Type</option>
            <option value={DrugTherapyProblemType.UNNECESSARY_DRUG_THERAPY}>
              Unnecessary Drug Therapy
            </option>
            <option value={DrugTherapyProblemType.WRONG_DRUG}>
              Wrong Drug
            </option>
            <option value={DrugTherapyProblemType.DOSAGE_TOO_LOW}>
              Dosage Too Low
            </option>
            <option value={DrugTherapyProblemType.DOSAGE_TOO_HIGH}>
              Dosage Too High
            </option>
            <option value={DrugTherapyProblemType.ADVERSE_DRUG_REACTION}>
              Adverse Drug Reaction
            </option>
            <option value={DrugTherapyProblemType.INAPPROPRIATE_ADHERENCE}>
              Inappropriate Adherence
            </option>
            <option value={DrugTherapyProblemType.NEEDS_ADDITIONAL_DRUG_THERAPY}>
              Needs Additional Drug Therapy
            </option>
          </select>
          {errors.type && <p className="form-error">{errors.type.message}</p>}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="form-label">
            Problem Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={`form-input ${errors.description ? 'border-red-300' : ''}`}
            {...register('description', { required: 'Description is required' })}
          ></textarea>
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        {/* Is Resolved */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isResolved"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('isResolved')}
          />
          <label htmlFor="isResolved" className="ml-2 block text-sm text-gray-700">
            Problem Resolved
          </label>
        </div>

        {/* Resolution */}
        {isResolved && (
          <div className="sm:col-span-2">
            <label htmlFor="resolution" className="form-label">
              Resolution Details
            </label>
            <textarea
              id="resolution"
              rows={3}
              className={`form-input ${errors.resolution ? 'border-red-300' : ''}`}
              {...register('resolution', {
                required: isResolved ? 'Resolution details are required when marked as resolved' : false,
              })}
            ></textarea>
            {errors.resolution && <p className="form-error">{errors.resolution.message}</p>}
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

export default DrugTherapyProblemForm;
