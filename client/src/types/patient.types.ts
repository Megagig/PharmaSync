export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

export enum Genotype {
  AA = 'AA',
  AS = 'AS',
  SS = 'SS',
  AC = 'AC',
  SC = 'SC',
  CC = 'CC',
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

export interface MedicationHistory {
  _id?: string;
  medication: string;
  purpose: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface ClinicalAssessment {
  _id?: string;
  date: string;
  bloodPressure: string;
  respiratoryRate: string;
  temperature: string;
  heartSounds: string;
  palor: boolean;
  dehydration: boolean;
  notes?: string;
}

export interface LaboratoryFinding {
  _id?: string;
  date: string;
  pcv?: string;
  mcms?: string;
  euCr?: string;
  fbc?: string;
  fbs?: string;
  hbA1c?: string;
  other?: Record<string, string>;
  notes?: string;
}

export enum DrugTherapyProblemType {
  UNNECESSARY_DRUG_THERAPY = 'unnecessary_drug_therapy',
  WRONG_DRUG = 'wrong_drug',
  DOSAGE_TOO_LOW = 'dosage_too_low',
  DOSAGE_TOO_HIGH = 'dosage_too_high',
  ADVERSE_DRUG_REACTION = 'adverse_drug_reaction',
  INAPPROPRIATE_ADHERENCE = 'inappropriate_adherence',
  NEEDS_ADDITIONAL_DRUG_THERAPY = 'needs_additional_drug_therapy',
}

export interface DrugTherapyProblem {
  _id?: string;
  date: string;
  type: DrugTherapyProblemType;
  description: string;
  resolution?: string;
  isResolved: boolean;
}

export interface CarePlan {
  _id?: string;
  date: string;
  goals: string[];
  objectives: string[];
  followUpDate: string;
  drugTherapyProblemResolved: boolean;
  needsReview: boolean;
  notes?: string;
}

export interface SoapNote {
  _id?: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age?: number;
  gender: Gender;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  bloodGroup?: BloodGroup;
  genotype?: Genotype;
  maritalStatus?: MaritalStatus;
  weight?: number;
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  medicationHistory: MedicationHistory[];
  clinicalAssessments: ClinicalAssessment[];
  laboratoryFindings: LaboratoryFinding[];
  drugTherapyProblems: DrugTherapyProblem[];
  carePlans: CarePlan[];
  soapNotes: SoapNote[];
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
  genotype?: Genotype;
  maritalStatus?: MaritalStatus;
  weight?: number;
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

export interface MedicationHistoryFormData {
  medication: string;
  purpose: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface ClinicalAssessmentFormData {
  date: string;
  bloodPressure: string;
  respiratoryRate: string;
  temperature: string;
  heartSounds: string;
  palor: boolean;
  dehydration: boolean;
  notes?: string;
}

export interface LaboratoryFindingFormData {
  date: string;
  pcv?: string;
  mcms?: string;
  euCr?: string;
  fbc?: string;
  fbs?: string;
  hbA1c?: string;
  other?: Record<string, string>;
  notes?: string;
}

export interface DrugTherapyProblemFormData {
  date: string;
  type: DrugTherapyProblemType;
  description: string;
  resolution?: string;
  isResolved: boolean;
}

export interface CarePlanFormData {
  date: string;
  goals: string[];
  objectives: string[];
  followUpDate: string;
  drugTherapyProblemResolved: boolean;
  needsReview: boolean;
  notes?: string;
}

export interface SoapNoteFormData {
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
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
