import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  getMedicationDetails,
  checkDrugInteractions,
} from '@/store/slices/rxnavSlice';
import Card from '@/components/common/Card/Card';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import Button from '@/components/common/Button/Button';
import { Prescription } from '@/types/prescription.types';
import { Medication } from '@/types/medication.types';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface PrescriptionMedicationInfoProps {
  prescription: Prescription;
}

const PrescriptionMedicationInfo: React.FC<PrescriptionMedicationInfoProps> = ({
  prescription,
}) => {
  const dispatch = useDispatch();
  const { currentMedication, interactions, isLoading, error } = useSelector(
    (state: RootState) => state.rxnav
  );
  const { medications } = useSelector((state: RootState) => state.medications);
  const { prescriptions } = useSelector(
    (state: RootState) => state.prescriptions
  );

  const [selectedTab, setSelectedTab] = useState(0);
  const [medication, setMedication] = useState<Medication | null>(null);
  const [patientMedications, setPatientMedications] = useState<Medication[]>(
    []
  );
  const [showInteractions, setShowInteractions] = useState(false);

  useEffect(() => {
    // Find the medication for this prescription
    if (prescription && prescription.medication) {
      const med = medications.find((m) => m.id === prescription.medication);
      if (med && med.externalId) {
        setMedication(med);
        dispatch(getMedicationDetails(med.externalId));
      }
    }

    // Find all medications prescribed to this patient
    if (prescription && prescription.patient) {
      const patientPrescriptions = prescriptions.filter(
        (p) => p.patient === prescription.patient && p.id !== prescription.id
      );

      const patientMeds = patientPrescriptions
        .map((p) => medications.find((m) => m.id === p.medication))
        .filter((m): m is Medication => m !== undefined);

      setPatientMedications(patientMeds);
    }
  }, [dispatch, prescription, medications, prescriptions]);

  const handleCheckInteractions = () => {
    if (!medication || !medication.externalId) return;

    const rxcuis = [
      medication.externalId,
      ...patientMedications
        .filter((med) => med.externalId)
        .map((med) => med.externalId as string),
    ];

    if (rxcuis.length >= 2) {
      dispatch(checkDrugInteractions(rxcuis));
      setShowInteractions(true);
    }
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

  if (!medication) {
    return (
      <Alert
        type="info"
        message="No medication information available for this prescription"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  const tabs = [
    {
      name: 'General',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-sm text-gray-900">{medication.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dosage Form</h3>
              <p className="mt-1 text-sm text-gray-900">
                {medication.dosageForm}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Strength</h3>
              <p className="mt-1 text-sm text-gray-900">
                {medication.strength}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 text-sm text-gray-900">
                {medication.category}
              </p>
            </div>
          </div>

          {currentMedication && currentMedication.properties && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">
                Additional Information
              </h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {currentMedication.properties
                  .filter(
                    (prop: any) =>
                      prop.name === 'DESCRIPTION' ||
                      prop.name === 'CLINICAL PHARMACOLOGY' ||
                      prop.name === 'INDICATIONS AND USAGE'
                  )
                  .map((prop: any, index: number) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <h4 className="text-xs font-medium text-gray-700">
                        {prop.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-600">{prop.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      name: 'Interactions',
      content: (
        <div className="space-y-4">
          {patientMedications.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Patient's Other Medications:
                </h3>
                <ul className="space-y-1">
                  {patientMedications.map((med) => (
                    <li key={med.id} className="text-sm text-gray-600">
                      • {med.name} {med.strength} {med.dosageForm}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={handleCheckInteractions}
                disabled={isLoading || patientMedications.length === 0}
                className="w-full"
              >
                {isLoading ? <Spinner size="sm" /> : 'Check for Interactions'}
              </Button>

              {showInteractions && (
                <div className="mt-4">
                  {interactions.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        Potential Interactions:
                      </h3>
                      {interactions.map((interaction, index) => (
                        <div
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert
                      type="success"
                      message="No interactions found between these medications."
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <Alert
              type="info"
              message="This patient doesn't have any other medications to check for interactions."
            />
          )}
        </div>
      ),
    },
    {
      name: 'Dosage',
      content: (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Prescribed Dosage:
            </h3>
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-medium text-blue-600">
                    Amount:
                  </span>
                  <p className="text-sm text-blue-900">
                    {prescription.dosage?.amount} {prescription.dosage?.unit}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-600">
                    Frequency:
                  </span>
                  <p className="text-sm text-blue-900">
                    {prescription.dosage?.frequency}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-600">
                    Route:
                  </span>
                  <p className="text-sm text-blue-900">
                    {prescription.dosage?.route}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-600">
                    Duration:
                  </span>
                  <p className="text-sm text-blue-900">
                    {prescription.duration} days
                  </p>
                </div>
              </div>
              {prescription.dosage?.instructions && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-blue-600">
                    Instructions:
                  </span>
                  <p className="text-sm text-blue-900">
                    {prescription.dosage.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {currentMedication &&
            currentMedication.dosage &&
            currentMedication.dosage.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Standard Dosage Information:
                </h3>
                <div className="space-y-3">
                  {currentMedication.dosage.map(
                    (dosage: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <h4 className="text-xs font-medium text-gray-700">
                          {dosage.name}
                        </h4>
                        <p className="mt-1 text-xs text-gray-600">
                          {dosage.value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Medication Information
          </h2>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'rounded-xl bg-white p-3',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                {tab.content}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Card>
  );
};

export default PrescriptionMedicationInfo;
