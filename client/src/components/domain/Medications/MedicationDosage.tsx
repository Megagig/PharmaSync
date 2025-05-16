import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getMedicationDetails } from '@/store/slices/rxnavSlice';
import Card from '@/components/common/Card/Card';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import Select from '@/components/common/Select/Select';
import { Medication } from '@/types/medication.types';

interface MedicationDosageProps {
  initialRxcui?: string;
}

const MedicationDosage: React.FC<MedicationDosageProps> = ({
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
  const [dosageInfo, setDosageInfo] = useState<any[]>([]);

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
      // Extract dosage information from medication properties
      extractDosageInfo();
    }
  }, [currentMedication]);

  const extractDosageInfo = () => {
    if (!currentMedication || !currentMedication.properties) {
      setDosageInfo([]);
      return;
    }

    // Look for dosage information in the properties
    const dosageProps = currentMedication.properties.filter(
      (prop: any) =>
        prop.name.toLowerCase().includes('dosage') ||
        prop.name.toLowerCase().includes('dose') ||
        prop.name.toLowerCase().includes('administration')
    );

    if (dosageProps.length > 0) {
      setDosageInfo(dosageProps);
    } else {
      // If no specific dosage information is found, look for general information
      const generalInfoProps = currentMedication.properties.filter(
        (prop: any) =>
          prop.name === 'DOSAGE AND ADMINISTRATION' ||
          prop.name === 'CLINICAL PHARMACOLOGY'
      );

      setDosageInfo(generalInfoProps);
    }
  };

  const handleMedicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRxcui(e.target.value);
  };

  // Extract strength and form information
  const getStrengthAndForm = () => {
    if (!currentMedication || !currentMedication.properties) return null;

    const strength = currentMedication.properties.find(
      (prop: any) => prop.name === 'Strength'
    );

    const form = currentMedication.properties.find(
      (prop: any) => prop.name === 'RxNorm Dose Form'
    );

    if (strength || form) {
      return (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Medication Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {strength && (
              <div>
                <span className="text-xs font-medium text-blue-600">
                  Strength:
                </span>
                <p className="text-sm text-blue-900">{strength.value}</p>
              </div>
            )}
            {form && (
              <div>
                <span className="text-xs font-medium text-blue-600">Form:</span>
                <p className="text-sm text-blue-900">{form.value}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Medication Dosage Information
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

                {getStrengthAndForm()}

                {dosageInfo.length > 0 ? (
                  <div className="space-y-4">
                    {dosageInfo.map((info, index) => (
                      <div
                        key={index}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <h4 className="text-sm font-medium text-gray-900">
                          {info.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                          {info.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert
                    type="info"
                    message="No specific dosage information found for this medication. Please consult official drug information sources for complete dosage details."
                  />
                )}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <p>
                Note: This information is sourced from RxNav and may not be
                comprehensive. Always consult official drug information sources
                or a healthcare professional for complete information about
                medication dosages.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default MedicationDosage;
