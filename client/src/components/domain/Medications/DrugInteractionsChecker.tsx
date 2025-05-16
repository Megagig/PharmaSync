import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  checkDrugInteractions,
  clearInteractions,
} from '@/store/slices/rxnavSlice';
import { fetchMedications } from '@/store/slices/medicationSlice';
import Select from '@/components/common/Select/Select';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import Card from '@/components/common/Card/Card';
import { Medication } from '@/types/medication.types';

const DrugInteractionsChecker: React.FC = () => {
  const dispatch = useDispatch();
  const { medications } = useSelector((state: RootState) => state.medications);
  const { interactions, isLoading, error } = useSelector(
    (state: RootState) => state.rxnav
  );

  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>('');

  useEffect(() => {
    // Fetch medications if not already loaded
    if (medications.length === 0) {
      dispatch(fetchMedications({}));
    }

    // Clear interactions when component unmounts
    return () => {
      dispatch(clearInteractions());
    };
  }, [dispatch, medications.length]);

  const handleAddMedication = () => {
    if (currentSelection && !selectedMedications.includes(currentSelection)) {
      setSelectedMedications([...selectedMedications, currentSelection]);
      setCurrentSelection('');
    }
  };

  const handleRemoveMedication = (rxcui: string) => {
    setSelectedMedications(selectedMedications.filter((id) => id !== rxcui));
  };

  const handleCheckInteractions = () => {
    if (selectedMedications.length >= 2) {
      dispatch(checkDrugInteractions(selectedMedications));
    }
  };

  // Get medication name by rxcui
  const getMedicationName = (rxcui: string): string => {
    const medication = medications.find((med) => med.externalId === rxcui);
    return medication ? medication.name : rxcui;
  };

  // Map severity to color
  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'major':
      case 'contraindicated':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'minor':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Check Drug Interactions</h3>

          <div className="flex space-x-2 mb-4">
            <Select
              value={currentSelection}
              onChange={(e) => setCurrentSelection(e.target.value)}
              className="flex-grow"
            >
              <option value="">Select a medication</option>
              {medications.map((medication: Medication) => (
                <option
                  key={medication.id}
                  value={medication.externalId || medication.id}
                  disabled={selectedMedications.includes(
                    medication.externalId || medication.id
                  )}
                >
                  {medication.name} {medication.strength}{' '}
                  {medication.dosageForm}
                </option>
              ))}
            </Select>
            <Button
              onClick={handleAddMedication}
              disabled={
                !currentSelection ||
                selectedMedications.includes(currentSelection)
              }
            >
              Add
            </Button>
          </div>

          {selectedMedications.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">
                Selected Medications:
              </h4>
              <ul className="space-y-2">
                {selectedMedications.map((rxcui) => (
                  <li
                    key={rxcui}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                  >
                    <span>{getMedicationName(rxcui)}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveMedication(rxcui)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleCheckInteractions}
            disabled={selectedMedications.length < 2 || isLoading}
            className="w-full"
          >
            {isLoading ? <Spinner size="sm" /> : 'Check Interactions'}
          </Button>
        </div>
      </Card>

      {error && <Alert type="error" message={error} />}

      {interactions.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Interaction Results</h3>

            {interactions.length === 0 ? (
              <p className="text-green-600">
                No interactions found between the selected medications.
              </p>
            ) : (
              <ul className="space-y-4">
                {interactions.map((interaction, index) => (
                  <li
                    key={index}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">
                          {interaction.drug1.name}
                        </span>
                        {' + '}
                        <span className="font-medium">
                          {interaction.drug2.name}
                        </span>
                      </div>
                      <span
                        className={`font-medium ${getSeverityColor(
                          interaction.severity
                        )}`}
                      >
                        {interaction.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {interaction.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DrugInteractionsChecker;
