import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchPrescriptionById,
  updatePrescription,
  cancelPrescription,
  setError,
} from '@/store/slices/prescriptionSlice';
import { PrescriptionStatus } from '@/types/prescription.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Tabs from '@/components/common/Tabs/Tabs';

const PrescriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPrescription, isLoading, error } = useSelector(
    (state: RootState) => state.prescriptions
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPrescriptionById(id));
    }

    // Clear any previous errors when component mounts
    dispatch(setError(null));
  }, [dispatch, id]);

  const handleActivate = async () => {
    if (id) {
      try {
        await dispatch(
          updatePrescription({
            id,
            updateData: { status: PrescriptionStatus.ACTIVE },
          })
        );
      } catch (error) {
        console.error('Failed to activate prescription:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (id) {
      try {
        await dispatch(cancelPrescription(id));
        setShowCancelModal(false);
      } catch (error) {
        console.error('Failed to cancel prescription:', error);
      }
    }
  };

  const getStatusBadgeClass = (status: PrescriptionStatus) => {
    switch (status) {
      case PrescriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case PrescriptionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PrescriptionStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case PrescriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading prescription...</p>
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

  if (!currentPrescription) {
    return (
      <div className="p-4 text-sm text-gray-700 bg-gray-100 rounded-md">
        Prescription not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Prescription: {currentPrescription.prescriptionNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Created on {new Date(currentPrescription.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          {currentPrescription.status === PrescriptionStatus.PENDING && (
            <Button variant="primary" onClick={handleActivate}>
              Activate
            </Button>
          )}
          {currentPrescription.status === PrescriptionStatus.ACTIVE && (
            <Button
              variant="primary"
              onClick={() => navigate(`/prescriptions/${id}/dispense`)}
            >
              Dispense
            </Button>
          )}
          {(currentPrescription.status === PrescriptionStatus.PENDING ||
            currentPrescription.status === PrescriptionStatus.ACTIVE) && (
            <Button variant="danger" onClick={() => setShowCancelModal(true)}>
              Cancel
            </Button>
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
                {typeof currentPrescription.patient === 'object'
                  ? `${currentPrescription.patient.firstName} ${currentPrescription.patient.lastName}`
                  : currentPrescription.patient}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescriber
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {typeof currentPrescription.prescriber === 'object'
                  ? `${currentPrescription.prescriber.firstName} ${currentPrescription.prescriber.lastName}`
                  : currentPrescription.prescriber}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </h3>
              <p className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    currentPrescription.status
                  )}`}
                >
                  {currentPrescription.status.charAt(0).toUpperCase() +
                    currentPrescription.status.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescription Date
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(currentPrescription.prescriptionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(currentPrescription.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {currentPrescription.notes && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </h3>
              <p className="mt-1 text-sm text-gray-900">{currentPrescription.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Medications' },
          { id: 'dispensing', label: 'Dispensing History' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPrescription.items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof item.medication === 'object'
                        ? `${item.medication.name} (${item.medication.strength})`
                        : item.medication}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dosage.amount} {item.dosage.unit}, {item.dosage.frequency} (
                      {item.dosage.route})
                      {item.dosage.instructions && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.dosage.instructions}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.refillsRemaining} / {item.refills}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'dispensing' && (
        <Card>
          {currentPrescription.dispensingHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispensed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPrescription.dispensingHistory.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.batchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof record.dispensedBy === 'object'
                          ? `${record.dispensedBy.firstName} ${record.dispensedBy.lastName}`
                          : record.dispensedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No dispensing records found.
            </div>
          )}
        </Card>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
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
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
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
                      Cancel Prescription
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to cancel this prescription? This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancel}
                >
                  Cancel Prescription
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionDetail;
