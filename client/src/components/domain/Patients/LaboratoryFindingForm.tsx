import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { LaboratoryFindingFormData } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface LaboratoryFindingFormProps {
  initialData?: Partial<LaboratoryFindingFormData>;
  onSubmit: (data: LaboratoryFindingFormData) => void;
  isLoading: boolean;
}

const LaboratoryFindingForm = ({
  initialData,
  onSubmit,
  isLoading,
}: LaboratoryFindingFormProps) => {
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>(
    initialData?.other ? Object.entries(initialData.other).map(([key, value]) => ({ key, value })) : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<LaboratoryFindingFormData>({
    defaultValues: initialData || {
      date: formatDateToISO(new Date()),
    },
  });

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index][field] = value;
    setCustomFields(updatedFields);
  };

  const processFormData = (data: LaboratoryFindingFormData) => {
    // Add custom fields to the other object
    const other: Record<string, string> = {};
    customFields.forEach(field => {
      if (field.key && field.value) {
        other[field.key] = field.value;
      }
    });

    // Submit the form data with the custom fields
    onSubmit({
      ...data,
      other: Object.keys(other).length > 0 ? other : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(processFormData)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Date */}
        <div>
          <label htmlFor="date" className="form-label">
            Test Date
          </label>
          <input
            type="date"
            id="date"
            className={`form-input ${errors.date ? 'border-red-300' : ''}`}
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        {/* PCV */}
        <div>
          <label htmlFor="pcv" className="form-label">
            PCV (Packed Cell Volume)
          </label>
          <input
            type="text"
            id="pcv"
            className="form-input"
            {...register('pcv')}
          />
        </div>

        {/* MC/MS */}
        <div>
          <label htmlFor="mcms" className="form-label">
            MC/MS
          </label>
          <input
            type="text"
            id="mcms"
            className="form-input"
            {...register('mcms')}
          />
        </div>

        {/* EUCr */}
        <div>
          <label htmlFor="euCr" className="form-label">
            EUCr
          </label>
          <input
            type="text"
            id="euCr"
            className="form-input"
            {...register('euCr')}
          />
        </div>

        {/* FBC */}
        <div>
          <label htmlFor="fbc" className="form-label">
            FBC (Full Blood Count)
          </label>
          <input
            type="text"
            id="fbc"
            className="form-input"
            {...register('fbc')}
          />
        </div>

        {/* FBS */}
        <div>
          <label htmlFor="fbs" className="form-label">
            FBS (Fasting Blood Sugar)
          </label>
          <input
            type="text"
            id="fbs"
            className="form-input"
            {...register('fbs')}
          />
        </div>

        {/* HbA1c */}
        <div>
          <label htmlFor="hbA1c" className="form-label">
            HbA1c (%)
          </label>
          <input
            type="text"
            id="hbA1c"
            className="form-input"
            {...register('hbA1c')}
          />
        </div>

        {/* Custom Fields */}
        <div className="sm:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label">Additional Test Results</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomField}
            >
              Add Test
            </Button>
          </div>

          {customFields.map((field, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Test Name"
                className="form-input w-1/3"
                value={field.key}
                onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Result"
                className="form-input w-1/2"
                value={field.value}
                onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleRemoveCustomField(index)}
              >
                Remove
              </Button>
            </div>
          ))}
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

export default LaboratoryFindingForm;
