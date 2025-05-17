import axios from 'axios';
import { logger } from '../../utils/logger.utils';
import { AppError } from '../../utils/error';

/**
 * Service for interacting with the RxNav API
 * Documentation: https://lhncbc.nlm.nih.gov/RxNav/APIs/
 */
class RxNavService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://rxnav.nlm.nih.gov/REST';
  }

  /**
   * Search for medications by name
   * @param query Search query (drug name)
   * @returns List of matching medications
   */
  async searchMedicationsByName(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/drugs`, {
        params: { name: query },
      });

      if (
        response.data &&
        response.data.drugGroup &&
        response.data.drugGroup.conceptGroup
      ) {
        // Extract and format the medication data
        const medications: any[] = [];

        for (const group of response.data.drugGroup.conceptGroup) {
          if (group.conceptProperties) {
            for (const med of group.conceptProperties) {
              medications.push({
                rxcui: med.rxcui,
                name: med.name,
                synonym: med.synonym,
                tty: med.tty, // Term type
                language: med.language,
                suppress: med.suppress,
                umlscui: med.umlscui,
              });
            }
          }
        }

        return medications;
      }

      return [];
    } catch (error: any) {
      logger.error(`Error searching medications in RxNav: ${error.message}`);
      throw new AppError(
        `Failed to search medications in RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication details by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Medication details
   */
  async getMedicationByRxcui(rxcui: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/rxcui/${rxcui}`);

      if (response.data && response.data.idGroup) {
        return response.data.idGroup;
      }

      throw new AppError('Medication not found', 404);
    } catch (error: any) {
      logger.error(
        `Error fetching medication details from RxNav: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch medication details from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication properties by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Medication properties
   */
  async getMedicationProperties(rxcui: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rxcui/${rxcui}/allProperties`,
        {
          params: { prop: 'all' },
        }
      );

      if (
        response.data &&
        response.data.propConceptGroup &&
        response.data.propConceptGroup.propConcept
      ) {
        return response.data.propConceptGroup.propConcept;
      }

      return [];
    } catch (error: any) {
      logger.error(
        `Error fetching medication properties from RxNav: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch medication properties from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication NDCs (National Drug Codes) by RxCUI
   * @param rxcui RxCUI identifier
   * @returns List of NDCs
   */
  async getMedicationNDCs(rxcui: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/rxcui/${rxcui}/ndcs`);

      if (
        response.data &&
        response.data.ndcGroup &&
        response.data.ndcGroup.ndcList
      ) {
        return response.data.ndcGroup.ndcList.ndc || [];
      }

      return [];
    } catch (error: any) {
      logger.error(
        `Error fetching medication NDCs from RxNav: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch medication NDCs from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get drug interactions for a list of RxCUIs
   * @param rxcuis List of RxCUI identifiers
   * @returns List of interactions
   */
  async getDrugInteractions(rxcuis: string[]): Promise<any[]> {
    try {
      // Make sure we have at least 2 RxCUIs
      if (rxcuis.length < 2) {
        return [];
      }

      // Use the interaction API endpoint
      const response = await axios.get(
        `${this.baseUrl}/interaction/interaction.json`,
        {
          params: { rxcuis: rxcuis.join('+') },
        }
      );

      // Check if we have interaction data
      if (
        response.data &&
        response.data.interactionTypeGroup &&
        response.data.interactionTypeGroup.length > 0
      ) {
        // Extract and format the interaction data
        const interactions = [];

        for (const group of response.data.interactionTypeGroup) {
          if (group.interactionType && group.interactionType.length > 0) {
            for (const interactionType of group.interactionType) {
              if (
                interactionType.interactionPair &&
                interactionType.interactionPair.length > 0
              ) {
                for (const pair of interactionType.interactionPair) {
                  interactions.push({
                    drug1: {
                      rxcui: pair.interactionConcept[0].minConceptItem.rxcui,
                      name: pair.interactionConcept[0].minConceptItem.name,
                    },
                    drug2: {
                      rxcui: pair.interactionConcept[1].minConceptItem.rxcui,
                      name: pair.interactionConcept[1].minConceptItem.name,
                    },
                    description: pair.description,
                    severity: pair.severity || 'N/A',
                  });
                }
              }
            }
          }
        }

        return interactions;
      }

      // If no interactions found, try the alternative endpoint
      const altResponse = await axios.get(
        `${this.baseUrl}/interaction/list.json`,
        {
          params: { rxcuis: rxcuis.join('+') },
        }
      );

      if (
        altResponse.data &&
        altResponse.data.fullInteractionTypeGroup &&
        altResponse.data.fullInteractionTypeGroup.length > 0 &&
        altResponse.data.fullInteractionTypeGroup[0].fullInteractionType
      ) {
        const interactions = [];

        for (const interactionType of altResponse.data
          .fullInteractionTypeGroup[0].fullInteractionType) {
          if (
            interactionType.interactionPair &&
            interactionType.interactionPair.length > 0
          ) {
            for (const pair of interactionType.interactionPair) {
              interactions.push({
                drug1: {
                  rxcui: pair.interactionConcept[0].minConceptItem.rxcui,
                  name: pair.interactionConcept[0].minConceptItem.name,
                },
                drug2: {
                  rxcui: pair.interactionConcept[1].minConceptItem.rxcui,
                  name: pair.interactionConcept[1].minConceptItem.name,
                },
                description: pair.description,
                severity: pair.severity || 'N/A',
              });
            }
          }
        }

        return interactions;
      }

      // If still no interactions found, create mock data for testing
      if (process.env.NODE_ENV === 'development') {
        logger.warn('No interactions found, creating mock data for testing');
        return rxcuis.flatMap((rxcui1, i) =>
          rxcuis.slice(i + 1).map((rxcui2) => ({
            drug1: {
              rxcui: rxcui1,
              name: `Medication ${rxcui1}`,
            },
            drug2: {
              rxcui: rxcui2,
              name: `Medication ${rxcui2}`,
            },
            description: 'This is a mock interaction for testing purposes.',
            severity: 'N/A',
          }))
        );
      }

      return [];
    } catch (error: any) {
      logger.error(
        `Error fetching drug interactions from RxNav: ${error.message}`
      );

      // If in development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'Error fetching interactions, creating mock data for testing'
        );
        return rxcuis.flatMap((rxcui1, i) =>
          rxcuis.slice(i + 1).map((rxcui2) => ({
            drug1: {
              rxcui: rxcui1,
              name: `Medication ${rxcui1}`,
            },
            drug2: {
              rxcui: rxcui2,
              name: `Medication ${rxcui2}`,
            },
            description: 'This is a mock interaction for testing purposes.',
            severity: 'N/A',
          }))
        );
      }

      throw new AppError(
        `Failed to fetch drug interactions from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get drug class information by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Drug class information
   */
  async getDrugClass(rxcui: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rxclass/class/byRxcui`,
        {
          params: { rxcui: rxcui },
        }
      );

      if (
        response.data &&
        response.data.rxclassDrugInfoList &&
        response.data.rxclassDrugInfoList.rxclassDrugInfo
      ) {
        return response.data.rxclassDrugInfoList.rxclassDrugInfo;
      }

      return [];
    } catch (error: any) {
      logger.error(`Error fetching drug class from RxNav: ${error.message}`);
      throw new AppError(
        `Failed to fetch drug class from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get drug strength information by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Drug strength information
   */
  async getDrugStrength(rxcui: string): Promise<any> {
    try {
      // First try to get strength from properties
      try {
        const properties = await this.getMedicationProperties(rxcui);
        if (properties && Array.isArray(properties) && properties.length > 0) {
          const strengthProps = properties.filter(
            (prop: any) =>
              prop &&
              prop.name &&
              typeof prop.name === 'string' &&
              (prop.name === 'RxNorm Dose Form' ||
                prop.name === 'Strength' ||
                prop.name.toLowerCase().includes('strength') ||
                prop.name.toLowerCase().includes('dose'))
          );

          if (strengthProps.length > 0) {
            return strengthProps;
          }
        }
      } catch (propError) {
        logger.warn(
          `Error filtering strength properties: ${
            (propError as Error).message || 'Unknown error'
          }`
        );
        // Continue to next approach
      }

      // If no strength properties found, try the related API
      try {
        const response = await axios.get(
          `${this.baseUrl}/rxcui/${rxcui}/related`,
          {
            params: { tty: 'SCD' }, // Use SCD (Semantic Clinical Drug) only
          }
        );

        if (
          response.data &&
          response.data.relatedGroup &&
          response.data.relatedGroup.conceptGroup
        ) {
          return response.data.relatedGroup.conceptGroup;
        }
      } catch (error) {
        const relatedError = error as Error;
        logger.warn(
          `Error fetching related drugs: ${
            relatedError.message || 'Unknown error'
          }`
        );
        // Continue to the next approach
      }

      // If still no strength info, try the allrelated API
      try {
        const allRelatedResponse = await axios.get(
          `${this.baseUrl}/rxcui/${rxcui}/allrelated`
        );

        if (
          allRelatedResponse.data &&
          allRelatedResponse.data.allRelatedGroup &&
          allRelatedResponse.data.allRelatedGroup.conceptGroup
        ) {
          const strengthGroups =
            allRelatedResponse.data.allRelatedGroup.conceptGroup.filter(
              (group: any) =>
                group.tty === 'SCD' ||
                group.tty === 'SBD' ||
                group.tty === 'SCDF' ||
                group.tty === 'SBDF'
            );

          if (strengthGroups.length > 0) {
            return strengthGroups;
          }
        }
      } catch (error) {
        const allRelatedError = error as Error;
        logger.warn(
          `Error fetching all related drugs: ${
            allRelatedError.message || 'Unknown error'
          }`
        );
      }

      // If in development mode and no strength info found, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'No strength information found, creating mock data for testing'
        );
        return [
          {
            name: 'Strength',
            value: '10 mg',
          },
          {
            name: 'RxNorm Dose Form',
            value: 'Oral Tablet',
          },
        ];
      }

      return [];
    } catch (error: any) {
      logger.error(`Error fetching drug strength from RxNav: ${error.message}`);

      // If in development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Error fetching strength, creating mock data for testing');
        return [
          {
            name: 'Strength',
            value: '10 mg',
          },
          {
            name: 'RxNorm Dose Form',
            value: 'Oral Tablet',
          },
        ];
      }

      throw new AppError(
        `Failed to fetch drug strength from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication side effects by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Side effects information
   */
  async getMedicationSideEffects(rxcui: string): Promise<any[]> {
    try {
      // Try to get side effects from properties first (more reliable)
      try {
        const properties = await this.getMedicationProperties(rxcui);
        if (properties && properties.length > 0) {
          const sideEffectProps = properties.filter(
            (prop: any) =>
              prop.name &&
              typeof prop.name === 'string' &&
              (prop.name.toLowerCase().includes('adverse') ||
                prop.name.toLowerCase().includes('side effect') ||
                prop.name.toLowerCase().includes('reaction'))
          );

          if (sideEffectProps.length > 0) {
            return sideEffectProps.map((prop: any) => ({
              name: prop.name,
              value: prop.value,
            }));
          }
        }
      } catch (propError) {
        logger.warn(
          `Error getting side effects from properties: ${
            (propError as Error).message || 'Unknown error'
          }`
        );
        // Continue to next approach
      }

      // Then try to get side effects from the NDF-RT API
      try {
        const response = await axios.get(
          `${this.baseUrl}/rxclass/class/byRxcui`,
          {
            params: {
              rxcui: rxcui,
              relaSource: 'NDFRT',
              rela: 'has_PE', // PE = Physiologic Effect
            },
          }
        );

        if (
          response.data &&
          response.data.rxclassDrugInfoList &&
          response.data.rxclassDrugInfoList.rxclassDrugInfo
        ) {
          return response.data.rxclassDrugInfoList.rxclassDrugInfo;
        }
      } catch (apiError) {
        logger.warn(
          `Error getting side effects from NDF-RT API: ${
            (apiError as Error).message || 'Unknown error'
          }`
        );
        // Continue to fallback
      }

      // If in development mode and no side effects found, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn('No side effects found, creating mock data for testing');
        return [
          {
            name: 'ADVERSE REACTIONS',
            value:
              'Common side effects include headache, dizziness, and nausea. Less common side effects include fatigue, insomnia, and dry mouth.',
          },
          {
            name: 'SIDE EFFECTS',
            value:
              'May cause drowsiness. Alcohol may intensify this effect. Use care when operating a car or dangerous machinery.',
          },
        ];
      }

      return [];
    } catch (error: any) {
      logger.error(
        `Error fetching medication side effects from RxNav: ${error.message}`
      );

      // If in development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'Error fetching side effects, creating mock data for testing'
        );
        return [
          {
            name: 'ADVERSE REACTIONS',
            value:
              'Common side effects include headache, dizziness, and nausea. Less common side effects include fatigue, insomnia, and dry mouth.',
          },
          {
            name: 'SIDE EFFECTS',
            value:
              'May cause drowsiness. Alcohol may intensify this effect. Use care when operating a car or dangerous machinery.',
          },
        ];
      }

      throw new AppError(
        `Failed to fetch medication side effects from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication contraindications by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Contraindications information
   */
  async getMedicationContraindications(rxcui: string): Promise<any[]> {
    try {
      // Try to get contraindications from properties first (more reliable)
      try {
        const properties = await this.getMedicationProperties(rxcui);
        if (properties && properties.length > 0) {
          const contraindicationProps = properties.filter(
            (prop: any) =>
              prop.name &&
              typeof prop.name === 'string' &&
              (prop.name.toLowerCase().includes('contraindication') ||
                prop.name.toLowerCase().includes('warning') ||
                prop.name.toLowerCase().includes('precaution'))
          );

          if (contraindicationProps.length > 0) {
            return contraindicationProps.map((prop: any) => ({
              name: prop.name,
              value: prop.value,
            }));
          }
        }
      } catch (propError) {
        logger.warn(
          `Error getting contraindications from properties: ${
            (propError as Error).message || 'Unknown error'
          }`
        );
        // Continue to next approach
      }

      // Then try to get contraindications from the NDF-RT API
      try {
        const response = await axios.get(
          `${this.baseUrl}/rxclass/class/byRxcui`,
          {
            params: {
              rxcui: rxcui,
              relaSource: 'NDFRT',
              rela: 'CI_with', // CI = Contraindicated with
            },
          }
        );

        if (
          response.data &&
          response.data.rxclassDrugInfoList &&
          response.data.rxclassDrugInfoList.rxclassDrugInfo
        ) {
          return response.data.rxclassDrugInfoList.rxclassDrugInfo;
        }
      } catch (apiError) {
        logger.warn(
          `Error getting contraindications from NDF-RT API: ${
            (apiError as Error).message || 'Unknown error'
          }`
        );
        // Continue to fallback
      }

      // If in development mode and no contraindications found, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'No contraindications found, creating mock data for testing'
        );
        return [
          {
            name: 'CONTRAINDICATIONS',
            value:
              'Hypersensitivity to the active substance or to any of the excipients. Severe hepatic impairment.',
          },
          {
            name: 'WARNINGS',
            value:
              'Not recommended for use during pregnancy. Should be used with caution in patients with renal impairment.',
          },
        ];
      }

      return [];
    } catch (error: any) {
      logger.error(
        `Error fetching medication contraindications from RxNav: ${error.message}`
      );

      // If in development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'Error fetching contraindications, creating mock data for testing'
        );
        return [
          {
            name: 'CONTRAINDICATIONS',
            value:
              'Hypersensitivity to the active substance or to any of the excipients. Severe hepatic impairment.',
          },
          {
            name: 'WARNINGS',
            value:
              'Not recommended for use during pregnancy. Should be used with caution in patients with renal impairment.',
          },
        ];
      }

      throw new AppError(
        `Failed to fetch medication contraindications from RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication dosage information by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Dosage information
   */
  async getMedicationDosage(rxcui: string): Promise<any[]> {
    try {
      // Get dosage information from properties
      try {
        const properties = await this.getMedicationProperties(rxcui);
        if (properties && properties.length > 0) {
          const dosageProps = properties.filter(
            (prop: any) =>
              prop.name &&
              typeof prop.name === 'string' &&
              (prop.name.toLowerCase().includes('dosage') ||
                prop.name.toLowerCase().includes('dose') ||
                prop.name.toLowerCase().includes('administration'))
          );

          if (dosageProps.length > 0) {
            return dosageProps.map((prop: any) => ({
              name: prop.name,
              value: prop.value,
            }));
          }
        }
      } catch (propError) {
        logger.warn(
          `Error getting dosage from properties: ${
            (propError as Error).message || 'Unknown error'
          }`
        );
        // Continue to fallback
      }

      // If in development mode and no dosage info found, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          'No dosage information found, creating mock data for testing'
        );
        return [
          {
            name: 'DOSAGE AND ADMINISTRATION',
            value:
              'Adults: 10 mg once daily. May increase to 20 mg if needed. Elderly: Start with 5 mg once daily.',
          },
          {
            name: 'DOSE ADJUSTMENTS',
            value:
              'Reduce dose in patients with renal impairment. No dose adjustment needed for mild to moderate hepatic impairment.',
          },
        ];
      }

      return [];
    } catch (error: any) {
      logger.error(
        `Error fetching medication dosage from RxNav: ${error.message}`
      );

      // If in development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Error fetching dosage, creating mock data for testing');
        return [
          {
            name: 'DOSAGE AND ADMINISTRATION',
            value:
              'Adults: 10 mg once daily. May increase to 20 mg if needed. Elderly: Start with 5 mg once daily.',
          },
          {
            name: 'DOSE ADJUSTMENTS',
            value:
              'Reduce dose in patients with renal impairment. No dose adjustment needed for mild to moderate hepatic impairment.',
          },
        ];
      }

      throw new AppError(
        `Failed to fetch medication dosage from RxNav: ${error.message}`,
        500
      );
    }
  }
}

export default new RxNavService();
