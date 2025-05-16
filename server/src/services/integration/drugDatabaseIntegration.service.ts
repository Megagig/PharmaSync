import { AppError } from '../../utils/error';
import Medication from '../../models/medication.model';
import { logger } from '../../utils/logger.utils';
import config from '../../config/config';
import rxnavService from './rxnav.service';
import axios from 'axios';
import {
  MedicationCategory,
  MedicationType,
} from '../../interfaces/medication.interface';

/**
 * Service for integrating with external Drug Information Databases
 * Now using RxNav API for medication data
 */
class DrugDatabaseIntegrationService {
  private isEnabled: boolean;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Load configuration from environment variables
    // RxNav doesn't require an API key, so we just need to check if it's enabled
    this.isEnabled = config.integrations.drugDatabase.enabled === 'true';
    this.baseUrl = 'https://rxnav.nlm.nih.gov/REST';
    this.apiKey = ''; // RxNav doesn't require an API key, but we'll keep this for future use
  }

  /**
   * Check if drug database integration is enabled
   */
  isIntegrationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Search for medications in RxNav database
   * @param query Search query (name, NDC, etc.)
   * @returns List of matching medications
   */
  async searchMedications(query: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      // Use RxNav service to search for medications
      const medications = await rxnavService.searchMedicationsByName(query);

      // Transform the results to match our expected format
      return medications.map((med) => ({
        id: med.rxcui,
        name: med.name,
        type: med.tty,
        externalId: med.rxcui,
      }));
    } catch (error: any) {
      logger.error(`Error searching medications in RxNav: ${error.message}`);
      throw new AppError(
        `Failed to search medications in RxNav: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get medication details from RxNav
   * @param rxcui RxCUI identifier
   * @returns Medication details
   */
  async getMedicationDetails(rxcui: string): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      // Get basic medication info
      const medicationInfo = await rxnavService.getMedicationByRxcui(rxcui);

      // Get medication properties
      const properties = await rxnavService.getMedicationProperties(rxcui);

      // Get drug class information
      const drugClass = await rxnavService.getDrugClass(rxcui);

      // Get strength information
      const strengthInfo = await rxnavService.getDrugStrength(rxcui);

      // Get NDCs
      const ndcs = await rxnavService.getMedicationNDCs(rxcui);

      // Get side effects
      const sideEffects = await rxnavService.getMedicationSideEffects(rxcui);

      // Get contraindications
      const contraindications =
        await rxnavService.getMedicationContraindications(rxcui);

      // Get dosage information
      const dosage = await rxnavService.getMedicationDosage(rxcui);

      // Combine all the information
      return {
        id: rxcui,
        name: medicationInfo.name,
        rxcui: rxcui,
        properties: properties,
        drugClass: drugClass,
        strength: strengthInfo,
        ndcs: ndcs,
        sideEffects: sideEffects,
        contraindications: contraindications,
        dosage: dosage,
      };
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
      const existingMedication = await Medication.findOne({
        externalId: medicationId,
      });
      if (existingMedication) {
        return this.updateMedicationFromDrugDatabase(
          existingMedication._id.toString(),
          medicationId
        );
      }

      // Fetch medication data from drug database
      const drugDbMedication = await this.getMedicationDetails(medicationId);

      // Map drug database medication data to our medication model
      const medicationData =
        this.mapDrugDbMedicationToLocalMedication(drugDbMedication);

      // Create new medication
      const medication = await Medication.create(medicationData);
      return medication;
    } catch (error: any) {
      logger.error(
        `Error importing medication from drug database: ${error.message}`
      );
      throw new AppError(
        `Failed to import medication from drug database: ${error.message}`,
        500
      );
    }
  }

  /**
   * Update existing medication with data from drug database
   * @param medicationId Local medication ID
   * @param externalMedicationId External medication ID
   * @returns Updated medication
   */
  async updateMedicationFromDrugDatabase(
    medicationId: string,
    externalMedicationId: string
  ): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      // Fetch medication data from drug database
      const drugDbMedication = await this.getMedicationDetails(
        externalMedicationId
      );

      // Map drug database medication data to our medication model
      const medicationData =
        this.mapDrugDbMedicationToLocalMedication(drugDbMedication);

      // Update medication
      const medication = await Medication.findByIdAndUpdate(
        medicationId,
        medicationData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!medication) {
        throw new AppError('Medication not found', 404);
      }

      return medication;
    } catch (error: any) {
      logger.error(
        `Error updating medication from drug database: ${error.message}`
      );
      throw new AppError(
        `Failed to update medication from drug database: ${error.message}`,
        500
      );
    }
  }

  /**
   * Check for drug interactions using RxNav
   * @param rxcuis List of RxCUI identifiers to check for interactions
   * @returns List of potential interactions
   */
  async checkDrugInteractions(rxcuis: string[]): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Drug database integration is not enabled', 400);
    }

    try {
      // Use RxNav service to check for drug interactions
      const interactions = await rxnavService.getDrugInteractions(rxcuis);

      // Transform the interactions to a more usable format
      return interactions.map((interaction) => {
        const interactionPair = interaction.interactionPair[0];
        return {
          drug1: {
            rxcui: interactionPair.interactionConcept[0].minConceptItem.rxcui,
            name: interactionPair.interactionConcept[0].minConceptItem.name,
          },
          drug2: {
            rxcui: interactionPair.interactionConcept[1].minConceptItem.rxcui,
            name: interactionPair.interactionConcept[1].minConceptItem.name,
          },
          description: interactionPair.description,
          severity: this.mapInteractionSeverity(interactionPair.severity),
        };
      });
    } catch (error: any) {
      logger.error(`Error checking drug interactions: ${error.message}`);
      throw new AppError(
        `Failed to check drug interactions: ${error.message}`,
        500
      );
    }
  }

  /**
   * Map RxNav interaction severity to our system's severity levels
   * @param rxnavSeverity RxNav severity string
   * @returns Mapped severity level
   */
  private mapInteractionSeverity(
    rxnavSeverity: string
  ): 'minor' | 'moderate' | 'major' | 'contraindicated' {
    // RxNav uses different severity levels, so we need to map them
    switch (rxnavSeverity?.toLowerCase()) {
      case 'high':
        return 'major';
      case 'n/a':
      case 'low':
        return 'minor';
      case 'medium':
        return 'moderate';
      default:
        return 'moderate';
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
      // Use rxnavService to get contraindications
      return await rxnavService.getMedicationContraindications(medicationId);
    } catch (error: any) {
      logger.error(
        `Error fetching medication contraindications: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch medication contraindications: ${error.message}`,
        500
      );
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
      // Use rxnavService to get side effects
      return await rxnavService.getMedicationSideEffects(medicationId);
    } catch (error: any) {
      logger.error(`Error fetching medication side effects: ${error.message}`);
      throw new AppError(
        `Failed to fetch medication side effects: ${error.message}`,
        500
      );
    }
  }

  /**
   * Map RxNav medication data to local medication model
   * @param rxnavMedication Medication data from RxNav
   * @returns Mapped medication data for local database
   */
  private mapDrugDbMedicationToLocalMedication(rxnavMedication: any): any {
    // Extract medication name
    const name = rxnavMedication.name || '';

    // Try to determine generic name and brand name
    let genericName = name;
    let brandName = '';

    // Extract dosage form and strength from properties
    let dosageForm = '';
    let strength = '';

    // Extract drug class for category
    let category = MedicationCategory.OTHER;

    // Extract description
    let description = '';

    // Extract contraindications, side effects, and interactions
    let contraindications: any[] = [];
    let sideEffects: any[] = [];
    const interactions: any[] = [];

    // Process contraindications if available
    if (
      rxnavMedication.contraindications &&
      Array.isArray(rxnavMedication.contraindications)
    ) {
      contraindications = rxnavMedication.contraindications.map(
        (item: any) => ({
          condition: item.name || 'Contraindication',
          description: item.value || '',
          severity: 'high',
        })
      );
    }

    // Process side effects if available
    if (
      rxnavMedication.sideEffects &&
      Array.isArray(rxnavMedication.sideEffects)
    ) {
      sideEffects = rxnavMedication.sideEffects.map((item: any) => ({
        effect: item.name || 'Side Effect',
        description: item.value || '',
        frequency: 'unknown',
      }));
    }

    // Process properties to extract relevant information
    if (
      rxnavMedication.properties &&
      Array.isArray(rxnavMedication.properties)
    ) {
      for (const prop of rxnavMedication.properties) {
        if (prop.name === 'RxNorm Dose Form' && prop.value) {
          dosageForm = prop.value;
        } else if (prop.name === 'Strength' && prop.value) {
          strength = prop.value;
        } else if (prop.name === 'Generic Name' && prop.value) {
          genericName = prop.value;
        } else if (prop.name === 'Brand Name' && prop.value) {
          brandName = prop.value;
        } else if (prop.name === 'Description' && prop.value) {
          description = prop.value;
        }
      }
    }

    // Process drug class information to determine category
    if (rxnavMedication.drugClass && Array.isArray(rxnavMedication.drugClass)) {
      for (const cls of rxnavMedication.drugClass) {
        if (cls.classType === 'ATC1-4' && cls.className) {
          // Map ATC class to our medication categories
          category = this.mapATCToCategory(cls.className);
          break;
        }
      }
    }

    // Determine medication type based on dosage form
    const type = this.determineMedicationType(dosageForm);

    return {
      name: name,
      genericName: genericName,
      brandName: brandName || undefined,
      externalId: rxnavMedication.rxcui,
      description: description || undefined,
      dosageForm: dosageForm || 'Unknown',
      strength: strength || 'Unknown',
      type: type,
      category: category,
      requiresPrescription: true, // Default to true for safety
      standardDosage: {
        amount: 1,
        unit: 'dose',
        frequency: 'as directed',
        route: this.determineRoute(dosageForm),
        instructions: 'Take as directed by your healthcare provider.',
      },
      contraindications: contraindications,
      sideEffects: sideEffects,
      interactions: interactions,
      minimumStockLevel: 10, // Default value
      lastSyncedAt: new Date(),
    };
  }

  /**
   * Map ATC class to our medication category
   * @param atcClass ATC class name
   * @returns Mapped category
   */
  private mapATCToCategory(atcClass: string): MedicationCategory {
    const lowerClass = atcClass.toLowerCase();

    if (lowerClass.includes('analgesic') || lowerClass.includes('pain')) {
      return MedicationCategory.ANALGESIC;
    } else if (
      lowerClass.includes('antibiotic') ||
      lowerClass.includes('anti-bacterial')
    ) {
      return MedicationCategory.ANTIBIOTIC;
    } else if (
      lowerClass.includes('antihistamine') ||
      lowerClass.includes('anti-allergic')
    ) {
      return MedicationCategory.ANTIHISTAMINE;
    } else if (
      lowerClass.includes('antihypertensive') ||
      lowerClass.includes('blood pressure')
    ) {
      return MedicationCategory.ANTIHYPERTENSIVE;
    } else if (
      lowerClass.includes('antidiabetic') ||
      lowerClass.includes('diabetes')
    ) {
      return MedicationCategory.ANTIDIABETIC;
    } else if (
      lowerClass.includes('antidepressant') ||
      lowerClass.includes('depression')
    ) {
      return MedicationCategory.ANTIDEPRESSANT;
    } else if (
      lowerClass.includes('antipsychotic') ||
      lowerClass.includes('psychotic')
    ) {
      return MedicationCategory.ANTIPSYCHOTIC;
    } else if (
      lowerClass.includes('anticonvulsant') ||
      lowerClass.includes('epilepsy')
    ) {
      return MedicationCategory.ANTICONVULSANT;
    } else if (
      lowerClass.includes('antiviral') ||
      lowerClass.includes('virus')
    ) {
      return MedicationCategory.ANTIVIRAL;
    } else if (
      lowerClass.includes('antimalarial') ||
      lowerClass.includes('malaria')
    ) {
      return MedicationCategory.ANTIMALARIAL;
    } else if (
      lowerClass.includes('nsaid') ||
      lowerClass.includes('anti-inflammatory')
    ) {
      return MedicationCategory.NSAID;
    } else if (
      lowerClass.includes('steroid') ||
      lowerClass.includes('corticosteroid')
    ) {
      return MedicationCategory.STEROID;
    } else if (lowerClass.includes('vitamin')) {
      return MedicationCategory.VITAMIN;
    } else if (lowerClass.includes('supplement')) {
      return MedicationCategory.SUPPLEMENT;
    } else {
      return MedicationCategory.OTHER;
    }
  }

  /**
   * Determine medication type based on dosage form
   * @param dosageForm Dosage form
   * @returns Medication type
   */
  private determineMedicationType(dosageForm: string): MedicationType {
    const lowerForm = dosageForm.toLowerCase();

    if (lowerForm.includes('tablet')) {
      return MedicationType.TABLET;
    } else if (lowerForm.includes('capsule')) {
      return MedicationType.CAPSULE;
    } else if (
      lowerForm.includes('liquid') ||
      lowerForm.includes('solution') ||
      lowerForm.includes('syrup')
    ) {
      return MedicationType.LIQUID;
    } else if (
      lowerForm.includes('injection') ||
      lowerForm.includes('injectable')
    ) {
      return MedicationType.INJECTION;
    } else if (
      lowerForm.includes('cream') ||
      lowerForm.includes('ointment') ||
      lowerForm.includes('gel')
    ) {
      return MedicationType.TOPICAL;
    } else if (
      lowerForm.includes('inhaler') ||
      lowerForm.includes('inhalation')
    ) {
      return MedicationType.INHALER;
    } else if (lowerForm.includes('drop')) {
      return MedicationType.DROPS;
    } else if (lowerForm.includes('suppository')) {
      return MedicationType.SUPPOSITORY;
    } else if (lowerForm.includes('patch')) {
      return MedicationType.PATCH;
    } else {
      return MedicationType.OTHER;
    }
  }

  /**
   * Determine administration route based on dosage form
   * @param dosageForm Dosage form
   * @returns Administration route
   */
  private determineRoute(dosageForm: string): string {
    const lowerForm = dosageForm.toLowerCase();

    if (lowerForm.includes('tablet') || lowerForm.includes('capsule')) {
      return 'oral';
    } else if (lowerForm.includes('injection')) {
      return 'injection';
    } else if (
      lowerForm.includes('cream') ||
      lowerForm.includes('ointment') ||
      lowerForm.includes('gel')
    ) {
      return 'topical';
    } else if (
      lowerForm.includes('inhaler') ||
      lowerForm.includes('inhalation')
    ) {
      return 'inhalation';
    } else if (lowerForm.includes('drop') && lowerForm.includes('eye')) {
      return 'ophthalmic';
    } else if (lowerForm.includes('drop') && lowerForm.includes('ear')) {
      return 'otic';
    } else if (lowerForm.includes('suppository')) {
      return 'rectal';
    } else if (lowerForm.includes('patch')) {
      return 'transdermal';
    } else {
      return 'oral';
    }
  }
}

export default new DrugDatabaseIntegrationService();
