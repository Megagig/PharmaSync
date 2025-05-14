import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchInventoryMovement } from '@/store/slices/inventorySlice';
import { fetchMedications } from '@/store/slices/medicationSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

const InventoryMovement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventoryMovements, isLoading, error } = useSelector(
    (state: RootState) => state.inventory
  );
  const { medications } = useSelector((state: RootState) => state.medications);

  const [medicationId, setMedicationId] = useState('');
  const [startDate, setStartDate] = useState(
    formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  );
  const [endDate, setEndDate] = useState(formatDateToISO(new Date()));

  useEffect(() => {
    dispatch(fetchMedications({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(
      fetchInventoryMovement({
        medicationId,
        startDate,
        endDate,
      })
    );
  };

  useEffect(() => {
    // Initial fetch with default values
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Movement</h1>
        <Button variant="outline" onClick={() => navigate('/inventory')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                Medication
              </label>
              <select
                id="medication"
                className="form-select"
                value={medicationId}
                onChange={(e) => setMedicationId(e.target.value)}
              >
                <option value="">All Medications</option>
                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name} ({medication.strength})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMedicationId('');
                setStartDate(
                  formatDateToISO(new Date(new Date().setMonth(new Date().getMonth() - 1)))
                );
                setEndDate(formatDateToISO(new Date()));
                dispatch(
                  fetchInventoryMovement({
                    medicationId: '',
                    startDate: formatDateToISO(
                      new Date(new Date().setMonth(new Date().getMonth() - 1))
                    ),
                    endDate: formatDateToISO(new Date()),
                  })
                );
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading inventory movement data...</p>
        </div>
      ) : inventoryMovements.length > 0 ? (
        inventoryMovements.map((medication) => (
          <Card key={medication.id}>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{medication.name}</h2>
              {medication.movements && medication.movements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medication.movements.map((movement, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(movement.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                movement.type === 'purchase'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {movement.type === 'purchase' ? 'Purchase' : 'Dispensing'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={
                                movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                              }
                            >
                              {movement.quantity > 0 ? '+' : ''}
                              {movement.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.batchNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No movement data found for this medication.</p>
              )}
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500">No inventory movement data found.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryMovement;
