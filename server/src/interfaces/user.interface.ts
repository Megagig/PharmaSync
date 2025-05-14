import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
  TECHNICIAN = 'technician',
  STAFF = 'staff',
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

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.PHARMACIST]: [
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.VIEW_MEDICATIONS,
    Permission.CREATE_MEDICATIONS,
    Permission.EDIT_MEDICATIONS,
    Permission.VIEW_PRESCRIPTIONS,
    Permission.CREATE_PRESCRIPTIONS,
    Permission.EDIT_PRESCRIPTIONS,
    Permission.VIEW_DISPENSING,
    Permission.CREATE_DISPENSING,
    Permission.EDIT_DISPENSING,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_SUPPLIERS,
    Permission.MANAGE_SUPPLIERS,
    Permission.VIEW_PURCHASE_ORDERS,
    Permission.CREATE_PURCHASE_ORDERS,
    Permission.EDIT_PURCHASE_ORDERS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_SCHEDULE,
  ],
  [UserRole.TECHNICIAN]: [
    Permission.VIEW_PATIENTS,
    Permission.VIEW_MEDICATIONS,
    Permission.VIEW_PRESCRIPTIONS,
    Permission.VIEW_DISPENSING,
    Permission.CREATE_DISPENSING,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_SUPPLIERS,
    Permission.VIEW_PURCHASE_ORDERS,
    Permission.VIEW_SCHEDULE,
  ],
  [UserRole.STAFF]: [
    Permission.VIEW_PATIENTS,
    Permission.VIEW_MEDICATIONS,
    Permission.VIEW_SCHEDULE,
  ],
};

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  position?: string;
  department?: string;
  hireDate?: Date;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: Permission[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  position?: string;
  department?: string;
  hireDate?: Date;
  profileImage?: string;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  permissions?: Permission[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  position?: string;
  department?: string;
  hireDate?: Date;
  profileImage?: string;
  isActive?: boolean;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  position?: string;
  department?: string;
  hireDate?: Date;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
