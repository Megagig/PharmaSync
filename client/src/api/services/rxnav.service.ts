import axiosInstance from '../axios.config';

/**
 * Service for interacting with the RxNav API through our backend
 */
const rxnavService = {
  /**
   * Search for medications by name
   * @param query Search query (drug name)
   * @returns List of matching medications
   */
  searchMedications: async (query: string): Promise<any[]> => {
    const response = await axiosInstance.get(
      `/integrations/drug-database/medications/search`,
      {
        params: { query },
      }
    );
    return response.data.data;
  },

  /**
   * Get medication details by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Medication details
   */
  getMedicationDetails: async (rxcui: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/integrations/drug-database/medications/${rxcui}`
    );
    return response.data.data;
  },

  /**
   * Import medication from RxNav to local database
   * @param rxcui RxCUI identifier
   * @returns Imported medication
   */
  importMedication: async (rxcui: string): Promise<any> => {
    const response = await axiosInstance.post(
      `/integrations/drug-database/medications/import`,
      {
        externalMedicationId: rxcui,
      }
    );
    return response.data.data;
  },

  /**
   * Check for drug interactions
   * @param rxcuis List of RxCUI identifiers
   * @returns List of interactions
   */
  checkDrugInteractions: async (rxcuis: string[]): Promise<any[]> => {
    const response = await axiosInstance.post(
      `/integrations/drug-database/interactions/check`,
      {
        medications: rxcuis,
      }
    );
    return response.data.data;
  },

  /**
   * Get medication side effects
   * @param rxcui RxCUI identifier
   * @returns Side effects information
   */
  getMedicationSideEffects: async (rxcui: string): Promise<any[]> => {
    const medicationDetails = await rxnavService.getMedicationDetails(rxcui);
    return medicationDetails.sideEffects || [];
  },

  /**
   * Get medication contraindications
   * @param rxcui RxCUI identifier
   * @returns Contraindications information
   */
  getMedicationContraindications: async (rxcui: string): Promise<any[]> => {
    const medicationDetails = await rxnavService.getMedicationDetails(rxcui);
    return medicationDetails.contraindications || [];
  },

  /**
   * Get medication dosage information
   * @param rxcui RxCUI identifier
   * @returns Dosage information
   */
  getMedicationDosage: async (rxcui: string): Promise<any[]> => {
    const medicationDetails = await rxnavService.getMedicationDetails(rxcui);
    return medicationDetails.dosage || [];
  },
};

export default rxnavService;
