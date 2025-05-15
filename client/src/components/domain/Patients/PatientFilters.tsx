import { useState, useEffect } from 'react';
import { Gender, BloodGroup, Genotype, MaritalStatus } from '@/types/patient.types';
import Button from '@/components/common/Button/Button';

interface PatientFiltersProps {
  onFilterChange: (filters: PatientFilterValues) => void;
  initialFilters?: PatientFilterValues;
}

export interface PatientFilterValues {
  search: string;
  gender?: Gender | '';
  bloodGroup?: BloodGroup | '';
  genotype?: Genotype | '';
  maritalStatus?: MaritalStatus | '';
  ageRange?: [number | '', number | ''];
  hasAllergies?: boolean | null;
  hasMedicalConditions?: boolean | null;
  hasMedicationHistory?: boolean | null;
  hasClinicalAssessments?: boolean | null;
  hasLaboratoryFindings?: boolean | null;
  hasDrugTherapyProblems?: boolean | null;
  hasCarePlans?: boolean | null;
  hasSoapNotes?: boolean | null;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  onFilterChange,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<PatientFilterValues>({
    search: '',
    gender: '',
    bloodGroup: '',
    genotype: '',
    maritalStatus: '',
    ageRange: ['', ''],
    hasAllergies: null,
    hasMedicalConditions: null,
    hasMedicationHistory: null,
    hasClinicalAssessments: null,
    hasLaboratoryFindings: null,
    hasDrugTherapyProblems: null,
    hasCarePlans: null,
    hasSoapNotes: null,
    ...initialFilters,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgeRangeChange = (index: number, value: string) => {
    const newValue = value === '' ? '' : parseInt(value);
    const newAgeRange = [...filters.ageRange!] as [number | '', number | ''];
    newAgeRange[index] = newValue;
    setFilters((prev) => ({ ...prev, ageRange: newAgeRange }));
  };

  const handleBooleanChange = (name: string, value: boolean | null) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      gender: '',
      bloodGroup: '',
      genotype: '',
      maritalStatus: '',
      ageRange: ['', ''],
      hasAllergies: null,
      hasMedicalConditions: null,
      hasMedicationHistory: null,
      hasClinicalAssessments: null,
      hasLaboratoryFindings: null,
      hasDrugTherapyProblems: null,
      hasCarePlans: null,
      hasSoapNotes: null,
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search patients..."
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpand}
            leftIcon={
              <svg
                className={`h-5 w-5 transform ${isExpanded ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={filters.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Any</option>
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
              <option value={Gender.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
              Blood Group
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Any</option>
              <option value={BloodGroup.A_POSITIVE}>A+</option>
              <option value={BloodGroup.A_NEGATIVE}>A-</option>
              <option value={BloodGroup.B_POSITIVE}>B+</option>
              <option value={BloodGroup.B_NEGATIVE}>B-</option>
              <option value={BloodGroup.AB_POSITIVE}>AB+</option>
              <option value={BloodGroup.AB_NEGATIVE}>AB-</option>
              <option value={BloodGroup.O_POSITIVE}>O+</option>
              <option value={BloodGroup.O_NEGATIVE}>O-</option>
            </select>
          </div>

          <div>
            <label htmlFor="genotype" className="block text-sm font-medium text-gray-700">
              Genotype
            </label>
            <select
              id="genotype"
              name="genotype"
              value={filters.genotype}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Any</option>
              <option value={Genotype.AA}>AA</option>
              <option value={Genotype.AS}>AS</option>
              <option value={Genotype.SS}>SS</option>
              <option value={Genotype.AC}>AC</option>
              <option value={Genotype.SC}>SC</option>
              <option value={Genotype.CC}>CC</option>
            </select>
          </div>

          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
              Marital Status
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={filters.maritalStatus}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Any</option>
              <option value={MaritalStatus.SINGLE}>Single</option>
              <option value={MaritalStatus.MARRIED}>Married</option>
              <option value={MaritalStatus.DIVORCED}>Divorced</option>
              <option value={MaritalStatus.WIDOWED}>Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age Range</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="number"
                min="0"
                max="150"
                value={filters.ageRange![0]}
                onChange={(e) => handleAgeRangeChange(0, e.target.value)}
                placeholder="Min"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="number"
                min="0"
                max="150"
                value={filters.ageRange![1]}
                onChange={(e) => handleAgeRangeChange(1, e.target.value)}
                placeholder="Max"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasAllergies', filters.hasAllergies === true ? null : true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasAllergies === true
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Has Allergies
                </button>
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasAllergies', filters.hasAllergies === false ? null : false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasAllergies === false
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  No Allergies
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasMedicationHistory', filters.hasMedicationHistory === true ? null : true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasMedicationHistory === true
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Has Medication History
                </button>
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasMedicationHistory', filters.hasMedicationHistory === false ? null : false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasMedicationHistory === false
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  No Medication History
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasDrugTherapyProblems', filters.hasDrugTherapyProblems === true ? null : true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasDrugTherapyProblems === true
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Has Drug Therapy Problems
                </button>
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasDrugTherapyProblems', filters.hasDrugTherapyProblems === false ? null : false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasDrugTherapyProblems === false
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  No Drug Therapy Problems
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasCarePlans', filters.hasCarePlans === true ? null : true)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasCarePlans === true
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Has Care Plans
                </button>
                <button
                  type="button"
                  onClick={() => handleBooleanChange('hasCarePlans', filters.hasCarePlans === false ? null : false)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filters.hasCarePlans === false
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  No Care Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFilters;
