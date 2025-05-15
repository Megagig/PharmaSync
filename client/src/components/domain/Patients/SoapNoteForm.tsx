import { useForm } from 'react-hook-form';
import { SoapNoteFormData } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface SoapNoteFormProps {
  initialData?: Partial<SoapNoteFormData>;
  onSubmit: (data: SoapNoteFormData) => void;
  isLoading: boolean;
}

const SoapNoteForm = ({
  initialData,
  onSubmit,
  isLoading,
}: SoapNoteFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SoapNoteFormData>({
    defaultValues: initialData || {
      date: formatDateToISO(new Date()),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="form-label">
            Visit Date
          </label>
          <input
            type="date"
            id="date"
            className={`form-input ${errors.date ? 'border-red-300' : ''}`}
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        {/* Subjective */}
        <div>
          <label htmlFor="subjective" className="form-label">
            Subjective (Patient's complaints, symptoms, and history)
          </label>
          <textarea
            id="subjective"
            rows={4}
            className={`form-input ${errors.subjective ? 'border-red-300' : ''}`}
            placeholder="Document what the patient tells you about their condition, symptoms, concerns, etc."
            {...register('subjective', { required: 'Subjective information is required' })}
          ></textarea>
          {errors.subjective && <p className="form-error">{errors.subjective.message}</p>}
        </div>

        {/* Objective */}
        <div>
          <label htmlFor="objective" className="form-label">
            Objective (Clinical findings and measurements)
          </label>
          <textarea
            id="objective"
            rows={4}
            className={`form-input ${errors.objective ? 'border-red-300' : ''}`}
            placeholder="Document your observations, vital signs, examination findings, test results, etc."
            {...register('objective', { required: 'Objective information is required' })}
          ></textarea>
          {errors.objective && <p className="form-error">{errors.objective.message}</p>}
        </div>

        {/* Assessment */}
        <div>
          <label htmlFor="assessment" className="form-label">
            Assessment (Diagnosis and evaluation)
          </label>
          <textarea
            id="assessment"
            rows={4}
            className={`form-input ${errors.assessment ? 'border-red-300' : ''}`}
            placeholder="Document your assessment of the patient's condition, diagnosis, or evaluation of their health status."
            {...register('assessment', { required: 'Assessment is required' })}
          ></textarea>
          {errors.assessment && <p className="form-error">{errors.assessment.message}</p>}
        </div>

        {/* Plan */}
        <div>
          <label htmlFor="plan" className="form-label">
            Plan (Treatment plan and next steps)
          </label>
          <textarea
            id="plan"
            rows={4}
            className={`form-input ${errors.plan ? 'border-red-300' : ''}`}
            placeholder="Document your treatment plan, medications, follow-up instructions, referrals, etc."
            {...register('plan', { required: 'Plan is required' })}
          ></textarea>
          {errors.plan && <p className="form-error">{errors.plan.message}</p>}
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

export default SoapNoteForm;
