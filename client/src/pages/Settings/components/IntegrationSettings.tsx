import React, { useState, useEffect } from 'react';
// Removed unused import: import { useDispatch } from 'react-redux';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import api from '@/api/api';
import { toast } from 'react-toastify';

interface IntegrationStatus {
  ehr: {
    enabled: boolean;
  };
  pharmacySystem: {
    enabled: boolean;
  };
  drugDatabase: {
    enabled: boolean;
  };
}

const IntegrationSettings: React.FC = () => {
  // Removed unused dispatch: const dispatch = useDispatch();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/integrations/status');
      setStatus(response.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch integration status'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncInventory = async () => {
    setIsSyncing(true);
    try {
      await api.post('/integrations/pharmacy-system/inventory/sync');
      toast.success('Inventory synced successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sync inventory');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Integration Settings
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Electronic Health Record (EHR) Integration
              </h2>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Connect with external Electronic Health Record systems to
                    import patient data, medical history, and more.
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status?.ehr.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status?.ehr.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Search Patients in EHR
                  </span>
                  <Button
                    variant="outline"
                    disabled={!status?.ehr.enabled}
                    onClick={() => {
                      // In a real app, this would open a modal or navigate to a search page
                      if (status?.ehr.enabled) {
                        toast.info('EHR patient search would open here');
                      } else {
                        toast.warning('EHR integration is not enabled');
                      }
                    }}
                  >
                    Search Patients
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Import Patient from EHR
                  </span>
                  <Button
                    variant="outline"
                    disabled={!status?.ehr.enabled}
                    onClick={() => {
                      // In a real app, this would open a modal or navigate to an import page
                      if (status?.ehr.enabled) {
                        toast.info('EHR patient import would open here');
                      } else {
                        toast.warning('EHR integration is not enabled');
                      }
                    }}
                  >
                    Import Patient
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Pharmacy Management System Integration
              </h2>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Connect with your pharmacy management system to sync
                    inventory, send prescriptions, and track dispensing.
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status?.pharmacySystem.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status?.pharmacySystem.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Sync Inventory
                  </span>
                  <Button
                    variant="outline"
                    disabled={!status?.pharmacySystem.enabled || isSyncing}
                    onClick={handleSyncInventory}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Send Prescription to Pharmacy
                  </span>
                  <Button
                    variant="outline"
                    disabled={!status?.pharmacySystem.enabled}
                    onClick={() => {
                      // In a real app, this would open a modal or navigate to a prescription page
                      if (status?.pharmacySystem.enabled) {
                        toast.info('Prescription sending would open here');
                      } else {
                        toast.warning(
                          'Pharmacy system integration is not enabled'
                        );
                      }
                    }}
                  >
                    Send Prescription
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Drug Information Database Integration
              </h2>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Connect with drug information databases to access medication
                    details, check interactions, and more.
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status?.drugDatabase.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status?.drugDatabase.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Search Medications
                  </span>
                  <Button
                    variant="outline"
                    disabled={!status?.drugDatabase.enabled}
                    onClick={() => {
                      // In a real app, this would open a modal or navigate to a search page
                      if (status?.drugDatabase.enabled) {
                        toast.info('Medication search would open here');
                      } else {
                        toast.warning(
                          'Drug database integration is not enabled'
                        );
                      }
                    }}
                  >
                    Search Medications
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Check Drug Interactions
                  </span>
                  <Button
                    variant="outline"
                    disabled={!status?.drugDatabase.enabled}
                    onClick={() => {
                      // In a real app, this would open a modal or navigate to an interaction checker
                      if (status?.drugDatabase.enabled) {
                        toast.info('Drug interaction checker would open here');
                      } else {
                        toast.warning(
                          'Drug database integration is not enabled'
                        );
                      }
                    }}
                  >
                    Check Interactions
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="primary" onClick={fetchIntegrationStatus}>
              Refresh Status
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default IntegrationSettings;
