import { useForm } from 'react-hook-form';
import { InventoryItemFormData } from '@/types/medication.types';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

interface InventoryItemFormProps {
  initialData?: Partial<InventoryItemFormData>;
  onSubmit: (data: InventoryItemFormData) => void;
  isLoading: boolean;
}

const InventoryItemForm = ({ initialData, onSubmit, isLoading }: InventoryItemFormProps) => {
  const today = formatDateToISO(new Date());
  const threeMonthsLater = formatDateToISO(
    new Date(new Date().setMonth(new Date().getMonth() + 3))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryItemFormData>({
    defaultValues: initialData || {
      purchaseDate: today,
      expiryDate: threeMonthsLater,
      quantity: 0,
      unitPrice: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Batch Number */}
        <div className="sm:col-span-2">
          <label htmlFor="batchNumber" className="form-label">
            Batch Number
          </label>
          <input
            type="text"
            id="batchNumber"
            className={`form-input ${errors.batchNumber ? 'border-red-300' : ''}`}
            {...register('batchNumber', { required: 'Batch number is required' })}
          />
          {errors.batchNumber && <p className="form-error">{errors.batchNumber.message}</p>}
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
            min="0"
            step="1"
            {...register('quantity', {
              required: 'Quantity is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Quantity must be at least 0',
              },
            })}
          />
          {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
        </div>

        {/* Unit Price */}
        <div>
          <label htmlFor="unitPrice" className="form-label">
            Unit Price
          </label>
          <input
            type="number"
            id="unitPrice"
            className={`form-input ${errors.unitPrice ? 'border-red-300' : ''}`}
            min="0"
            step="0.01"
            {...register('unitPrice', {
              required: 'Unit price is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Unit price must be at least 0',
              },
            })}
          />
          {errors.unitPrice && <p className="form-error">{errors.unitPrice.message}</p>}
        </div>

        {/* Purchase Date */}
        <div>
          <label htmlFor="purchaseDate" className="form-label">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            className={`form-input ${errors.purchaseDate ? 'border-red-300' : ''}`}
            max={today}
            {...register('purchaseDate', { required: 'Purchase date is required' })}
          />
          {errors.purchaseDate && <p className="form-error">{errors.purchaseDate.message}</p>}
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expiryDate" className="form-label">
            Expiry Date
          </label>
          <input
            type="date"
            id="expiryDate"
            className={`form-input ${errors.expiryDate ? 'border-red-300' : ''}`}
            min={today}
            {...register('expiryDate', { required: 'Expiry date is required' })}
          />
          {errors.expiryDate && <p className="form-error">{errors.expiryDate.message}</p>}
        </div>

        {/* Supplier */}
        <div className="sm:col-span-2">
          <label htmlFor="supplier" className="form-label">
            Supplier
          </label>
          <input
            type="text"
            id="supplier"
            className="form-input"
            {...register('supplier')}
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

export default InventoryItemForm;
