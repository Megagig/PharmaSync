import axiosInstance from '../axios.config';
import {
  User,
  UserFormData,
  UserProfileUpdateData,
  PasswordChangeData,
  PasswordResetRequestData,
  PasswordResetData,
} from '@/types/user.types';

const userService = {
  getAllUsers: async (
    page = 1,
    limit = 10,
    isActive = '',
    role = '',
    search = ''
  ): Promise<{
    data: User[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/users?page=${page}&limit=${limit}`;
    
    if (isActive !== '') {
      url += `&isActive=${isActive}`;
    }
    
    if (role) {
      url += `&role=${role}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (userData: UserFormData): Promise<User> => {
    const response = await axiosInstance.post('/users', userData);
    return response.data.data;
  },

  updateUser: async (id: string, updateData: Partial<UserFormData>): Promise<User> => {
    const response = await axiosInstance.patch(`/users/${id}`, updateData);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  changeUserPassword: async (id: string, password: string): Promise<void> => {
    await axiosInstance.patch(`/users/${id}/change-password`, { password });
  },

  getUserProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/users/profile');
    return response.data.data;
  },

  updateUserProfile: async (updateData: UserProfileUpdateData): Promise<User> => {
    const response = await axiosInstance.patch('/users/profile', updateData);
    return response.data.data;
  },

  changeUserProfilePassword: async (passwordData: PasswordChangeData): Promise<void> => {
    await axiosInstance.patch('/users/profile/change-password', passwordData);
  },

  forgotPassword: async (data: PasswordResetRequestData): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/users/forgot-password', data);
    return response.data;
  },

  resetPassword: async (token: string, data: PasswordResetData): Promise<{ message: string }> => {
    const response = await axiosInstance.patch(`/users/reset-password/${token}`, data);
    return response.data;
  },
};

export default userService;
