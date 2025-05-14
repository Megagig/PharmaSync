import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { adjustInventory, clearAdjustmentResult } from '@/store/slices/inventorySlice';
import { fetchMedications } from '@/store/slices/medicationSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const InventoryAdjustment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adjustmentResult, isLoading, error } = useSelector(
    (state: RootState) => state.inventory
  );
  const { medications } = useSelector((state: RootState) => state.medications);

  const [medicationId, setMedicationId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchMedications({ page: 1, limit: 100 }));
    
    // Clear any previous adjustment result
    return () => {
      dispatch(clearAdjustmentResult());
    };
  }, [dispatch]);

  const handleMedicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setMedicationId(id);
    setBatchNumber('');
    
    if (id) {
      const medication = medications.find(med => med.id === id);
      setSelectedMedication(medication);
    } else {
      setSelectedMedication(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicationId || !batchNumber || !reason) {
      alert('Please fill in all required fields');
      return;
    }
    
    dispatch(
      adjustInventory({
        medicationId,
        batchNumber,
        quantity,
        reason,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Adjustment</h1>
        <Button variant="outline" onClick={() => navigate('/inventory')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {adjustmentResult ? (
            <div className="space-y-6">
              <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md">
                Inventory adjustment successful!
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Adjustment Details
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Medication</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {adjustmentResult.medication}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {adjustmentResult.batchNumber}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Previous Quantity</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {adjustmentResult.previousQuantity}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Adjustment</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {adjustmentResult.adjustmentQuantity > 0 ? '+' : ''}
                        {adjustmentResult.adjustmentQuantity}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">New Quantity</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {adjustmentResult.newQuantity}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Reason</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {adjustmentResult.reason}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    dispatch(clearAdjustmentResult());
                    setMedicationId('');
                    setBatchNumber('');
                    setQuantity(0);
                    setReason('');
                    setSelectedMedication(null);
                  }}
                >
                  Make Another Adjustment
                </Button>
                <Button variant="primary" onClick={() => navigate('/inventory')}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* Medication */}
                <div className="sm:col-span-2">
                  <label htmlFor="medication" className="form-label">
                    Medication
                  </label>
                  <select
                    id="medication"
                    className="form-select"
                    value={medicationId}
                    onChange={handleMedicationChange}
                    required
                  >
                    <option value="">Select a medication</option>
                    {medications.map((medication) => (
                      <option key={medication.id} value={medication.id}>
                        {medication.name} ({medication.strength})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Number */}
                <div className="sm:col-span-2">
                  <label htmlFor="batchNumber" className="form-label">
                    Batch Number
                  </label>
                  <select
                    id="batchNumber"
                    className="form-select"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    disabled={!selectedMedication}
                    required
                  >
                    <option value="">Select a batch</option>
                    {selectedMedication?.inventory.map((item: any) => (
                      <option key={item._id} value={item.batchNumber}>
                        {item.batchNumber} - Qty: {item.quantity} - Exp: {new Date(item.expiryDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="form-label">
                    Adjustment Quantity
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      +/-
                    </span>
                    <input
                      type="number"
                      id="quantity"
                      className="form-input rounded-none rounded-r-md"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Use positive values to add stock, negative values to remove stock.
                  </p>
                </div>

                {/* Reason */}
                <div className="sm:col-span-2">
                  <label htmlFor="reason" className="form-label">
                    Reason for Adjustment
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="form-input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" type="button" onClick={() => navigate('/inventory')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isLoading}>
                  Adjust Inventory
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InventoryAdjustment;
