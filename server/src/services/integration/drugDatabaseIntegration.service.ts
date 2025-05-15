import axios from 'axios';
import { AppError } from '../../utils/error.utils';
import Medication from '../../models/medication.model';
import { logger } from '../../utils/logger.utils';
import config from '../../config/config';

/**
 * Service for integrating with external Drug Information Databases
 */
class DrugDatabaseIntegrationService {
  private baseUrl: string;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    // Load configuration from environment variables
    this.baseUrl = config.integrations.drugDatabase.baseUrl || 'https://api.drugdatabase.example.com';
    this.apiKey = config.integrations.drugDatabase.apiKey || '';
    this.isEnabled = config.integrations.drugDatabase.enabled === 'true';
  }

  /**
   * Check if drug database integration is enabled
   */
  isIntegrationEnabled(): boolean {
    return this.isEnabled && !!this.apiKey;
  }

  /**
   * Search for medications in drug database
   * @param query Search query (name, NDC, etc.)
   * @returns List of matching medications
   */
  async searchMedications(query: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/medications/search`, {
        params: { query },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.results || [];
    } catch (error: any) {
      logger.error(`Error searching medications in drug database: ${error.message}`);
      throw new AppError(`Failed to search medications in drug database: ${error.message}`, 500);
    }
  }

  /**
   * Get medication details from drug database
   * @param medicationId External medication ID
   * @returns Medication details
   */
  async getMedicationDetails(medicationId: string): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/medications/${medicationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching medication details from drug database: ${error.message}`);
      throw new AppError(`Failed to fetch medication details from drug database: ${error.message}`, 500);
    }
  }

  /**
   * Import medication from drug database into local database
   * @param medicationId External medication ID
   * @returns Imported medication
   */
  async importMedication(medicationId: string): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      // Check if medication already exists
      const existingMedication = await Medication.findOne({ externalId: medicationId });
      if (existingMedication) {
        return this.updateMedicationFromDrugDatabase(existingMedication._id.toString(), medicationId);
      }

      // Fetch medication data from drug database
      const drugDbMedication = await this.getMedicationDetails(medicationId);

      // Map drug database medication data to our medication model
      const medicationData = this.mapDrugDbMedicationToLocalMedication(drugDbMedication);

      // Create new medication
      const medication = await Medication.create(medicationData);
      return medication;
    } catch (error: any) {
      logger.error(`Error importing medication from drug database: ${error.message}`);
      throw new AppError(`Failed to import medication from drug database: ${error.message}`, 500);
    }
  }

  /**
   * Update existing medication with data from drug database
   * @param medicationId Local medication ID
   * @param externalMedicationId External medication ID
   * @returns Updated medication
   */
  async updateMedicationFromDrugDatabase(medicationId: string, externalMedicationId: string): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      // Fetch medication data from drug database
      const drugDbMedication = await this.getMedicationDetails(externalMedicationId);

      // Map drug database medication data to our medication model
      const medicationData = this.mapDrugDbMedicationToLocalMedication(drugDbMedication);

      // Update medication
      const medication = await Medication.findByIdAndUpdate(medicationId, medicationData, {
        new: true,
        runValidators: true,
      });

      if (!medication) {
        throw new AppError('Medication not found', 404);
      }

      return medication;
    } catch (error: any) {
      logger.error(`Error updating medication from drug database: ${error.message}`);
      throw new AppError(`Failed to update medication from drug database: ${error.message}`, 500);
    }
  }

  /**
   * Check for drug interactions
   * @param medicationIds List of medication IDs to check for interactions
   * @returns List of potential interactions
   */
  async checkDrugInteractions(medicationIds: string[]): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/interactions/check`, {
        medications: medicationIds,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.interactions || [];
    } catch (error: any) {
      logger.error(`Error checking drug interactions: ${error.message}`);
      throw new AppError(`Failed to check drug interactions: ${error.message}`, 500);
    }
  }

  /**
   * Get medication contraindications
   * @param medicationId Medication ID
   * @returns List of contraindications
   */
  async getMedicationContraindications(medicationId: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/medications/${medicationId}/contraindications`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.contraindications || [];
    } catch (error: any) {
      logger.error(`Error fetching medication contraindications: ${error.message}`);
      throw new AppError(`Failed to fetch medication contraindications: ${error.message}`, 500);
    }
  }

  /**
   * Get medication side effects
   * @param medicationId Medication ID
   * @returns List of side effects
   */
  async getMedicationSideEffects(medicationId: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/medications/${medicationId}/side-effects`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.sideEffects || [];
    } catch (error: any) {
      logger.error(`Error fetching medication side effects: ${error.message}`);
      throw new AppError(`Failed to fetch medication side effects: ${error.message}`, 500);
    }
  }

  /**
   * Map drug database medication data to local medication model
   * @param drugDbMedication Medication data from drug database
   * @returns Mapped medication data for local database
   */
  private mapDrugDbMedicationToLocalMedication(drugDbMedication: any): any {
    return {
      name: drugDbMedication.name,
      externalId: drugDbMedication.id,
      description: drugDbMedication.description,
      dosageForm: drugDbMedication.dosageForm || drugDbMedication.dosage_form,
      strength: drugDbMedication.strength,
      manufacturer: drugDbMedication.manufacturer,
      category: drugDbMedication.category,
      activeIngredients: drugDbMedication.activeIngredients?.map((ingredient: any) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })) || [],
      contraindications: drugDbMedication.contraindications || [],
      sideEffects: drugDbMedication.sideEffects || [],
      interactions: drugDbMedication.interactions || [],
      lastSyncedAt: new Date(),
    };
  }
}

export default new DrugDatabaseIntegrationService();
