import { Document, Types } from 'mongoose';

export enum CustomerType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  PATIENT = 'patient',
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
  CORPORATE = 'corporate',
  OTHER = 'other',
}

export enum HealthcareProfessionalType {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  PHARMACIST = 'pharmacist',
  LAB_TECHNICIAN = 'lab_technician',
  OTHER = 'other',
}

export interface ICustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  _id?: Types.ObjectId;
}

export interface ICustomer extends Document {
  customerNumber: string;
  type: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addresses: ICustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel: string; // e.g., 'retail', 'wholesale', 'special'
  creditLimit?: number;
  currentBalance: number;
  totalPurchases: number;
  creditStatus?: 'active' | 'suspended' | 'blocked';
  notes?: string;
  isActive: boolean;
  patientId?: Types.ObjectId; // Reference to patient if type is PATIENT
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface ICustomerCreate {
  customerNumber?: string;
  type: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addresses: ICustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel: string;
  creditLimit?: number;
  creditStatus?: 'active' | 'suspended' | 'blocked';
  notes?: string;
  patientId?: string;
}

export interface ICustomerUpdate {
  type?: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addresses?: ICustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel?: string;
  creditLimit?: number;
  currentBalance?: number;
  creditStatus?: 'active' | 'suspended' | 'blocked';
  notes?: string;
  isActive?: boolean;
  patientId?: string;
}

export interface ICustomerResponse {
  id: string;
  customerNumber: string;
  type: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone: string;
  addresses: ICustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel: string;
  creditLimit?: number;
  currentBalance: number;
  creditStatus?: 'active' | 'suspended' | 'blocked';
  notes?: string;
  isActive: boolean;
  patientId?: string;
  createdAt: Date;
  updatedAt: Date;
}
