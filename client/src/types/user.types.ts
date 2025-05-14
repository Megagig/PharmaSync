import { RoleType, IRole } from './role.types';

// Legacy role enum (will be deprecated)
export enum UserRole {
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
  TECHNICIAN = 'technician',
  STAFF = 'staff',
  PATIENT = 'patient',
}

export enum Permission {
  // Patient permissions
  VIEW_PATIENTS = 'view_patients',
  CREATE_PATIENTS = 'create_patients',
  EDIT_PATIENTS = 'edit_patients',

  // Medication permissions
  VIEW_MEDICATIONS = 'view_medications',
  CREATE_MEDICATIONS = 'create_medications',
  EDIT_MEDICATIONS = 'edit_medications',

  // Prescription permissions
  VIEW_PRESCRIPTIONS = 'view_prescriptions',
  CREATE_PRESCRIPTIONS = 'create_prescriptions',
  EDIT_PRESCRIPTIONS = 'edit_prescriptions',

  // Dispensing permissions
  VIEW_DISPENSING = 'view_dispensing',
  CREATE_DISPENSING = 'create_dispensing',
  EDIT_DISPENSING = 'edit_dispensing',

  // Inventory permissions
  VIEW_INVENTORY = 'view_inventory',
  MANAGE_INVENTORY = 'manage_inventory',

  // Supplier permissions
  VIEW_SUPPLIERS = 'view_suppliers',
  MANAGE_SUPPLIERS = 'manage_suppliers',

  // Purchase order permissions
  VIEW_PURCHASE_ORDERS = 'view_purchase_orders',
  CREATE_PURCHASE_ORDERS = 'create_purchase_orders',
  EDIT_PURCHASE_ORDERS = 'edit_purchase_orders',
  APPROVE_PURCHASE_ORDERS = 'approve_purchase_orders',

  // Report permissions
  VIEW_REPORTS = 'view_reports',

  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  MANAGE_ROLES = 'manage_roles',

  // Staff scheduling permissions
  VIEW_SCHEDULE = 'view_schedule',
  MANAGE_SCHEDULE = 'manage_schedule',
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    inApp?: boolean;
    sms?: boolean;
  };
  dashboard?: {
    widgets?: string[];
    layout?: any;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Legacy role field (will be deprecated)
  role?: UserRole;
  // Legacy permissions field (will be deprecated)
  permissions?: Permission[];
  // New roles field (array of role objects)
  roles?: IRole[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: UserAddress;
  dateOfBirth?: string;
  emergencyContact?: EmergencyContact;
  position?: string;
  department?: string;
  hireDate?: string;
  profileImage?: string;
  settings?: UserSettings;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Role assignments with additional info
  roleAssignments?: any[];
}

export interface UserFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  // Legacy role field (will be deprecated)
  role?: UserRole;
  // Legacy permissions field (will be deprecated)
  permissions?: Permission[];
  // New roles field (array of role IDs)
  roles?: string[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: UserAddress;
  dateOfBirth?: string;
  emergencyContact?: EmergencyContact;
  position?: string;
  department?: string;
  hireDate?: string;
  profileImage?: string;
  settings?: UserSettings;
  isActive?: boolean;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: UserAddress;
  dateOfBirth?: string;
  emergencyContact?: EmergencyContact;
  profileImage?: string;
  settings?: UserSettings;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  password: string;
}

export interface UsersState {
  users: User[];
  currentUser: User | null;
  userPermissions: any[] | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export interface TwoFactorSetupData {
  enable: boolean;
  code?: string;
}

export interface TwoFactorVerifyData {
  code: string;
}

export interface EmailVerificationData {
  token: string;
}
