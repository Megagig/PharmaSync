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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: UserAddress;
  dateOfBirth?: string;
  emergencyContact?: EmergencyContact;
  position?: string;
  department?: string;
  hireDate?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: Permission[];
  phoneNumber?: string;
  licenseNumber?: string;
  address?: UserAddress;
  dateOfBirth?: string;
  emergencyContact?: EmergencyContact;
  position?: string;
  department?: string;
  hireDate?: string;
  profileImage?: string;
  isActive?: boolean;
}

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: UserAddress;
  emergencyContact?: EmergencyContact;
  profileImage?: string;
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
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}
