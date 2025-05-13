import { useForm } from 'react-hook-form';
import { Allergy } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface AllergyFormProps {
  initialData?: Partial<Allergy>;
  onSubmit: (data: Allergy) => void;
  isLoading: boolean;
}

const AllergyForm = ({ initialData, onSubmit, isLoading }: AllergyFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Allergy>({
    defaultValues: initialData || {
      dateIdentified: formatDateToISO(new Date()),
      severity: 'moderate',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Allergen */}
        <div className="sm:col-span-2">
          <label htmlFor="allergen" className="form-label">
            Allergen
          </label>
          <input
            type="text"
            id="allergen"
            className={`form-input ${errors.allergen ? 'border-red-300' : ''}`}
            {...register('allergen', { required: 'Allergen is required' })}
          />
          {errors.allergen && <p className="form-error">{errors.allergen.message}</p>}
        </div>

        {/* Reaction */}
        <div className="sm:col-span-2">
          <label htmlFor="reaction" className="form-label">
            Reaction
          </label>
          <input
            type="text"
            id="reaction"
            className={`form-input ${errors.reaction ? 'border-red-300' : ''}`}
            {...register('reaction', { required: 'Reaction is required' })}
          />
          {errors.reaction && <p className="form-error">{errors.reaction.message}</p>}
        </div>

        {/* Severity */}
        <div>
          <label htmlFor="severity" className="form-label">
            Severity
          </label>
          <select
            id="severity"
            className={`form-input ${errors.severity ? 'border-red-300' : ''}`}
            {...register('severity', { required: 'Severity is required' })}
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
          {errors.severity && <p className="form-error">{errors.severity.message}</p>}
        </div>

        {/* Date Identified */}
        <div>
          <label htmlFor="dateIdentified" className="form-label">
            Date Identified
          </label>
          <input
            type="date"
            id="dateIdentified"
            className={`form-input ${errors.dateIdentified ? 'border-red-300' : ''}`}
            {...register('dateIdentified', { required: 'Date is required' })}
          />
          {errors.dateIdentified && (
            <p className="form-error">{errors.dateIdentified.message}</p>
          )}
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

export default AllergyForm;
