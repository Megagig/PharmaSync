import axios from 'axios';
import { AppError } from '../../utils/error';
import Patient from '../../models/patient.model';
import { logger } from '../../utils/logger.utils';
import config from '../../config/config';

/**
 * Service for integrating with external Electronic Health Record (EHR) systems
 */
class EHRIntegrationService {
  private baseUrl: string;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    // Load configuration from environment variables
    this.baseUrl =
      config.integrations.ehr.baseUrl || 'https://api.ehrsystem.example.com';
    this.apiKey = config.integrations.ehr.apiKey || '';
    this.isEnabled = config.integrations.ehr.enabled === 'true';
  }

  /**
   * Check if EHR integration is enabled
   */
  isIntegrationEnabled(): boolean {
    return this.isEnabled && !!this.apiKey;
  }

  /**
   * Get patient data from EHR system by patient ID
   * @param ehrPatientId External EHR patient ID
   * @returns Patient data from EHR
   */
  async getPatientById(ehrPatientId: string): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('EHR integration is not enabled', 400);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/patients/${ehrPatientId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error(`Error fetching patient from EHR: ${error.message}`);
      throw new AppError(
        `Failed to fetch patient from EHR: ${error.message}`,
        500
      );
    }
  }

  /**
   * Search for patients in EHR system
   * @param query Search query (name, ID, etc.)
   * @returns List of matching patients
   */
  async searchPatients(query: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('EHR integration is not enabled', 400);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/patients/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.results || [];
    } catch (error: any) {
      logger.error(`Error searching patients in EHR: ${error.message}`);
      throw new AppError(
        `Failed to search patients in EHR: ${error.message}`,
        500
      );
    }
  }

  /**
   * Import patient from EHR system into local database
   * @param ehrPatientId External EHR patient ID
   * @returns Imported patient
   */
  async importPatient(ehrPatientId: string): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('EHR integration is not enabled', 400);
    }

    try {
      // Check if patient already exists
      const existingPatient = await Patient.findOne({ ehrPatientId });
      if (existingPatient) {
        return this.updatePatientFromEHR(
          existingPatient._id.toString(),
          ehrPatientId
        );
      }

      // Fetch patient data from EHR
      const ehrPatient = await this.getPatientById(ehrPatientId);

      // Map EHR patient data to our patient model
      const patientData = this.mapEHRPatientToLocalPatient(ehrPatient);

      // Create new patient
      const patient = await Patient.create(patientData);
      return patient;
    } catch (error: any) {
      logger.error(`Error importing patient from EHR: ${error.message}`);
      throw new AppError(
        `Failed to import patient from EHR: ${error.message}`,
        500
      );
    }
  }

  /**
   * Update existing patient with data from EHR
   * @param patientId Local patient ID
   * @param ehrPatientId External EHR patient ID
   * @returns Updated patient
   */
  async updatePatientFromEHR(
    patientId: string,
    ehrPatientId: string
  ): Promise<any> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('EHR integration is not enabled', 400);
    }

    try {
      // Fetch patient data from EHR
      const ehrPatient = await this.getPatientById(ehrPatientId);

      // Map EHR patient data to our patient model
      const patientData = this.mapEHRPatientToLocalPatient(ehrPatient);

      // Update patient
      const patient = await Patient.findByIdAndUpdate(patientId, patientData, {
        new: true,
        runValidators: true,
      });

      if (!patient) {
        throw new AppError('Patient not found', 404);
      }

      return patient;
    } catch (error: any) {
      logger.error(`Error updating patient from EHR: ${error.message}`);
      throw new AppError(
        `Failed to update patient from EHR: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get patient medications from EHR
   * @param ehrPatientId External EHR patient ID
   * @returns List of medications
   */
  async getPatientMedications(ehrPatientId: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('EHR integration is not enabled', 400);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/patients/${ehrPatientId}/medications`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.medications || [];
    } catch (error: any) {
      logger.error(
        `Error fetching patient medications from EHR: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch patient medications from EHR: ${error.message}`,
        500
      );
    }
  }

  /**
   * Get patient allergies from EHR
   * @param ehrPatientId External EHR patient ID
   * @returns List of allergies
   */
  async getPatientAllergies(ehrPatientId: string): Promise<any[]> {
    if (!this.isIntegrationEnabled()) {
      throw new AppError('EHR integration is not enabled', 400);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/patients/${ehrPatientId}/allergies`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.allergies || [];
    } catch (error: any) {
      logger.error(
        `Error fetching patient allergies from EHR: ${error.message}`
      );
      throw new AppError(
        `Failed to fetch patient allergies from EHR: ${error.message}`,
        500
      );
    }
  }

  /**
   * Map EHR patient data to local patient model
   * @param ehrPatient Patient data from EHR
   * @returns Mapped patient data for local database
   */
  private mapEHRPatientToLocalPatient(ehrPatient: any): any {
    return {
      ehrPatientId: ehrPatient.id,
      firstName: ehrPatient.firstName || ehrPatient.first_name,
      lastName: ehrPatient.lastName || ehrPatient.last_name,
      dateOfBirth: ehrPatient.dateOfBirth || ehrPatient.date_of_birth,
      gender: ehrPatient.gender?.toLowerCase(),
      email: ehrPatient.email,
      phone: ehrPatient.phone,
      address: {
        street: ehrPatient.address?.street,
        city: ehrPatient.address?.city,
        state: ehrPatient.address?.state,
        zipCode: ehrPatient.address?.zipCode || ehrPatient.address?.zip_code,
        country: ehrPatient.address?.country || 'Nigeria',
      },
      bloodGroup: ehrPatient.bloodGroup || ehrPatient.blood_group,
      genotype: ehrPatient.genotype,
      allergies: ehrPatient.allergies?.map((allergy: any) => ({
        name: allergy.name,
        reaction: allergy.reaction,
        severity: allergy.severity,
      })),
      medicalConditions: ehrPatient.conditions?.map((condition: any) => ({
        name: condition.name,
        diagnosisDate: condition.diagnosisDate || condition.diagnosis_date,
        status: condition.status,
      })),
      ehrLastSyncedAt: new Date(),
    };
  }
}

export default new EHRIntegrationService();
