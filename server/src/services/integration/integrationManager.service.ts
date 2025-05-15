import ehrIntegrationService from './ehrIntegration.service';
import pharmacySystemIntegrationService from './pharmacySystemIntegration.service';
import drugDatabaseIntegrationService from './drugDatabaseIntegration.service';
import { logger } from '../../utils/logger.utils';

/**
 * Service for managing all external system integrations
 */
class IntegrationManagerService {
  /**
   * Get status of all integrations
   * @returns Status of all integrations
   */
  getIntegrationStatus(): any {
    return {
      ehr: {
        enabled: ehrIntegrationService.isIntegrationEnabled(),
      },
      pharmacySystem: {
        enabled: pharmacySystemIntegrationService.isIntegrationEnabled(),
      },
      drugDatabase: {
        enabled: drugDatabaseIntegrationService.isIntegrationEnabled(),
      },
    };
  }

  /**
   * Import patient from EHR and sync related data
   * @param ehrPatientId External EHR patient ID
   * @returns Imported patient with related data
   */
  async importPatientWithRelatedData(ehrPatientId: string): Promise<any> {
    try {
      // Import patient from EHR
      const patient = await ehrIntegrationService.importPatient(ehrPatientId);

      // If drug database integration is enabled, try to import medications
      if (drugDatabaseIntegrationService.isIntegrationEnabled()) {
        try {
          // Get patient medications from EHR
          const ehrMedications =
            await ehrIntegrationService.getPatientMedications(ehrPatientId);

          // Import each medication from drug database
          const medications = [];
          for (const ehrMed of ehrMedications) {
            if (ehrMed.externalId) {
              try {
                const medication =
                  await drugDatabaseIntegrationService.importMedication(
                    ehrMed.externalId
                  );
                medications.push(medication);
              } catch (error) {
                logger.error(
                  `Failed to import medication ${ehrMed.externalId}: ${error}`
                );
              }
            }
          }

          return {
            patient,
            medications,
          };
        } catch (error) {
          logger.error(
            `Failed to import medications for patient ${ehrPatientId}: ${error}`
          );
          return { patient };
        }
      }

      return { patient };
    } catch (error) {
      logger.error(`Failed to import patient with related data: ${error}`);
      throw error;
    }
  }

  /**
   * Check for drug interactions in a prescription
   * @param prescriptionData Prescription data
   * @returns Prescription data with interaction warnings
   */
  async checkPrescriptionInteractions(prescriptionData: any): Promise<any> {
    try {
      if (!drugDatabaseIntegrationService.isIntegrationEnabled()) {
        return prescriptionData;
      }

      // Extract medication IDs from prescription
      const medicationIds = prescriptionData.medications
        .map((med: any) => med.medication?.externalId)
        .filter((id: string) => id);

      if (medicationIds.length === 0) {
        return prescriptionData;
      }

      // Check for interactions
      const interactions =
        await drugDatabaseIntegrationService.checkDrugInteractions(
          medicationIds
        );

      // Add interaction warnings to prescription
      return {
        ...prescriptionData,
        interactionWarnings: interactions,
      };
    } catch (error) {
      logger.error(`Failed to check prescription interactions: ${error}`);
      return prescriptionData;
    }
  }

  /**
   * Send prescription to pharmacy system and update local record
   * @param prescriptionData Prescription data
   * @returns Updated prescription data
   */
  async sendPrescriptionToPharmacy(prescriptionData: any): Promise<any> {
    try {
      if (!pharmacySystemIntegrationService.isIntegrationEnabled()) {
        return prescriptionData;
      }

      // Send prescription to pharmacy system
      const result = await pharmacySystemIntegrationService.sendPrescription(
        prescriptionData
      );

      // Update prescription with external reference
      return {
        ...prescriptionData,
        externalReference: result.referenceId,
        sentToPharmacy: true,
        pharmacyStatus: result.status,
      };
    } catch (error: any) {
      logger.error(`Failed to send prescription to pharmacy: ${error}`);
      return {
        ...prescriptionData,
        sentToPharmacy: false,
        pharmacyError: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Sync inventory with pharmacy system
   * @returns Synced inventory items
   */
  async syncInventory(): Promise<any[]> {
    try {
      if (!pharmacySystemIntegrationService.isIntegrationEnabled()) {
        return [];
      }

      return await pharmacySystemIntegrationService.syncInventory();
    } catch (error: any) {
      logger.error(`Failed to sync inventory: ${error}`);
      throw error;
    }
  }

  /**
   * Get medication details with additional information from drug database
   * @param medicationId Local medication ID
   * @param externalMedicationId External medication ID
   * @returns Medication details with additional information
   */
  async getMedicationWithAdditionalInfo(
    medicationId: string,
    externalMedicationId: string
  ): Promise<any> {
    try {
      if (!drugDatabaseIntegrationService.isIntegrationEnabled()) {
        return null;
      }

      // Update medication from drug database
      const medication =
        await drugDatabaseIntegrationService.updateMedicationFromDrugDatabase(
          medicationId,
          externalMedicationId
        );

      // Get additional information
      const [contraindications, sideEffects] = await Promise.all([
        drugDatabaseIntegrationService.getMedicationContraindications(
          externalMedicationId
        ),
        drugDatabaseIntegrationService.getMedicationSideEffects(
          externalMedicationId
        ),
      ]);

      return {
        ...medication.toObject(),
        contraindications,
        sideEffects,
      };
    } catch (error: any) {
      logger.error(`Failed to get medication with additional info: ${error}`);
      throw error;
    }
  }
}

export default new IntegrationManagerService();
