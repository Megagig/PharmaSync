import { Document, Types } from 'mongoose';

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

export interface IAllergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  dateIdentified: Date;
  _id?: Types.ObjectId;
}

export interface IMedicalCondition {
  condition: string;
  diagnosisDate: Date;
  status: 'active' | 'resolved' | 'in_remission';
  notes?: string;
  _id?: Types.ObjectId;
}

export interface IMedicationHistory {
  medication: string;
  purpose: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  _id?: Types.ObjectId;
}

export interface IClinicalAssessment {
  date: Date;
  bloodPressure: string;
  respiratoryRate: string;
  temperature: string;
  heartSounds: string;
  palor: boolean;
  dehydration: boolean;
  notes?: string;
  _id?: Types.ObjectId;
}

export interface ILaboratoryFinding {
  date: Date;
  pcv?: string;
  mcms?: string;
  euCr?: string;
  fbc?: string;
  fbs?: string;
  hbA1c?: string;
  other?: Record<string, string>;
  notes?: string;
  _id?: Types.ObjectId;
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

export interface IDrugTherapyProblem {
  date: Date;
  type: DrugTherapyProblemType;
  description: string;
  resolution?: string;
  isResolved: boolean;
  _id?: Types.ObjectId;
}

export interface ICarePlan {
  date: Date;
  goals: string[];
  objectives: string[];
  followUpDate: Date;
  drugTherapyProblemResolved: boolean;
  needsReview: boolean;
  notes?: string;
  _id?: Types.ObjectId;
}

export interface ISoapNote {
  date: Date;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  followUpDate?: Date;
  _id?: Types.ObjectId;
}

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age?: number; // Calculated field
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
  allergies: IAllergy[];
  medicalConditions: IMedicalCondition[];
  medicationHistory: IMedicationHistory[];
  clinicalAssessments: IClinicalAssessment[];
  laboratoryFindings: ILaboratoryFinding[];
  drugTherapyProblems: IDrugTherapyProblem[];
  carePlans: ICarePlan[];
  soapNotes: ISoapNote[];
  medications: Types.ObjectId[]; // References to medication IDs
  notes?: string;
  createdBy: Types.ObjectId; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IPatientCreate {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
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
  allergies?: IAllergy[];
  medicalConditions?: IMedicalCondition[];
  medicationHistory?: IMedicationHistory[];
  clinicalAssessments?: IClinicalAssessment[];
  laboratoryFindings?: ILaboratoryFinding[];
  drugTherapyProblems?: IDrugTherapyProblem[];
  carePlans?: ICarePlan[];
  soapNotes?: ISoapNote[];
  notes?: string;
}

export interface IPatientUpdate {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phoneNumber?: string;
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

export interface IPatientResponse {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
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
  allergies: IAllergy[];
  medicalConditions: IMedicalCondition[];
  medicationHistory: IMedicationHistory[];
  clinicalAssessments: IClinicalAssessment[];
  laboratoryFindings: ILaboratoryFinding[];
  drugTherapyProblems: IDrugTherapyProblem[];
  carePlans: ICarePlan[];
  soapNotes: ISoapNote[];
  medications: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
