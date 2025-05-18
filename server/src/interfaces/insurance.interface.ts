import { Document, Types } from 'mongoose';

export enum InsuranceProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ClaimStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIALLY_APPROVED = 'partially_approved',
  RESUBMITTED = 'resubmitted',
  CANCELLED = 'cancelled',
}

export enum ClaimType {
  PRESCRIPTION = 'prescription',
  OVER_THE_COUNTER = 'over_the_counter',
  MEDICAL_DEVICE = 'medical_device',
  SERVICE = 'service',
}

export enum RejectionReason {
  INVALID_POLICY = 'invalid_policy',
  POLICY_EXPIRED = 'policy_expired',
  NOT_COVERED = 'not_covered',
  REQUIRES_PREAUTHORIZATION = 'requires_preauthorization',
  DUPLICATE_CLAIM = 'duplicate_claim',
  INCORRECT_INFORMATION = 'incorrect_information',
  EXCEEDS_COVERAGE_LIMIT = 'exceeds_coverage_limit',
  OTHER = 'other',
}

export interface IInsuranceProvider extends Document {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  status: InsuranceProviderStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsurancePlan extends Document {
  provider: Types.ObjectId;
  name: string;
  code: string;
  coveragePercentage: number;
  deductible: number;
  annualLimit: number;
  formulary?: string[];
  requiresPreauthorization: boolean;
  status: InsuranceProviderStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerInsurance extends Document {
  customer: Types.ObjectId;
  provider: Types.ObjectId;
  plan: Types.ObjectId;
  policyNumber: string;
  groupNumber?: string;
  primaryCardHolder: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    relationship: string;
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isPrimary: boolean;
  coverageDetails?: {
    prescription?: {
      coveragePercentage: number;
      deductible: number;
      deductibleMet: boolean;
      annualLimit: number;
      usedAmount: number;
    };
    otc?: {
      coveragePercentage: number;
      deductible: number;
      deductibleMet: boolean;
      annualLimit: number;
      usedAmount: number;
    };
  };
  cardFrontImage?: string;
  cardBackImage?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsuranceClaim extends Document {
  claimNumber: string;
  customer: Types.ObjectId;
  customerInsurance: Types.ObjectId;
  provider: Types.ObjectId;
  plan: Types.ObjectId;
  transaction: Types.ObjectId;
  prescription?: Types.ObjectId;
  claimDate: Date;
  claimType: ClaimType;
  claimStatus: ClaimStatus;
  claimAmount: number;
  approvedAmount?: number;
  rejectionReason?: RejectionReason;
  rejectionDetails?: string;
  submissionDate?: Date;
  responseDate?: Date;
  items: {
    product: Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    coveragePercentage: number;
    coveredAmount: number;
    patientAmount: number;
  }[];
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalPatientAmount: number;
  notes?: string;
  attachments?: string[];
  responseDetails?: any;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsuranceEligibilityCheck extends Document {
  customer: Types.ObjectId;
  customerInsurance: Types.ObjectId;
  provider: Types.ObjectId;
  plan: Types.ObjectId;
  checkDate: Date;
  isEligible: boolean;
  coverageDetails?: {
    prescription?: {
      coveragePercentage: number;
      deductible: number;
      deductibleMet: boolean;
      annualLimit: number;
      usedAmount: number;
    };
    otc?: {
      coveragePercentage: number;
      deductible: number;
      deductibleMet: boolean;
      annualLimit: number;
      usedAmount: number;
    };
  };
  responseDetails?: any;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
