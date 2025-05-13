import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { DispensingFormData } from '@/types/prescription.types';
import { fetchMedicationById } from '@/store/slices/medicationSlice';
import Button from '@/components/common/Button/Button';

interface DispensingFormProps {
  prescriptionId: string;
  prescriptionItems: {
    _id: string;
    medication: {
      id: string;
      name: string;
      strength: string;
    };
    quantity: number;
    refillsRemaining: number;
  }[];
  onSubmit: (data: DispensingFormData) => void;
  isLoading: boolean;
}

interface DispensingItem {
  itemId: string;
  medicationId: string;
  quantity: number;
  batchNumber: string;
}

const DispensingForm = ({
  prescriptionId,
  prescriptionItems,
  onSubmit,
  isLoading,
}: DispensingFormProps) => {
  const dispatch = useDispatch();
  const { currentMedication } = useSelector((state: RootState) => state.medications);
  const [selectedItems, setSelectedItems] = useState<DispensingItem[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string>('');
  const [currentMedicationId, setCurrentMedicationId] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ quantity: number; batchNumber: string; notes?: string }>();

  useEffect(() => {
    if (currentMedicationId) {
      dispatch(fetchMedicationById(currentMedicationId));
    }
  }, [dispatch, currentMedicationId]);

  const handleItemSelect = (itemId: string, medicationId: string) => {
    setCurrentItemId(itemId);
    setCurrentMedicationId(medicationId);
  };

  const handleAddItem = (data: { quantity: number; batchNumber: string }) => {
    if (!currentItemId) return;

    // Check if item already exists
    const existingItemIndex = selectedItems.findIndex((item) => item.itemId === currentItemId);

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: data.quantity,
        batchNumber: data.batchNumber,
      };
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          itemId: currentItemId,
          medicationId: currentMedicationId,
          quantity: data.quantity,
          batchNumber: data.batchNumber,
        },
      ]);
    }

    // Reset form
    reset();
    setCurrentItemId('');
    setCurrentMedicationId('');
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.itemId !== itemId));
  };

  const handleFormSubmit = (data: { notes?: string }) => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to dispense');
      return;
    }

    onSubmit({
      items: selectedItems.map(({ itemId, quantity, batchNumber }) => ({
        itemId,
        quantity,
        batchNumber,
      })),
      notes: data.notes,
    });
  };

  // Get available prescription items (those with refills remaining)
  const availableItems = prescriptionItems.filter((item) => item.refillsRemaining > 0);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Prescription Items */}
        <div className="sm:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Prescription Items</h3>
          {availableItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refills Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableItems.map((item) => (
                    <tr
                      key={item._id}
                      className={currentItemId === item._id ? 'bg-blue-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.medication.name} ({item.medication.strength})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.refillsRemaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          type="button"
                          onClick={() => handleItemSelect(item._id, item.medication.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No items available for dispensing.
            </div>
          )}
        </div>

        {/* Dispensing Form */}
        {currentItemId && (
          <div className="sm:col-span-2 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="text-md font-medium text-gray-900 mb-3">Dispense Medication</h4>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
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
                {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
              </div>

              {/* Batch Number */}
              <div>
                <label htmlFor="batchNumber" className="form-label">
                  Batch Number
                </label>
                <select
                  id="batchNumber"
                  className={`form-select ${errors.batchNumber ? 'border-red-300' : ''}`}
                  {...register('batchNumber', { required: 'Batch number is required' })}
                >
                  <option value="">Select a batch</option>
                  {currentMedication?.inventory.map((item) => (
                    <option key={item._id} value={item.batchNumber}>
                      {item.batchNumber} - Qty: {item.quantity} - Exp: {new Date(item.expiryDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {errors.batchNumber && <p className="form-error">{errors.batchNumber.message}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setCurrentItemId('');
                  setCurrentMedicationId('');
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleSubmit(handleAddItem)}
              >
                Add to Dispensing
              </Button>
            </div>
          </div>
        )}

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Items to Dispense</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedItems.map((item) => {
                    const prescriptionItem = prescriptionItems.find((i) => i._id === item.itemId);
                    return (
                      <tr key={item.itemId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prescriptionItem?.medication.name} ({prescriptionItem?.medication.strength})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.batchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.itemId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={isLoading}
          disabled={selectedItems.length === 0}
        >
          Dispense Medication
        </Button>
      </div>
    </form>
  );
};

export default DispensingForm;
