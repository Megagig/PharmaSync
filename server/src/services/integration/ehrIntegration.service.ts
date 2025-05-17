import axios from 'axios';
import {
  IPatient,
  Gender,
  IAllergy,
  IMedicalCondition,
} from '../../interfaces/patient.interface';
import { IMedication } from '../../interfaces/medication.interface';
import {
  IPrescription,
  IPrescriptionItem,
  PrescriptionStatus,
  IDosageInstructions,
} from '../../interfaces/prescription.interface';
import env from '../../config/env.config';
import logger from '../../utils/logger';

interface EHRPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  allergies?: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
    status: 'active' | 'inactive';
    dateIdentified: string;
    notes?: string;
  }>;
  conditions?: Array<{
    condition: string;
    status: 'active' | 'inactive' | 'resolved';
    diagnosisDate: string;
    notes?: string;
  }>;
}

interface EHRMedication {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  ndc?: string;
  rxnorm?: string;
}

interface EHRPrescriptionItem {
  medicationId: string;
  dosage: string;
  quantity: number;
  refills: number;
  dosageInstructions: IDosageInstructions;
  notes?: string;
}

interface EHRPrescription {
  id: string;
  patientId: string;
  providerId: string;
  items: EHRPrescriptionItem[];
  status: PrescriptionStatus;
  issuedDate: string;
  validUntil: string;
  notes?: string;
}

/**
 * Service for integrating with external Electronic Health Record (EHR) systems
 */
export class EHRIntegrationService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private isConnectedFlag: boolean = false;
  private lastSyncTime: Date | null = null;

  constructor() {
    this.baseUrl = env.EHR_API_URL;
    this.apiKey = env.EHR_API_KEY;
  }

  async connect(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      this.isConnectedFlag = response.status === 200;
      return this.isConnectedFlag;
    } catch (error) {
      logger.error('Failed to connect to EHR system:', error);
      this.isConnectedFlag = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  isIntegrationEnabled(): boolean {
    return this.isConnectedFlag;
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  getProviderName(): string {
    return 'Generic EHR System';
  }

  async searchPatients(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/patients/search`, {
        params: { query },
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      return response.data.map(this.mapEHRPatientToLocalPatient);
    } catch (error) {
      logger.error('Failed to search patients in EHR:', error);
      return [];
    }
  }

  async importPatient(ehrPatientId: string): Promise<Partial<IPatient>> {
    try {
      const response = await axios.get<EHRPatient>(
        `${this.baseUrl}/patients/${ehrPatientId}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );

      return this.mapEHRPatientToLocalPatient(response.data);
    } catch (error) {
      logger.error('Failed to import patient from EHR:', error);
      throw error;
    }
  }

  async getPatientMedications(
    ehrPatientId: string
  ): Promise<Partial<IMedication>[]> {
    try {
      const response = await axios.get<EHRMedication[]>(
        `${this.baseUrl}/patients/${ehrPatientId}/medications`,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );

      return response.data.map(this.mapEHRMedicationToLocalMedication);
    } catch (error) {
      logger.error('Failed to get patient medications from EHR:', error);
      throw error;
    }
  }

  async sendPrescription(prescription: IPrescription): Promise<boolean> {
    try {
      const ehrPrescription = this.mapLocalPrescriptionToEHR(prescription);
      await axios.post(`${this.baseUrl}/prescriptions`, ehrPrescription, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });
      return true;
    } catch (error) {
      logger.error('Failed to send prescription to EHR:', error);
      return false;
    }
  }

  private mapEHRPatientToLocalPatient(
    ehrPatient: EHRPatient
  ): Partial<IPatient> {
    const mappedGender = (): Gender => {
      switch (ehrPatient.gender.toLowerCase()) {
        case 'male':
          return Gender.MALE;
        case 'female':
          return Gender.FEMALE;
        default:
          return Gender.OTHER;
      }
    };

    const mappedAddress = ehrPatient.address
      ? `${ehrPatient.address.street}, ${ehrPatient.address.city}, ${ehrPatient.address.state} ${ehrPatient.address.postalCode}, ${ehrPatient.address.country}`
      : '';

    const mappedAllergies: IAllergy[] =
      ehrPatient.allergies?.map((allergy) => ({
        allergen: allergy.allergen,
        reaction: allergy.reaction,
        severity: allergy.severity,
        status: allergy.status,
        dateIdentified: new Date(allergy.dateIdentified),
        notes: allergy.notes,
      })) || [];

    const mappedConditions: IMedicalCondition[] =
      ehrPatient.conditions?.map((condition) => ({
        condition: condition.condition,
        status: condition.status,
        diagnosisDate: new Date(condition.diagnosisDate),
        notes: condition.notes,
      })) || [];

    return {
      firstName: ehrPatient.firstName,
      lastName: ehrPatient.lastName,
      dateOfBirth: new Date(ehrPatient.dateOfBirth),
      gender: mappedGender(),
      email: ehrPatient.email,
      phoneNumber: ehrPatient.phone || '',
      address: mappedAddress,
      allergies: mappedAllergies,
      medicalConditions: mappedConditions,
    };
  }

  private mapEHRMedicationToLocalMedication(
    ehrMedication: EHRMedication
  ): Partial<IMedication> & { [key: string]: any } {
    // Return medication data with additional properties
    return {
      name: ehrMedication.name,
      genericName: ehrMedication.genericName || ehrMedication.name,
      brandName: ehrMedication.brandName,
      dosageForm: ehrMedication.dosageForm,
      strength: ehrMedication.strength,
      manufacturer: ehrMedication.manufacturer,
      // Add custom properties that will be accessible via type casting
      _externalId:
        ehrMedication.rxnorm || ehrMedication.ndc || ehrMedication.id,
      _rxnorm: ehrMedication.rxnorm,
      _ndc: ehrMedication.ndc,
    };
  }

  private mapLocalPrescriptionToEHR(
    prescription: IPrescription
  ): EHRPrescription {
    return {
      id: prescription._id.toString(),
      patientId: prescription.patient.toString(),
      providerId: prescription.prescriber.toString(),
      items: prescription.items.map((item) => ({
        medicationId: item.medication.toString(),
        dosage: item.dosage,
        quantity: item.quantity,
        refills: item.refills,
        dosageInstructions: item.dosageInstructions,
        notes: item.notes,
      })),
      status: prescription.status,
      issuedDate: prescription.issuedDate.toISOString(),
      validUntil: prescription.validUntil.toISOString(),
      notes: prescription.notes,
    };
  }
}
