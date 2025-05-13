export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export interface Allergy {
  _id?: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  dateIdentified: string;
}

export interface MedicalCondition {
  _id?: string;
  condition: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'in_remission';
  notes?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  bloodGroup?: BloodGroup;
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  medications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  bloodGroup?: BloodGroup;
  notes?: string;
}

export interface AllergyFormData {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  dateIdentified: string;
}

export interface MedicalConditionFormData {
  condition: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'in_remission';
  notes?: string;
}

export interface PatientsState {
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  totalPatients: number;
  totalPages: number;
  currentPage: number;
}
