import api from '@/services/api';
import {
  IRole,
  IRoleCreate,
  IRoleUpdate,
  IUserRole,
  IUserRoleCreate,
} from '@/types/role.types';

const BASE_URL = '/roles';

/**
 * Get all roles with pagination and filtering
 * @param params Query parameters
 * @returns Promise with roles data
 */
export const getRoles = async (
  params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isDefault?: boolean;
    type?: string;
    name?: string;
  } = {}
) => {
  const { page = 1, limit = 10, isActive, isDefault, type, name } = params;

  let url = `${BASE_URL}?page=${page}&limit=${limit}`;

  if (isActive !== undefined) {
    url += `&isActive=${isActive}`;
  }

  if (isDefault !== undefined) {
    url += `&isDefault=${isDefault}`;
  }

  if (type) {
    url += `&type=${type}`;
  }

  if (name) {
    url += `&name=${name}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Get a role by ID
 * @param id Role ID
 * @returns Promise with role data
 */
export const getRoleById = async (id: string) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Create a new role
 * @param data Role data
 * @returns Promise with created role
 */
export const createRole = async (data: IRoleCreate) => {
  const response = await api.post(BASE_URL, data);
  return response.data;
};

/**
 * Update a role
 * @param id Role ID
 * @param data Role update data
 * @returns Promise with updated role
 */
export const updateRole = async (id: string, data: IRoleUpdate) => {
  const response = await api.patch(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete a role
 * @param id Role ID
 * @returns Promise with success message
 */
export const deleteRole = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Reset a role's permissions to default
 * @param id Role ID
 * @returns Promise with updated role
 */
export const resetRolePermissions = async (id: string) => {
  const response = await api.post(`${BASE_URL}/${id}/reset`);
  return response.data;
};

/**
 * Get users with a specific role
 * @param id Role ID
 * @param params Query parameters
 * @returns Promise with users data
 */
export const getRoleUsers = async (
  id: string,
  params: { page?: number; limit?: number } = {}
) => {
  const { page = 1, limit = 10 } = params;

  const response = await api.get(
    `${BASE_URL}/${id}/users?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Assign a role to a user
 * @param id Role ID
 * @param userId User ID
 * @returns Promise with user role data
 */
export const assignRoleToUser = async (id: string, userId: string) => {
  const response = await api.post(`${BASE_URL}/${id}/assign`, { userId });
  return response.data;
};

/**
 * Remove a role from a user
 * @param id Role ID
 * @param userId User ID
 * @returns Promise with success message
 */
export const removeRoleFromUser = async (id: string, userId: string) => {
  const response = await api.delete(`${BASE_URL}/${id}/users/${userId}`);
  return response.data;
};

/**
 * Get all user roles
 * @param params Query parameters
 * @returns Promise with user roles data
 */
export const getUserRoles = async (
  params: {
    page?: number;
    limit?: number;
    user?: string;
    role?: string;
    assignedBy?: string;
  } = {}
) => {
  const { page = 1, limit = 10, user, role, assignedBy } = params;

  let url = `/user-roles?page=${page}&limit=${limit}`;

  if (user) {
    url += `&user=${user}`;
  }

  if (role) {
    url += `&role=${role}`;
  }

  if (assignedBy) {
    url += `&assignedBy=${assignedBy}`;
  }

  const response = await api.get(url);
  return response.data;
};

/**
 * Get user roles for a specific user
 * @param userId User ID
 * @returns Promise with user roles data
 */
export const getUserRolesByUserId = async (userId: string) => {
  const response = await api.get(`/user-roles/users/${userId}/roles`);
  return response.data;
};

/**
 * Assign a role to a user
 * @param userId User ID
 * @param roleId Role ID
 * @returns Promise with user role data
 */
export const assignRoleToUserById = async (userId: string, roleId: string) => {
  const response = await api.post(`/user-roles/users/${userId}/roles`, {
    roleId,
  });
  return response.data;
};

/**
 * Remove a role from a user
 * @param userId User ID
 * @param roleId Role ID
 * @returns Promise with success message
 */
export const removeRoleFromUserById = async (
  userId: string,
  roleId: string
) => {
  const response = await api.delete(
    `/user-roles/users/${userId}/roles/${roleId}`
  );
  return response.data;
};

/**
 * Get user permissions
 * @param userId User ID
 * @returns Promise with user permissions data
 */
export const getUserPermissions = async (userId: string) => {
  const response = await api.get(`/user-roles/users/${userId}/permissions`);
  return response.data.data;
};

/**
 * Check if a user has a specific permission
 * @param userId User ID
 * @param resource Resource name
 * @param action Action name
 * @returns Promise with permission check result
 */
export const checkUserPermission = async (
  userId: string,
  resource: string,
  action: string
) => {
  const response = await api.get(
    `/user-roles/users/${userId}/permissions/check?resource=${resource}&action=${action}`
  );
  return response.data.data;
};
