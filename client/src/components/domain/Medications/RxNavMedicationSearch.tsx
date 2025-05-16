import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  searchMedications,
  clearSearchResults,
  importMedication,
} from '@/store/slices/rxnavSlice';
import { fetchMedications } from '@/store/slices/medicationSlice';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Alert from '@/components/common/Alert';
import { toast } from 'react-toastify';

interface RxNavMedicationSearchProps {
  onMedicationSelect?: (medication: any) => void;
  showImportButton?: boolean;
}

const RxNavMedicationSearch: React.FC<RxNavMedicationSearchProps> = ({
  onMedicationSelect,
  showImportButton = true,
}) => {
  const dispatch = useDispatch();
  const { searchResults, isLoading, error } = useSelector(
    (state: RootState) => state.rxnav
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Clear search results when component unmounts
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchMedications(searchQuery.trim()));
    }
  };

  const handleImport = async (rxcui: string) => {
    setIsImporting((prev) => ({ ...prev, [rxcui]: true }));

    try {
      await dispatch(importMedication(rxcui)).unwrap();
      toast.success('Medication imported successfully');
      // Refresh medications list
      dispatch(fetchMedications({}));
    } catch (error) {
      toast.error('Failed to import medication');
    } finally {
      setIsImporting((prev) => ({ ...prev, [rxcui]: false }));
    }
  };

  const handleSelect = (medication: any) => {
    if (onMedicationSelect) {
      onMedicationSelect(medication);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search for medications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RxCUI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchResults.map((medication) => (
                <tr key={medication.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelect(medication)}
                      >
                        Select
                      </Button>

                      {showImportButton && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleImport(medication.id)}
                          disabled={isImporting[medication.id]}
                        >
                          {isImporting[medication.id] ? (
                            <Spinner size="sm" />
                          ) : (
                            'Import'
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-4 text-gray-500">
            {searchQuery
              ? 'No medications found'
              : 'Search for medications to see results'}
          </div>
        )
      )}
    </div>
  );
};

export default RxNavMedicationSearch;
