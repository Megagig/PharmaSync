import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { createDispensing, setError } from '@/store/slices/dispensingSlice';
import { fetchPatients } from '@/store/slices/patientSlice';
import { fetchMedications } from '@/store/slices/medicationSlice';
import { DispensingFormData } from '@/types/dispensing.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

const CreateDispensing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.dispensings);
  const { patients } = useSelector((state: RootState) => state.patients);
  const { medications } = useSelector((state: RootState) => state.medications);

  const [formData, setFormData] = useState<DispensingFormData>({
    patient: '',
    dispensingDate: formatDateToISO(new Date()),
    items: [],
    paymentMethod: 'cash',
    discount: 0,
    tax: 0,
    notes: '',
  });

  const [currentItem, setCurrentItem] = useState({
    medication: '',
    quantity: 1,
    batchNumber: '',
    unitPrice: 0,
    notes: '',
  });

  const [selectedMedication, setSelectedMedication] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 100 }));
    dispatch(fetchMedications({ page: 1, limit: 100 }));
    dispatch(setError(null));
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'discount' || name === 'tax' ? parseFloat(value) || 0 : value,
    });
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'medication') {
      const medication = medications.find(med => med.id === value);
      setSelectedMedication(medication);
      setCurrentItem({
        ...currentItem,
        medication: value,
        unitPrice: medication?.price || 0,
      });
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value,
      });
    }
  };

  const handleAddItem = () => {
    if (!currentItem.medication || !currentItem.batchNumber || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert('Please fill in all item fields with valid values');
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, currentItem],
    });

    setCurrentItem({
      medication: '',
      quantity: 1,
      batchNumber: '',
      unitPrice: 0,
      notes: '',
    });

    setSelectedMedication(null);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient) {
      alert('Please select a patient');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const resultAction = await dispatch(createDispensing(formData));
      if (createDispensing.fulfilled.match(resultAction)) {
        navigate(`/dispensing/${resultAction.payload.id}`);
      }
    } catch (error) {
      console.error('Failed to create dispensing record:', error);
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (formData.discount || 0) + (formData.tax || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create Dispensing Record</h1>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Patient */}
              <div className="sm:col-span-2">
                <label htmlFor="patient" className="form-label">
                  Patient
                </label>
                <select
                  id="patient"
                  name="patient"
                  className="form-select"
                  value={formData.patient}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispensing Date */}
              <div>
                <label htmlFor="dispensingDate" className="form-label">
                  Dispensing Date
                </label>
                <input
                  type="date"
                  id="dispensingDate"
                  name="dispensingDate"
                  className="form-input"
                  value={formData.dispensingDate}
                  onChange={handleInputChange}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="form-label">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                  <option value="credit">Credit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="form-input"
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            {/* Add Items */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Items</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 border border-gray-200 rounded-md p-4 bg-gray-50">
                {/* Medication */}
                <div>
                  <label htmlFor="medication" className="form-label">
                    Medication
                  </label>
                  <select
                    id="medication"
                    name="medication"
                    className="form-select"
                    value={currentItem.medication}
                    onChange={handleItemInputChange}
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
                <div>
                  <label htmlFor="batchNumber" className="form-label">
                    Batch Number
                  </label>
                  <select
                    id="batchNumber"
                    name="batchNumber"
                    className="form-select"
                    value={currentItem.batchNumber}
                    onChange={handleItemInputChange}
                    disabled={!selectedMedication}
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
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="form-input"
                    min="1"
                    step="1"
                    value={currentItem.quantity}
                    onChange={handleItemInputChange}
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label htmlFor="unitPrice" className="form-label">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    id="unitPrice"
                    name="unitPrice"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={currentItem.unitPrice}
                    onChange={handleItemInputChange}
                  />
                </div>

                {/* Item Notes */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <label htmlFor="itemNotes" className="form-label">
                    Item Notes
                  </label>
                  <input
                    type="text"
                    id="itemNotes"
                    name="notes"
                    className="form-input"
                    value={currentItem.notes}
                    onChange={handleItemInputChange}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                  <Button
                    variant="primary"
                    type="button"
                    onClick={handleAddItem}
                    disabled={!currentItem.medication || !currentItem.batchNumber || currentItem.quantity <= 0 || currentItem.unitPrice <= 0}
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => {
                        const medication = medications.find(med => med.id === item.medication);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {medication ? `${medication.name} (${medication.strength})` : item.medication}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.batchNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
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

            {/* Totals */}
            {formData.items.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="discount" className="form-label">
                    Discount
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="tax" className="form-label">
                    Tax
                  </label>
                  <input
                    type="number"
                    id="tax"
                    name="tax"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-700">Discount:</span>
                      <span className="text-gray-900">${(formData.discount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-700">Tax:</span>
                      <span className="text-gray-900">${(formData.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 font-bold">
                      <span className="text-gray-700">Total:</span>
                      <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" type="button" onClick={() => navigate('/dispensing')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                disabled={formData.items.length === 0}
              >
                Save Dispensing
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateDispensing;
