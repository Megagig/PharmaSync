import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchDispensingById,
  returnDispensing,
  setError,
} from '@/store/slices/dispensingSlice';
import { DispensingStatus } from '@/types/dispensing.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const DispensingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentDispensing, isLoading, error } = useSelector(
    (state: RootState) => state.dispensings
  );
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnItems, setReturnItems] = useState<{ itemId: string; quantity: number }[]>([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchDispensingById(id));
    }

    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id]);

  const handleReturnItem = (itemId: string, maxQuantity: number) => {
    const existingItem = returnItems.find(item => item.itemId === itemId);
    
    if (existingItem) {
      // Remove item if it's already selected
      setReturnItems(returnItems.filter(item => item.itemId !== itemId));
    } else {
      // Add item with max quantity
      setReturnItems([...returnItems, { itemId, quantity: maxQuantity }]);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setReturnItems(
      returnItems.map(item => 
        item.itemId === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleReturn = async () => {
    if (!id || !returnReason || returnItems.length === 0) {
      return;
    }

    try {
      await dispatch(
        returnDispensing({
          id,
          returnData: {
            reason: returnReason,
            items: returnItems,
          },
        })
      );
      setShowReturnModal(false);
    } catch (error) {
      console.error('Failed to return dispensing:', error);
    }
  };

  const getStatusBadgeClass = (status: DispensingStatus) => {
    switch (status) {
      case DispensingStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case DispensingStatus.RETURNED:
        return 'bg-yellow-100 text-yellow-800';
      case DispensingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dispensing record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (!currentDispensing) {
    return (
      <div className="p-4 text-sm text-gray-700 bg-gray-100 rounded-md">
        Dispensing record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dispensing: {currentDispensing.dispensingNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Created on {new Date(currentDispensing.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          {currentDispensing.status === DispensingStatus.COMPLETED && (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/dispensing/${id}/receipt`)}
              >
                View Receipt
              </Button>
              <Button variant="danger" onClick={() => setShowReturnModal(true)}>
                Return Items
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {typeof currentDispensing.patient === 'object'
                  ? `${currentDispensing.patient.firstName} ${currentDispensing.patient.lastName}`
                  : currentDispensing.patient}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispensed By
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {typeof currentDispensing.dispensedBy === 'object'
                  ? `${currentDispensing.dispensedBy.firstName} ${currentDispensing.dispensedBy.lastName}`
                  : currentDispensing.dispensedBy}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </h3>
              <p className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    currentDispensing.status
                  )}`}
                >
                  {currentDispensing.status.charAt(0).toUpperCase() +
                    currentDispensing.status.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispensing Date
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(currentDispensing.dispensingDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {currentDispensing.paymentMethod.charAt(0).toUpperCase() +
                  currentDispensing.paymentMethod.slice(1)}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescription
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {currentDispensing.prescription ? (
                  typeof currentDispensing.prescription === 'object' ? (
                    <Link
                      to={`/prescriptions/${currentDispensing.prescription._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {currentDispensing.prescription.prescriptionNumber}
                    </Link>
                  ) : (
                    <Link
                      to={`/prescriptions/${currentDispensing.prescription}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Prescription
                    </Link>
                  )
                ) : (
                  'No prescription'
                )}
              </p>
            </div>
          </div>

          {currentDispensing.notes && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </h3>
              <p className="mt-1 text-sm text-gray-900">{currentDispensing.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
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
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDispensing.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof item.medication === 'object'
                      ? `${item.medication.name} (${item.medication.strength})`
                      : item.medication}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Subtotal
                </td>
                <td className="px-6 py-3 text-left text-sm text-gray-900">
                  ${currentDispensing.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Discount
                </td>
                <td className="px-6 py-3 text-left text-sm text-gray-900">
                  ${currentDispensing.discount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Tax
                </td>
                <td className="px-6 py-3 text-left text-sm text-gray-900">
                  ${currentDispensing.tax.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  ${currentDispensing.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Return Items
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Select the items you want to return and provide a reason.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Return Reason
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Items to Return
                  </label>
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {currentDispensing.items.map((item) => {
                      const isSelected = returnItems.some(
                        (returnItem) => returnItem.itemId === item._id
                      );
                      const selectedItem = returnItems.find(
                        (returnItem) => returnItem.itemId === item._id
                      );

                      return (
                        <div
                          key={item._id}
                          className={`p-3 border rounded-md mb-2 ${
                            isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleReturnItem(item._id!, item.quantity)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label className="ml-3 block text-sm font-medium text-gray-700">
                                {typeof item.medication === 'object'
                                  ? `${item.medication.name} (${item.medication.strength})`
                                  : item.medication}
                              </label>
                            </div>
                            <span className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Return Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={selectedItem?.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item._id!,
                                    Math.min(parseInt(e.target.value), item.quantity)
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReturn}
                  disabled={!returnReason || returnItems.length === 0}
                >
                  Process Return
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispensingDetail;
