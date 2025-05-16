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

      if (response.data && response.data.drugGroup && response.data.drugGroup.conceptGroup) {
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
      throw new AppError(`Failed to search medications in RxNav: ${error.message}`, 500);
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
      logger.error(`Error fetching medication details from RxNav: ${error.message}`);
      throw new AppError(`Failed to fetch medication details from RxNav: ${error.message}`, 500);
    }
  }

  /**
   * Get medication properties by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Medication properties
   */
  async getMedicationProperties(rxcui: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/rxcui/${rxcui}/allProperties`, {
        params: { prop: 'all' },
      });
      
      if (response.data && response.data.propConceptGroup && response.data.propConceptGroup.propConcept) {
        return response.data.propConceptGroup.propConcept;
      }
      
      return [];
    } catch (error: any) {
      logger.error(`Error fetching medication properties from RxNav: ${error.message}`);
      throw new AppError(`Failed to fetch medication properties from RxNav: ${error.message}`, 500);
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
      
      if (response.data && response.data.ndcGroup && response.data.ndcGroup.ndcList) {
        return response.data.ndcGroup.ndcList.ndc || [];
      }
      
      return [];
    } catch (error: any) {
      logger.error(`Error fetching medication NDCs from RxNav: ${error.message}`);
      throw new AppError(`Failed to fetch medication NDCs from RxNav: ${error.message}`, 500);
    }
  }

  /**
   * Get drug interactions for a list of RxCUIs
   * @param rxcuis List of RxCUI identifiers
   * @returns List of interactions
   */
  async getDrugInteractions(rxcuis: string[]): Promise<any[]> {
    try {
      const rxcuiList = rxcuis.join('+');
      const response = await axios.get(`${this.baseUrl}/interaction/list`, {
        params: { rxcuis: rxcuiList },
      });
      
      if (response.data && 
          response.data.fullInteractionTypeGroup && 
          response.data.fullInteractionTypeGroup.length > 0 && 
          response.data.fullInteractionTypeGroup[0].fullInteractionType) {
        
        return response.data.fullInteractionTypeGroup[0].fullInteractionType;
      }
      
      return [];
    } catch (error: any) {
      logger.error(`Error fetching drug interactions from RxNav: ${error.message}`);
      throw new AppError(`Failed to fetch drug interactions from RxNav: ${error.message}`, 500);
    }
  }

  /**
   * Get drug class information by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Drug class information
   */
  async getDrugClass(rxcui: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/rxclass/class/byRxcui`, {
        params: { rxcui: rxcui },
      });
      
      if (response.data && response.data.rxclassDrugInfoList && response.data.rxclassDrugInfoList.rxclassDrugInfo) {
        return response.data.rxclassDrugInfoList.rxclassDrugInfo;
      }
      
      return [];
    } catch (error: any) {
      logger.error(`Error fetching drug class from RxNav: ${error.message}`);
      throw new AppError(`Failed to fetch drug class from RxNav: ${error.message}`, 500);
    }
  }

  /**
   * Get drug strength information by RxCUI
   * @param rxcui RxCUI identifier
   * @returns Drug strength information
   */
  async getDrugStrength(rxcui: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/rxcui/${rxcui}/related`, {
        params: { tty: 'SCD+SBD' },
      });
      
      if (response.data && response.data.relatedGroup && response.data.relatedGroup.conceptGroup) {
        return response.data.relatedGroup.conceptGroup;
      }
      
      return [];
    } catch (error: any) {
      logger.error(`Error fetching drug strength from RxNav: ${error.message}`);
      throw new AppError(`Failed to fetch drug strength from RxNav: ${error.message}`, 500);
    }
  }
}

export default new RxNavService();
