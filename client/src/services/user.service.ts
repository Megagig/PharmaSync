import api from '@/services/api';
import {
  // User is used in return types but TypeScript doesn't recognize this pattern
  // User,
  UserFormData,
  UserProfileUpdateData,
  PasswordChangeData,
  PasswordResetData,
  TwoFactorSetupData,
  TwoFactorVerifyData,
  EmailVerificationData,
} from '@/types/user.types';

const BASE_URL = '/users';

/**
 * Get all users with pagination and filtering
 * @param params Query parameters
 * @returns Promise with users data
 */
export const getUsers = async (
  params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isEmailVerified?: boolean;
    role?: string;
    roleType?: string;
    search?: string;
  } = {}
) => {
  const {
    page = 1,
    limit = 10,
    isActive,
    isEmailVerified,
    role,
    roleType,
    search,
  } = params;

  let url = `${BASE_URL}?page=${page}&limit=${limit}`;

  if (isActive !== undefined) {
    url += `&isActive=${isActive}`;
  }

  if (isEmailVerified !== undefined) {
    url += `&isEmailVerified=${isEmailVerified}`;
  }

  if (role) {
    url += `&role=${role}`;
  }

  if (roleType) {
    url += `&roleType=${roleType}`;
  }

  if (search) {
    url += `&search=${search}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Get a user by ID
 * @param id User ID
 * @returns Promise with user data
 */
export const getUserById = async (id: string) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create a new user
 * @param data User data
 * @returns Promise with created user
 */
export const createUser = async (data: UserFormData) => {
  const response = await api.post(BASE_URL, data);
  return response.data;
};

/**
 * Update a user
 * @param id User ID
 * @param data User update data
 * @returns Promise with updated user
 */
export const updateUser = async (id: string, data: Partial<UserFormData>) => {
  const response = await api.patch(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete a user
 * @param id User ID
 * @returns Promise with success message
 */
export const deleteUser = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Get current user profile
 * @returns Promise with user profile data
 */
export const getCurrentUser = async () => {
  const response = await api.get(`${BASE_URL}/profile`);
  return response.data;
};

/**
 * Update current user profile
 * @param data Profile update data
 * @returns Promise with updated user profile
 */
export const updateCurrentUser = async (data: UserProfileUpdateData) => {
  const response = await api.patch(`${BASE_URL}/profile`, data);
  return response.data;
};

/**
 * Change current user password
 * @param data Password change data
 * @returns Promise with success message
 */
export const changePassword = async (data: PasswordChangeData) => {
  const response = await api.post(`${BASE_URL}/me/password`, data);
  return response.data.data;
};

/**
 * Change a user's password (admin function)
 * @param id User ID
 * @param password New password
 * @returns Promise with success message
 */
export const changeUserPassword = async (id: string, password: string) => {
  const response = await api.post(`${BASE_URL}/${id}/password`, { password });
  return response.data;
};

/**
 * Request password reset
 * @param email User email
 * @returns Promise with success message
 */
export const requestPasswordReset = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 * @param token Reset token
 * @param data New password data
 * @returns Promise with success message
 */
export const resetPassword = async (token: string, data: PasswordResetData) => {
  const response = await api.post(`/auth/reset-password/${token}`, data);
  return response.data;
};

/**
 * Verify email with token
 * @param data Email verification data
 * @returns Promise with success message
 */
export const verifyEmail = async (data: EmailVerificationData) => {
  const response = await api.post('/auth/verify-email', data);
  return response.data;
};

/**
 * Resend email verification
 * @returns Promise with success message
 */
export const resendEmailVerification = async () => {
  const response = await api.post('/auth/resend-verification');
  return response.data;
};

/**
 * Setup two-factor authentication
 * @param data Two-factor setup data
 * @returns Promise with setup data (QR code, etc.)
 */
export const setupTwoFactor = async (data: TwoFactorSetupData) => {
  const response = await api.post(`${BASE_URL}/me/two-factor`, data);
  return response.data;
};

/**
 * Verify two-factor authentication
 * @param data Two-factor verification data
 * @returns Promise with success message
 */
export const verifyTwoFactor = async (data: TwoFactorVerifyData) => {
  const response = await api.post(`${BASE_URL}/me/two-factor/verify`, data);
  return response.data;
};

/**
 * Get backup codes for two-factor authentication
 * @returns Promise with backup codes
 */
export const getTwoFactorBackupCodes = async () => {
  const response = await api.get(`${BASE_URL}/me/two-factor/backup-codes`);
  return response.data;
};

/**
 * Generate new backup codes for two-factor authentication
 * @returns Promise with new backup codes
 */
export const generateTwoFactorBackupCodes = async () => {
  const response = await api.post(`${BASE_URL}/me/two-factor/backup-codes`);
  return response.data;
};

/**
 * Disable two-factor authentication
 * @returns Promise with success message
 */
export const disableTwoFactor = async () => {
  const response = await api.delete(`${BASE_URL}/me/two-factor`);
  return response.data;
};

/**
 * Get user activity logs
 * @param params Query parameters
 * @returns Promise with activity logs data
 */
export const getUserActivityLogs = async (
  params: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  const { page = 1, limit = 20, type, startDate, endDate } = params;

  let url = `${BASE_URL}/me/activity-logs?page=${page}&limit=${limit}`;

  if (type) {
    url += `&type=${type}`;
  }

  if (startDate) {
    url += `&startDate=${startDate}`;
  }

  if (endDate) {
    url += `&endDate=${endDate}`;
  }

  const response = await api.get(url);
  return response.data;
};
