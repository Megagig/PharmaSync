import axiosInstance from '../axios.config';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '@/types/auth.types';

/**
 * Authentication service for handling user authentication
 * This service follows security best practices for token management
 */
const authService = {
  /**
   * Login user with credentials
   * @param credentials User login credentials
   * @returns Authentication response with user data and tokens
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Make login request
      const response = await axiosInstance.post('/auth/login', credentials);

      // Extract data from response
      const { data } = response.data;

      // Store access token in localStorage for subsequent requests
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);

        // Store remember me preference
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
      }

      // In development, store refresh token if provided
      // This is only for development convenience - in production, refresh token
      // is stored as an HTTP-only cookie by the server
      if (import.meta.env.DEV && data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);

      // Provide meaningful error messages
      if (error.response) {
        const message = error.response.data?.message || 'Authentication failed';
        throw new Error(message);
      }

      throw new Error(
        'Login failed. Please check your credentials and try again.'
      );
    }
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Authentication response with user data and tokens
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      // Validate password match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Make registration request
      const response = await axiosInstance.post('/auth/register', userData);

      // Extract data from response
      const { data } = response.data;

      // In development, store tokens if provided
      if (import.meta.env.DEV) {
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }

      return data;
    } catch (error: any) {
      console.error('Registration error:', error);

      // Provide meaningful error messages
      if (error.response) {
        const message = error.response.data?.message || 'Registration failed';
        throw new Error(message);
      }

      throw error;
    }
  },

  /**
   * Logout user and invalidate tokens
   */
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate refresh token on server
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server request fails
    } finally {
      // Always clear local storage tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Refresh access token using refresh token
   * Uses HTTP-only cookie in production, falls back to localStorage in development
   */
  refreshToken: async (): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> => {
    try {
      // In development, send refresh token in request body if available
      const refreshTokenFromStorage = import.meta.env.DEV
        ? localStorage.getItem('refreshToken')
        : null;

      const requestData = refreshTokenFromStorage
        ? { refreshToken: refreshTokenFromStorage }
        : {};

      // Make refresh token request
      const response = await axiosInstance.post(
        '/auth/refresh-token',
        requestData
      );

      // Extract data from response
      const { data } = response.data;

      // Store new access token
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }

      // In development, store refresh token if provided
      if (import.meta.env.DEV && data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error: any) {
      console.error('Refresh token error:', error);

      // Clear tokens on refresh failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // Provide meaningful error message
      if (error.response) {
        const message = error.response.data?.message || 'Session expired';
        throw new Error(message);
      }

      throw new Error('Session expired. Please login again.');
    }
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data;
  },

  verifyToken: async (token: string) => {
    const response = await axiosInstance.post('/auth/verify-token', { token });
    return response.data.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    return response.data.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data.data;
  },
};

export default authService;
