import { Document, Types } from 'mongoose';

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

export interface IPatient extends Document {
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
  allergies: IAllergy[];
  medicalConditions: IMedicalCondition[];
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
  allergies?: IAllergy[];
  medicalConditions?: IMedicalCondition[];
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
  notes?: string;
}

export interface IPatientResponse {
  id: string;
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
  allergies: IAllergy[];
  medicalConditions: IMedicalCondition[];
  medications: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
