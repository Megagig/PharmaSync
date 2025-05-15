import axios from 'axios';
import { AppError } from '../../utils/error';
import Medication from '../../models/medication.model';
import Inventory from '../../models/inventory.model';
import { logger } from '../../utils/logger.utils';
import config from '../../config/config';

/**
 * Service for integrating with external Pharmacy Management Systems
 */
class PharmacySystemIntegrationService {
  private baseUrl: string;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    // Load configuration from environment variables
    this.baseUrl =
      config.integrations.pharmacySystem.baseUrl ||
      'https://api.pharmacysystem.example.com';
    this.apiKey = config.integrations.pharmacySystem.apiKey || '';
    this.isEnabled = config.integrations.pharmacySystem.enabled === 'true';
  }

  /**
   * Check if pharmacy system integration is enabled
   */
  isIntegrationEnabled(): boolean {
    return this.isEnabled && !!this.apiKey;
  }

  /**
   * Get medication inventory from pharmacy system
   * @returns Inventory data
   */
  async getInventory(): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Pharmacy system integration is not enabled', 400);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/inventory`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.items || [];
    } catch (error: any) {
      logger.error(
        `Error fetching inventory from pharmacy system: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch inventory from pharmacy system: ${error.message}`,
        500
      );
    }
  }

  /**
   * Sync inventory with pharmacy system
   * @returns Synced inventory items
   */
  async syncInventory(): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Pharmacy system integration is not enabled', 400);
    }

    try {
      // Fetch inventory from pharmacy system
      const externalInventory = await this.getInventory();

      // Process each inventory item
      const syncedItems = [];

      for (const item of externalInventory) {
        // Check if medication exists
        let medication = await Medication.findOne({
          $or: [
            { externalId: item.medicationId },
            { name: item.medicationName },
          ],
        });

        // If medication doesn't exist, create it
        if (!medication) {
          medication = await Medication.create({
            name: item.medicationName,
            externalId: item.medicationId,
            description: item.description,
            dosageForm: item.dosageForm,
            strength: item.strength,
            manufacturer: item.manufacturer,
            category: item.category,
            lastSyncedAt: new Date(),
          });
        }

        // Update or create inventory item
        const inventoryItem = await Inventory.findOneAndUpdate(
          { medication: medication._id },
          {
            medication: medication._id,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            unitPrice: item.unitPrice,
            reorderLevel: item.reorderLevel,
            location: item.location,
            lastSyncedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        syncedItems.push(inventoryItem);
      }

      return syncedItems;
    } catch (error: any) {
      logger.error(
        `Error syncing inventory with pharmacy system: ${error.message}`
      );
      throw new AppError(
        `Failed to sync inventory with pharmacy system: ${error.message}`,
        500
      );
    }
  }

  /**
   * Send prescription to pharmacy system
   * @param prescriptionData Prescription data
   * @returns Response from pharmacy system
   */
  async sendPrescription(prescriptionData: any): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Pharmacy system integration is not enabled', 400);
    }

    try {
      // Map local prescription data to pharmacy system format
      const mappedData = this.mapPrescriptionToExternalFormat(prescriptionData);

      // Send prescription to pharmacy system
      const response = await axios.post(
        `${this.baseUrl}/prescriptions`,
        mappedData,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error(
        `Error sending prescription to pharmacy system: ${error.message}`
      );
      throw new AppError(
        `Failed to send prescription to pharmacy system: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get dispensing records from pharmacy system
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   * @returns Dispensing records
   */
  async getDispensingRecords(startDate?: Date, endDate?: Date): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('Pharmacy system integration is not enabled', 400);
    }

    try {
      const params: any = {};

      if (startDate) {
        params.startDate = startDate.toISOString();
      }

      if (endDate) {
        params.endDate = endDate.toISOString();
      }

      const response = await axios.get(`${this.baseUrl}/dispensing`, {
        params,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.records || [];
    } catch (error: any) {
      logger.error(
        `Error fetching dispensing records from pharmacy system: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch dispensing records from pharmacy system: ${error.message}`,
        500
      );
    }
  }

  /**
   * Map local prescription data to pharmacy system format
   * @param prescriptionData Local prescription data
   * @returns Mapped prescription data for pharmacy system
   */
  private mapPrescriptionToExternalFormat(prescriptionData: any): any {
    return {
      id: prescriptionData._id.toString(),
      patientId:
        prescriptionData.patient?.ehrPatientId ||
        prescriptionData.patient?._id.toString(),
      patientName: `${prescriptionData.patient?.firstName} ${prescriptionData.patient?.lastName}`,
      prescribedBy: prescriptionData.prescribedBy?.name || 'Unknown',
      prescriptionDate: prescriptionData.prescriptionDate,
      medications: prescriptionData.medications.map((med: any) => ({
        medicationId:
          med.medication?.externalId || med.medication?._id.toString(),
        medicationName: med.medication?.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        route: med.route,
        instructions: med.instructions,
        quantity: med.quantity,
      })),
      notes: prescriptionData.notes,
    };
  }
}

export default new PharmacySystemIntegrationService();
