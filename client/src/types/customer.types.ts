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

export enum CreditStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
}

export interface CustomerAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Customer {
  _id: string;
  customerNumber: string;
  type: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone: string;
  addresses: CustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel: string;
  creditLimit?: number;
  currentBalance: number;
  creditStatus?: CreditStatus;
  notes?: string;
  isActive: boolean;
  patientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  customerNumber?: string;
  type: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addresses: CustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel: string;
  creditLimit?: number;
  creditStatus?: CreditStatus;
  notes?: string;
  patientId?: string;
}

export interface CustomerUpdateData {
  type?: CustomerType;
  healthcareProfessionalType?: HealthcareProfessionalType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addresses?: CustomerAddress[];
  organization?: string;
  taxId?: string;
  priceLevel?: string;
  creditLimit?: number;
  currentBalance?: number;
  creditStatus?: CreditStatus;
  notes?: string;
  isActive?: boolean;
  patientId?: string;
}
