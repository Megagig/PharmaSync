import { useForm } from 'react-hook-form';
import { 
  MedicationFormData, 
  MedicationType, 
  MedicationCategory,
  Dosage
} from '@/types/medication.types';
import Button from '@/components/common/Button/Button';

interface MedicationFormProps {
  initialData?: Partial<MedicationFormData>;
  onSubmit: (data: MedicationFormData) => void;
  isLoading: boolean;
}

const MedicationForm = ({ initialData, onSubmit, isLoading }: MedicationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicationFormData>({
    defaultValues: initialData || {
      type: MedicationType.TABLET,
      category: MedicationCategory.OTHER,
      requiresPrescription: true,
      standardDosage: {
        amount: 1,
        unit: 'tablet',
        frequency: 'once daily',
        route: 'oral',
      },
      minimumStockLevel: 10,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Basic Information */}
        <div className="sm:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
        </div>

        {/* Name */}
        <div className="sm:col-span-2">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            className={`form-input ${errors.name ? 'border-red-300' : ''}`}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        {/* Generic Name */}
        <div>
          <label htmlFor="genericName" className="form-label">
            Generic Name
          </label>
          <input
            type="text"
            id="genericName"
            className={`form-input ${errors.genericName ? 'border-red-300' : ''}`}
            {...register('genericName', { required: 'Generic name is required' })}
          />
          {errors.genericName && <p className="form-error">{errors.genericName.message}</p>}
        </div>

        {/* Brand Name */}
        <div>
          <label htmlFor="brandName" className="form-label">
            Brand Name
          </label>
          <input
            type="text"
            id="brandName"
            className="form-input"
            {...register('brandName')}
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="form-label">
            Type
          </label>
          <select
            id="type"
            className={`form-input ${errors.type ? 'border-red-300' : ''}`}
            {...register('type', { required: 'Type is required' })}
          >
            {Object.values(MedicationType).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.type && <p className="form-error">{errors.type.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className={`form-input ${errors.category ? 'border-red-300' : ''}`}
            {...register('category', { required: 'Category is required' })}
          >
            {Object.values(MedicationCategory).map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>

        {/* Dosage Form */}
        <div>
          <label htmlFor="dosageForm" className="form-label">
            Dosage Form
          </label>
          <input
            type="text"
            id="dosageForm"
            className={`form-input ${errors.dosageForm ? 'border-red-300' : ''}`}
            {...register('dosageForm', { required: 'Dosage form is required' })}
          />
          {errors.dosageForm && <p className="form-error">{errors.dosageForm.message}</p>}
        </div>

        {/* Strength */}
        <div>
          <label htmlFor="strength" className="form-label">
            Strength
          </label>
          <input
            type="text"
            id="strength"
            className={`form-input ${errors.strength ? 'border-red-300' : ''}`}
            {...register('strength', { required: 'Strength is required' })}
          />
          {errors.strength && <p className="form-error">{errors.strength.message}</p>}
        </div>

        {/* Manufacturer */}
        <div>
          <label htmlFor="manufacturer" className="form-label">
            Manufacturer
          </label>
          <input
            type="text"
            id="manufacturer"
            className="form-input"
            {...register('manufacturer')}
          />
        </div>

        {/* NAFDAC Number */}
        <div>
          <label htmlFor="nafdacNumber" className="form-label">
            NAFDAC Number
          </label>
          <input
            type="text"
            id="nafdacNumber"
            className="form-input"
            {...register('nafdacNumber')}
          />
        </div>

        {/* Requires Prescription */}
        <div className="sm:col-span-2">
          <div className="flex items-center">
            <input
              id="requiresPrescription"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register('requiresPrescription')}
            />
            <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-900">
              Requires Prescription
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="form-input"
            {...register('description')}
          ></textarea>
        </div>

        {/* Standard Dosage */}
        <div className="sm:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Standard Dosage</h3>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="standardDosage.amount" className="form-label">
            Amount
          </label>
          <input
            type="number"
            id="standardDosage.amount"
            className={`form-input ${errors.standardDosage?.amount ? 'border-red-300' : ''}`}
            step="0.01"
            min="0"
            {...register('standardDosage.amount', {
              required: 'Amount is required',
              valueAsNumber: true,
            })}
          />
          {errors.standardDosage?.amount && (
            <p className="form-error">{errors.standardDosage.amount.message}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label htmlFor="standardDosage.unit" className="form-label">
            Unit
          </label>
          <input
            type="text"
            id="standardDosage.unit"
            className={`form-input ${errors.standardDosage?.unit ? 'border-red-300' : ''}`}
            {...register('standardDosage.unit', { required: 'Unit is required' })}
          />
          {errors.standardDosage?.unit && (
            <p className="form-error">{errors.standardDosage.unit.message}</p>
          )}
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="standardDosage.frequency" className="form-label">
            Frequency
          </label>
          <input
            type="text"
            id="standardDosage.frequency"
            className={`form-input ${errors.standardDosage?.frequency ? 'border-red-300' : ''}`}
            {...register('standardDosage.frequency', { required: 'Frequency is required' })}
          />
          {errors.standardDosage?.frequency && (
            <p className="form-error">{errors.standardDosage.frequency.message}</p>
          )}
        </div>

        {/* Route */}
        <div>
          <label htmlFor="standardDosage.route" className="form-label">
            Route
          </label>
          <input
            type="text"
            id="standardDosage.route"
            className={`form-input ${errors.standardDosage?.route ? 'border-red-300' : ''}`}
            {...register('standardDosage.route', { required: 'Route is required' })}
          />
          {errors.standardDosage?.route && (
            <p className="form-error">{errors.standardDosage.route.message}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="sm:col-span-2">
          <label htmlFor="standardDosage.instructions" className="form-label">
            Instructions
          </label>
          <textarea
            id="standardDosage.instructions"
            rows={2}
            className="form-input"
            {...register('standardDosage.instructions')}
          ></textarea>
        </div>

        {/* Inventory Settings */}
        <div className="sm:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Inventory Settings</h3>
        </div>

        {/* Minimum Stock Level */}
        <div>
          <label htmlFor="minimumStockLevel" className="form-label">
            Minimum Stock Level
          </label>
          <input
            type="number"
            id="minimumStockLevel"
            className={`form-input ${errors.minimumStockLevel ? 'border-red-300' : ''}`}
            min="0"
            step="1"
            {...register('minimumStockLevel', {
              required: 'Minimum stock level is required',
              valueAsNumber: true,
            })}
          />
          {errors.minimumStockLevel && (
            <p className="form-error">{errors.minimumStockLevel.message}</p>
          )}
        </div>

        {/* Storage Conditions */}
        <div>
          <label htmlFor="storageConditions" className="form-label">
            Storage Conditions
          </label>
          <input
            type="text"
            id="storageConditions"
            className="form-input"
            {...register('storageConditions')}
          />
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

export default MedicationForm;
