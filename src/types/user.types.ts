export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profileImage?: File | null;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  password: string;
  confirmPassword: string;
}

export interface TwoFactorSetupData {
  password: string;
}

export interface TwoFactorVerifyData {
  code: string;
}

export interface EmailVerificationData {
  token: string;
}
