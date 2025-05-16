import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { RootState } from '@/store/store';
import {
  searchMedications,
  getMedicationDetails,
  clearCurrentMedication,
  checkDrugInteractions,
  getMedicationSideEffects,
  getMedicationContraindications,
  getMedicationDosage,
} from '@/store/slices/rxnavSlice';
import PageHeader from '@/components/common/PageHeader/PageHeader';
import Card from '@/components/common/Card/Card';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert/Alert';
import {
  FaSearch,
  FaArrowLeft,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPills,
} from 'react-icons/fa';

const MedicationDatabase: React.FC = () => {
  const dispatch = useDispatch();
  const {
    searchResults,
    currentMedication,
    interactions,
    sideEffects,
    contraindications,
    dosageInfo,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.rxnav);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [interactionMedications, setInteractionMedications] = useState<
    string[]
  >([]);
  const [interactionSearchQuery, setInteractionSearchQuery] =
    useState<string>('');

  // Load additional data when a medication is selected
  useEffect(() => {
    if (selectedMedication && selectedMedication.id) {
      const rxcui = selectedMedication.id;
      dispatch(getMedicationSideEffects(rxcui));
      dispatch(getMedicationContraindications(rxcui));
      dispatch(getMedicationDosage(rxcui));
    }
  }, [selectedMedication, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchMedications(searchQuery.trim()));
    }
  };

  const handleViewDetails = (medication: any) => {
    setSelectedMedication(medication);
    setActiveTab('overview');
    if (medication && medication.id) {
      dispatch(getMedicationDetails(medication.id));
    }
  };

  const handleBackToSearch = () => {
    setSelectedMedication(null);
    dispatch(clearCurrentMedication());
    setInteractionMedications([]);
  };

  const handleAddToInteractions = (medication: any) => {
    if (!interactionMedications.includes(medication.id)) {
      setInteractionMedications([...interactionMedications, medication.id]);
    }
  };

  const handleRemoveFromInteractions = (rxcui: string) => {
    setInteractionMedications(
      interactionMedications.filter((id) => id !== rxcui)
    );
  };

  const handleCheckInteractions = () => {
    if (interactionMedications.length > 1) {
      dispatch(checkDrugInteractions(interactionMedications));
    }
  };

  const handleInteractionSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (interactionSearchQuery.trim()) {
      dispatch(searchMedications(interactionSearchQuery.trim()));
    }
  };

  return (
    <>
      <Helmet>
        <title>Medication Database | PharmaSync</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="RxNav Medication Database"
          subtitle="Search for medications, view details, side effects, and drug interactions"
        />

        <div className="mt-6">
          {!selectedMedication ? (
            <Card>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <FaPills className="text-primary-600 text-2xl mr-3" />
                  <h2 className="text-xl font-medium text-gray-900">
                    Search Medication Information
                  </h2>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Search for medications to view comprehensive information
                        including side effects, indications, dosage, and drug
                        interactions from the RxNav database.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter medication name (e.g., Lisinopril, Metformin, Atorvastatin)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : 'Search'}
                  </Button>
                </form>

                {error && <Alert type="error" message={error} />}

                {searchResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Medication Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            RxCUI ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {searchResults.map((medication) => (
                          <tr key={medication.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {medication.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {medication.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {medication.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleViewDetails(medication)}
                                >
                                  View Details
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleAddToInteractions(medication)
                                  }
                                  disabled={interactionMedications.includes(
                                    medication.id
                                  )}
                                >
                                  {interactionMedications.includes(
                                    medication.id
                                  )
                                    ? 'Added'
                                    : 'Add to Interactions'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                      <FaSearch className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg">
                        {searchQuery
                          ? 'No medications found matching your search'
                          : 'Search for medications to see results'}
                      </p>
                      {searchQuery && (
                        <p className="mt-2 text-sm">
                          Try using a different medication name or a more
                          general search term
                        </p>
                      )}
                    </div>
                  )
                )}

                {interactionMedications.length > 0 && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Selected Medications for Interaction Check
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {interactionMedications.map((rxcui) => {
                        const med = searchResults.find((m) => m.id === rxcui);
                        return (
                          <div
                            key={rxcui}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                          >
                            <span className="mr-2">
                              {med ? med.name : rxcui}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveFromInteractions(rxcui)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      onClick={handleCheckInteractions}
                      disabled={interactionMedications.length < 2}
                    >
                      Check Interactions
                    </Button>
                    {interactionMedications.length < 2 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Select at least 2 medications to check for interactions
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaPills className="text-primary-600 text-2xl mr-3" />
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900">
                      {selectedMedication.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      RxCUI: {selectedMedication.id}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleBackToSearch}
                  className="flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Back to Search
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <Alert type="error" message={error} />
              ) : currentMedication ? (
                <div>
                  {/* Tabs */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        className={`${
                          activeTab === 'overview'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </button>
                      <button
                        className={`${
                          activeTab === 'indications'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('indications')}
                      >
                        Indications & Usage
                      </button>
                      <button
                        className={`${
                          activeTab === 'sideEffects'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('sideEffects')}
                      >
                        Side Effects
                      </button>
                      <button
                        className={`${
                          activeTab === 'warnings'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('warnings')}
                      >
                        Warnings & Interactions
                      </button>
                      <button
                        className={`${
                          activeTab === 'dosage'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab('dosage')}
                      >
                        Dosage
                      </button>
                    </nav>
                  </div>

                  {/* Tab content */}
                  {activeTab === 'overview' && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Name
                                </h4>
                                <p className="text-base text-gray-900">
                                  {currentMedication.name}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  RxCUI
                                </h4>
                                <p className="text-base text-gray-900">
                                  {currentMedication.rxcui}
                                </p>
                              </div>
                              {currentMedication.properties &&
                                currentMedication.properties.map(
                                  (prop: any, index: number) => {
                                    if (
                                      prop.name === 'RxNorm Dose Form' ||
                                      prop.name === 'Strength' ||
                                      prop.name === 'Generic Name' ||
                                      prop.name === 'Brand Name'
                                    ) {
                                      return (
                                        <div key={index}>
                                          <h4 className="text-sm font-medium text-gray-500">
                                            {prop.name}
                                          </h4>
                                          <p className="text-base text-gray-900">
                                            {prop.value}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }
                                )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Drug Class
                            </h4>
                            {currentMedication.drugClass &&
                            currentMedication.drugClass.length > 0 ? (
                              <div className="space-y-2">
                                {currentMedication.drugClass.map(
                                  (cls: any, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-blue-50 p-3 rounded"
                                    >
                                      <p className="text-sm font-medium text-blue-800">
                                        {cls.className}
                                      </p>
                                      {cls.classType && (
                                        <p className="text-xs text-blue-600 mt-1">
                                          Type: {cls.classType}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No drug class information available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {activeTab === 'indications' && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Indications & Usage
                        </h3>
                        {currentMedication.properties &&
                        currentMedication.properties.some(
                          (prop: any) =>
                            prop.name === 'INDICATIONS AND USAGE' ||
                            prop.name === 'DESCRIPTION'
                        ) ? (
                          <div className="space-y-6">
                            {currentMedication.properties.map(
                              (prop: any, index: number) => {
                                if (
                                  prop.name === 'INDICATIONS AND USAGE' ||
                                  prop.name === 'DESCRIPTION'
                                ) {
                                  return (
                                    <div
                                      key={index}
                                      className="bg-gray-50 p-4 rounded-lg"
                                    >
                                      <h4 className="text-base font-medium text-gray-900 mb-2">
                                        {prop.name}
                                      </h4>
                                      <p className="text-sm text-gray-700 whitespace-pre-line">
                                        {prop.value}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  No indication information available for this
                                  medication in the RxNav database.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {activeTab === 'sideEffects' && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Side Effects
                        </h3>
                        {currentMedication.properties &&
                        currentMedication.properties.some(
                          (prop: any) =>
                            prop.name === 'ADVERSE REACTIONS' ||
                            prop.name.includes('SIDE EFFECT')
                        ) ? (
                          <div className="space-y-6">
                            {currentMedication.properties.map(
                              (prop: any, index: number) => {
                                if (
                                  prop.name === 'ADVERSE REACTIONS' ||
                                  prop.name.includes('SIDE EFFECT')
                                ) {
                                  return (
                                    <div
                                      key={index}
                                      className="bg-gray-50 p-4 rounded-lg"
                                    >
                                      <h4 className="text-base font-medium text-gray-900 mb-2">
                                        {prop.name}
                                      </h4>
                                      <p className="text-sm text-gray-700 whitespace-pre-line">
                                        {prop.value}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  No side effect information available for this
                                  medication in the RxNav database.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {activeTab === 'warnings' && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Warnings & Interactions
                        </h3>

                        {/* Warnings section */}
                        <div className="mb-8">
                          <h4 className="text-base font-medium text-gray-900 mb-3">
                            Warnings & Contraindications
                          </h4>
                          {currentMedication.properties &&
                          currentMedication.properties.some(
                            (prop: any) =>
                              prop.name === 'WARNINGS' ||
                              prop.name === 'CONTRAINDICATIONS'
                          ) ? (
                            <div className="space-y-6">
                              {currentMedication.properties.map(
                                (prop: any, index: number) => {
                                  if (
                                    prop.name === 'WARNINGS' ||
                                    prop.name === 'CONTRAINDICATIONS'
                                  ) {
                                    return (
                                      <div
                                        key={index}
                                        className="bg-gray-50 p-4 rounded-lg"
                                      >
                                        <h4 className="text-base font-medium text-gray-900 mb-2">
                                          {prop.name}
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">
                                          {prop.value}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }
                              )}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-yellow-700">
                                    No warning information available for this
                                    medication in the RxNav database.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Drug Interactions section */}
                        <div>
                          <h4 className="text-base font-medium text-gray-900 mb-3">
                            Drug Interactions
                          </h4>

                          {/* Documented interactions */}
                          {currentMedication.properties &&
                          currentMedication.properties.some(
                            (prop: any) => prop.name === 'DRUG INTERACTIONS'
                          ) ? (
                            <div className="space-y-6 mb-6">
                              {currentMedication.properties.map(
                                (prop: any, index: number) => {
                                  if (prop.name === 'DRUG INTERACTIONS') {
                                    return (
                                      <div
                                        key={index}
                                        className="bg-gray-50 p-4 rounded-lg"
                                      >
                                        <h4 className="text-base font-medium text-gray-900 mb-2">
                                          Documented Interactions
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">
                                          {prop.value}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }
                              )}
                            </div>
                          ) : null}

                          {/* Check interactions with other medications */}
                          <div className="bg-blue-50 p-4 rounded-lg mt-4">
                            <h4 className="text-base font-medium text-blue-900 mb-2">
                              Check Interactions with Other Medications
                            </h4>
                            <p className="text-sm text-blue-700 mb-4">
                              Search for other medications to check for
                              potential interactions with{' '}
                              {selectedMedication.name}.
                            </p>

                            <form
                              onSubmit={handleInteractionSearch}
                              className="flex space-x-2 mb-4"
                            >
                              <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FaSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Search for another medication..."
                                  value={interactionSearchQuery}
                                  onChange={(e) =>
                                    setInteractionSearchQuery(e.target.value)
                                  }
                                  className="pl-10"
                                />
                              </div>
                              <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Spinner size="sm" /> : 'Search'}
                              </Button>
                            </form>

                            {/* Selected medications for interaction check */}
                            {interactionMedications.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-blue-900 mb-2">
                                  Selected Medications:
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {interactionMedications.map((rxcui) => {
                                    const med =
                                      searchResults.find(
                                        (m) => m.id === rxcui
                                      ) ||
                                      (rxcui === selectedMedication.id
                                        ? selectedMedication
                                        : null);
                                    return (
                                      <div
                                        key={rxcui}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                                      >
                                        <span className="mr-2">
                                          {med ? med.name : rxcui}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleRemoveFromInteractions(rxcui)
                                          }
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Add current medication to interaction check if not already added */}
                            {!interactionMedications.includes(
                              selectedMedication.id
                            ) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleAddToInteractions(selectedMedication)
                                }
                                className="mb-4"
                              >
                                Add {selectedMedication.name} to Interaction
                                Check
                              </Button>
                            )}

                            {/* Check interactions button */}
                            {interactionMedications.length > 1 && (
                              <Button
                                onClick={handleCheckInteractions}
                                className="w-full"
                              >
                                Check Interactions
                              </Button>
                            )}

                            {/* Interaction results */}
                            {interactions && interactions.length > 0 && (
                              <div className="mt-6">
                                <h5 className="text-base font-medium text-blue-900 mb-3">
                                  Interaction Results:
                                </h5>
                                <div className="space-y-4">
                                  {interactions.map((interaction, index) => (
                                    <div
                                      key={index}
                                      className="border border-red-200 rounded-lg p-4 bg-red-50"
                                    >
                                      <div className="flex justify-between mb-2">
                                        <div className="font-medium text-red-800">
                                          {interaction.drug1.name} +{' '}
                                          {interaction.drug2.name}
                                        </div>
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                          {interaction.severity}
                                        </div>
                                      </div>
                                      <p className="text-sm text-red-700">
                                        {interaction.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Search results for interactions */}
                            {searchResults.length > 0 &&
                              interactionSearchQuery && (
                                <div className="mt-6">
                                  <h5 className="text-sm font-medium text-blue-900 mb-2">
                                    Search Results:
                                  </h5>
                                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <ul className="divide-y divide-gray-200">
                                      {searchResults
                                        .slice(0, 5)
                                        .map((medication) => (
                                          <li
                                            key={medication.id}
                                            className="px-4 py-3 hover:bg-gray-50"
                                          >
                                            <div className="flex justify-between items-center">
                                              <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                  {medication.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                  RxCUI: {medication.id}
                                                </p>
                                              </div>
                                              <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                  handleAddToInteractions(
                                                    medication
                                                  )
                                                }
                                                disabled={interactionMedications.includes(
                                                  medication.id
                                                )}
                                              >
                                                {interactionMedications.includes(
                                                  medication.id
                                                )
                                                  ? 'Added'
                                                  : 'Add'}
                                              </Button>
                                            </div>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {activeTab === 'dosage' && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Dosage Information
                        </h3>
                        {currentMedication.properties &&
                        currentMedication.properties.some(
                          (prop: any) =>
                            prop.name === 'DOSAGE AND ADMINISTRATION' ||
                            prop.name.includes('DOSAGE') ||
                            prop.name.includes('DOSE')
                        ) ? (
                          <div className="space-y-6">
                            {currentMedication.properties.map(
                              (prop: any, index: number) => {
                                if (
                                  prop.name === 'DOSAGE AND ADMINISTRATION' ||
                                  prop.name.includes('DOSAGE') ||
                                  prop.name.includes('DOSE')
                                ) {
                                  return (
                                    <div
                                      key={index}
                                      className="bg-gray-50 p-4 rounded-lg"
                                    >
                                      <h4 className="text-base font-medium text-gray-900 mb-2">
                                        {prop.name}
                                      </h4>
                                      <p className="text-sm text-gray-700 whitespace-pre-line">
                                        {prop.value}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  No dosage information available for this
                                  medication in the RxNav database.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert type="info" message="Loading medication details..." />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MedicationDatabase;
