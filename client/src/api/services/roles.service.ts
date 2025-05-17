import axiosInstance from '../axios.config';
import { Role, Permission } from '@/types/role.types';

const roleService = {
  /**
   * Get all roles
   */
  getAllRoles: async (): Promise<Role[]> => {
    const response = await axiosInstance.get('/roles');
    return response.data.data;
  },

  /**
   * Get role by ID
   */
  getRoleById: async (id: string): Promise<Role> => {
    const response = await axiosInstance.get(`/roles/${id}`);
    return response.data.data;
  },

  /**
   * Create a new role
   */
  createRole: async (roleData: Partial<Role>): Promise<Role> => {
    const response = await axiosInstance.post('/roles', roleData);
    return response.data.data;
  },

  /**
   * Update a role
   */
  updateRole: async (id: string, roleData: Partial<Role>): Promise<Role> => {
    const response = await axiosInstance.patch(`/roles/${id}`, roleData);
    return response.data.data;
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/roles/${id}`);
  },

  /**
   * Get all permissions
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await axiosInstance.get('/permissions');
    return response.data.data;
  },

  /**
   * Get user permissions
   */
  getUserPermissions: async (userId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/users/${userId}/permissions`);
    return response.data.data;
  },

  /**
   * Assign role to user
   */
  assignRoleToUser: async (userId: string, roleId: string): Promise<void> => {
    await axiosInstance.post(`/users/${userId}/roles`, { roleId });
  },

  /**
   * Remove role from user
   */
  removeRoleFromUser: async (userId: string, roleId: string): Promise<void> => {
    await axiosInstance.delete(`/users/${userId}/roles/${roleId}`);
  },

  /**
   * Get user roles
   */
  getUserRoles: async (userId: string): Promise<Role[]> => {
    const response = await axiosInstance.get(`/users/${userId}/roles`);
    return response.data.data;
  },
};

export default roleService;
