import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  getMedicationDetails,
  clearCurrentMedication,
} from '@/store/slices/rxnavSlice';
import Card from '@/components/common/Card/Card';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import Button from '@/components/common/Button/Button';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface MedicationDetailsProps {
  rxcui: string;
}

const MedicationDetails: React.FC<MedicationDetailsProps> = ({ rxcui }) => {
  const dispatch = useDispatch();
  const { currentMedication, isLoading, error } = useSelector(
    (state: RootState) => state.rxnav
  );

  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (rxcui) {
      dispatch(getMedicationDetails(rxcui));
    }

    return () => {
      dispatch(clearCurrentMedication());
    };
  }, [dispatch, rxcui]);

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

  if (!currentMedication) {
    return <Alert type="info" message="Select a medication to view details" />;
  }

  // Extract properties from medication data
  const getPropertyValue = (propName: string): string => {
    if (!currentMedication.properties) return 'N/A';

    const prop = currentMedication.properties.find(
      (p: any) => p.name === propName
    );

    return prop ? prop.value : 'N/A';
  };

  // Get drug class information
  const getDrugClasses = (): any[] => {
    if (!currentMedication.drugClass) return [];
    return currentMedication.drugClass;
  };

  // Format drug class for display
  const formatDrugClass = (drugClass: any): string => {
    return `${drugClass.className} (${drugClass.classType})`;
  };

  const tabs = [
    {
      name: 'General',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-sm text-gray-900">
                {currentMedication.name}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">RxCUI</h3>
              <p className="mt-1 text-sm text-gray-900">
                {currentMedication.rxcui}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Generic Name
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {getPropertyValue('Generic Name') ||
                  getPropertyValue('RxNorm Name')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Brand Name</h3>
              <p className="mt-1 text-sm text-gray-900">
                {getPropertyValue('Brand Name')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dosage Form</h3>
              <p className="mt-1 text-sm text-gray-900">
                {getPropertyValue('RxNorm Dose Form')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Strength</h3>
              <p className="mt-1 text-sm text-gray-900">
                {getPropertyValue('Strength')}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Classification',
      content: (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Drug Classes</h3>
          {getDrugClasses().length > 0 ? (
            <ul className="mt-1 divide-y divide-gray-200">
              {getDrugClasses().map((drugClass, index) => (
                <li key={index} className="py-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-900">
                      {formatDrugClass(drugClass)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {drugClass.classType}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              No classification information available
            </p>
          )}
        </div>
      ),
    },
    {
      name: 'NDC Codes',
      content: (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">
            National Drug Codes
          </h3>
          {currentMedication.ndcs && currentMedication.ndcs.length > 0 ? (
            <ul className="mt-1 divide-y divide-gray-200">
              {currentMedication.ndcs.map((ndc: string, index: number) => (
                <li key={index} className="py-2">
                  <span className="text-sm text-gray-900">{ndc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No NDC codes available</p>
          )}
        </div>
      ),
    },
    {
      name: 'Properties',
      content: (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">All Properties</h3>
          {currentMedication.properties &&
          currentMedication.properties.length > 0 ? (
            <div className="mt-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMedication.properties.map(
                    (prop: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prop.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prop.value}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              No properties available
            </p>
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
            Medication Details
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

export default MedicationDetails;
