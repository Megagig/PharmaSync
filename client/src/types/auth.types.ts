export enum UserRole {
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
  TECHNICIAN = 'technician',
  STAFF = 'staff',
  PATIENT = 'patient',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  licenseNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  licenseNumber?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string; // Optional because it's only included in development
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
