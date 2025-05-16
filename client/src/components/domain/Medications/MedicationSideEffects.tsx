import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getMedicationDetails } from '@/store/slices/rxnavSlice';
import Card from '@/components/common/Card/Card';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import Select from '@/components/common/Select/Select';
import Button from '@/components/common/Button/Button';
import { Medication } from '@/types/medication.types';

interface MedicationSideEffectsProps {
  initialRxcui?: string;
}

const MedicationSideEffects: React.FC<MedicationSideEffectsProps> = ({
  initialRxcui,
}) => {
  const dispatch = useDispatch();
  const { medications } = useSelector((state: RootState) => state.medications);
  const { currentMedication, isLoading, error } = useSelector(
    (state: RootState) => state.rxnav
  );

  const [selectedRxcui, setSelectedRxcui] = useState<string>(
    initialRxcui || ''
  );
  const [sideEffects, setSideEffects] = useState<any[]>([]);

  useEffect(() => {
    if (initialRxcui) {
      setSelectedRxcui(initialRxcui);
    }
  }, [initialRxcui]);

  useEffect(() => {
    if (selectedRxcui) {
      dispatch(getMedicationDetails(selectedRxcui));
    }
  }, [dispatch, selectedRxcui]);

  useEffect(() => {
    if (currentMedication) {
      // Extract side effects from medication properties
      extractSideEffects();
    }
  }, [currentMedication]);

  const extractSideEffects = () => {
    if (!currentMedication || !currentMedication.properties) {
      setSideEffects([]);
      return;
    }

    // Look for side effects in the properties
    const sideEffectProps = currentMedication.properties.filter(
      (prop: any) =>
        prop.name.toLowerCase().includes('adverse') ||
        prop.name.toLowerCase().includes('side effect') ||
        prop.name.toLowerCase().includes('reaction')
    );

    // If we found specific side effect properties, use those
    if (sideEffectProps.length > 0) {
      const formattedSideEffects = sideEffectProps.map((prop: any) => ({
        effect: prop.name,
        description: prop.value,
        severity: determineSeverity(prop.name),
      }));
      setSideEffects(formattedSideEffects);
    } else {
      // Otherwise, try to extract from general information
      const generalInfoProps = currentMedication.properties.filter(
        (prop: any) =>
          prop.name === 'ADVERSE REACTIONS' ||
          prop.name === 'WARNINGS' ||
          prop.name === 'PRECAUTIONS'
      );

      if (generalInfoProps.length > 0) {
        const formattedSideEffects = generalInfoProps.map((prop: any) => ({
          effect: prop.name,
          description: prop.value,
          severity: determineSeverity(prop.name),
        }));
        setSideEffects(formattedSideEffects);
      } else {
        // If no specific side effect information is found
        setSideEffects([]);
      }
    }
  };

  const determineSeverity = (name: string): 'mild' | 'moderate' | 'severe' => {
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes('severe') ||
      lowerName.includes('serious') ||
      lowerName.includes('warning') ||
      lowerName.includes('contraindication')
    ) {
      return 'severe';
    } else if (
      lowerName.includes('moderate') ||
      lowerName.includes('common') ||
      lowerName.includes('precaution')
    ) {
      return 'moderate';
    } else {
      return 'mild';
    }
  };

  const handleMedicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRxcui(e.target.value);
  };

  const getSeverityBadge = (severity: 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Severe
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Moderate
          </span>
        );
      case 'mild':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Mild
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Medication Side Effects
        </h2>

        <div className="mb-4">
          <label
            htmlFor="medication"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select a medication
          </label>
          <Select
            id="medication"
            value={selectedRxcui}
            onChange={handleMedicationChange}
            className="w-full"
          >
            <option value="">Select a medication</option>
            {medications
              .filter((med) => med.externalId) // Only show medications with RxCUI
              .map((medication: Medication) => (
                <option key={medication.id} value={medication.externalId}>
                  {medication.name} {medication.strength}{' '}
                  {medication.dosageForm}
                </option>
              ))}
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert type="error" message={error} />
        ) : (
          <>
            {currentMedication && (
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  {currentMedication.name}
                </h3>
                {sideEffects.length > 0 ? (
                  <div className="space-y-4">
                    {sideEffects.map((sideEffect, index) => (
                      <div
                        key={index}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {sideEffect.effect}
                          </h4>
                          {getSeverityBadge(sideEffect.severity)}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {sideEffect.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert
                    type="info"
                    message="No specific side effect information found for this medication. Please consult official drug information sources for complete side effect details."
                  />
                )}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <p>
                Note: This information is sourced from RxNav and may not be
                comprehensive. Always consult official drug information sources
                or a healthcare professional for complete information about
                medication side effects.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default MedicationSideEffects;
