import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchMedications } from '@/store/slices/medicationSlice';
import Select from '@/components/common/Select/Select';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import Card from '@/components/common/Card/Card';
import { Medication } from '@/types/medication.types';
import { checkDrugInteractions } from '@/store/slices/rxnavSlice';

interface MedicationContraindicationsProps {
  patientId?: string;
}

const MedicationContraindications: React.FC<
  MedicationContraindicationsProps
> = ({ patientId }) => {
  const dispatch = useDispatch();
  const { medications, isLoading: medicationsLoading } = useSelector(
    (state: RootState) => state.medications
  );
  const { currentPatient } = useSelector((state: RootState) => state.patients);
  const {
    interactions,
    isLoading: interactionsLoading,
    error,
  } = useSelector((state: RootState) => state.rxnav);

  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [patientMedications, setPatientMedications] = useState<Medication[]>(
    []
  );

  useEffect(() => {
    // Fetch medications if not already loaded
    if (medications.length === 0) {
      dispatch(fetchMedications({}));
    }

    // If patient is provided, filter their medications
    if (currentPatient && currentPatient.medications) {
      const patientMeds = medications.filter((med) =>
        currentPatient.medications.includes(med.id)
      );
      setPatientMedications(patientMeds);
    }
  }, [dispatch, medications, currentPatient]);

  const handleCheckContraindications = () => {
    if (!selectedMedication) return;

    // Get the external IDs (RxCUIs) of the patient's medications and the selected medication
    const medicationRxcuis = [
      ...patientMedications
        .filter((med) => med.externalId)
        .map((med) => med.externalId as string),
      selectedMedication,
    ];

    // Remove duplicates
    const uniqueRxcuis = [...new Set(medicationRxcuis)];

    // Check for interactions
    if (uniqueRxcuis.length >= 2) {
      dispatch(checkDrugInteractions(uniqueRxcuis));
    }
  };

  // Map severity to color and icon
  const getSeverityDisplay = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'major':
      case 'contraindicated':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: (
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'moderate':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <svg
              className="h-5 w-5 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'minor':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: (
            <svg
              className="h-5 w-5 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: (
            <svg
              className="h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Check Medication Contraindications
        </h2>

        {patientId && patientMedications.length === 0 && !medicationsLoading ? (
          <Alert
            type="info"
            message="This patient doesn't have any medications yet."
          />
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="medication"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select a medication to check for contraindications
              </label>
              <div className="flex space-x-2">
                <Select
                  id="medication"
                  value={selectedMedication}
                  onChange={(e) => setSelectedMedication(e.target.value)}
                  className="flex-grow"
                >
                  <option value="">Select a medication</option>
                  {medications
                    .filter((med) => med.externalId) // Only show medications with RxCUI
                    .map((medication) => (
                      <option key={medication.id} value={medication.externalId}>
                        {medication.name} {medication.strength}{' '}
                        {medication.dosageForm}
                      </option>
                    ))}
                </Select>
                <Button
                  onClick={handleCheckContraindications}
                  disabled={!selectedMedication || interactionsLoading}
                >
                  {interactionsLoading ? <Spinner size="sm" /> : 'Check'}
                </Button>
              </div>
            </div>

            {error && <Alert type="error" message={error} />}

            {patientId && (
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Patient's Current Medications:
                </h3>
                {patientMedications.length > 0 ? (
                  <ul className="space-y-1">
                    {patientMedications.map((med) => (
                      <li key={med.id} className="text-sm text-gray-600">
                        • {med.name} {med.strength} {med.dosageForm}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No medications found for this patient.
                  </p>
                )}
              </div>
            )}

            {interactions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Contraindications & Interactions:
                </h3>
                <ul className="space-y-4">
                  {interactions.map((interaction, index) => {
                    const severityDisplay = getSeverityDisplay(
                      interaction.severity
                    );
                    return (
                      <li
                        key={index}
                        className={`p-3 rounded-md ${severityDisplay.bgColor}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {severityDisplay.icon}
                          </div>
                          <div className="ml-3">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {interaction.drug1.name} +{' '}
                                {interaction.drug2.name}
                              </p>
                              <span
                                className={`text-xs font-medium ${severityDisplay.color} uppercase`}
                              >
                                {interaction.severity}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {interaction.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default MedicationContraindications;
