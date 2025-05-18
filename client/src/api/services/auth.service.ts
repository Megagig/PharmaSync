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
      console.log('Logging in user:', credentials.email);

      // Make login request with withCredentials to ensure cookies are stored
      const response = await axiosInstance.post('/auth/login', credentials, {
        withCredentials: true,
      });

      // Extract data from response
      const { data } = response.data;

      console.log('Login successful, tokens received:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      });

      // Store access token in localStorage for subsequent requests
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        console.log('Access token stored in localStorage');

        // Store remember me preference
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
      } else {
        console.error('No access token received in login response');
      }

      // In development, store refresh token if provided
      // This is only for development convenience - in production, refresh token
      // is stored as an HTTP-only cookie by the server
      if (import.meta.env.DEV && data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('Refresh token stored in localStorage (dev mode)');
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
      console.log('Registering user:', userData.email);

      // Validate password match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Make registration request with withCredentials to ensure cookies are stored
      const response = await axiosInstance.post('/auth/register', userData, {
        withCredentials: true,
      });

      // Extract data from response
      const { data } = response.data;

      console.log('Registration successful, tokens received:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      });

      // In development, store tokens if provided
      if (import.meta.env.DEV) {
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          console.log('Access token stored in localStorage (dev mode)');
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
          console.log('Refresh token stored in localStorage (dev mode)');
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
      console.log('Logging out user...');

      // Call logout endpoint to invalidate refresh token on server
      await axiosInstance.post(
        '/auth/logout',
        {},
        {
          withCredentials: true,
        }
      );

      console.log('Logout successful on server');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server request fails
    } finally {
      // Always clear local storage tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      console.log('Tokens cleared from localStorage');
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
      console.log('Refreshing token...');

      // In development, send refresh token in request body if available
      const refreshTokenFromStorage = import.meta.env.DEV
        ? localStorage.getItem('refreshToken')
        : null;

      console.log('Refresh token from storage:', !!refreshTokenFromStorage);

      const requestData = refreshTokenFromStorage
        ? { refreshToken: refreshTokenFromStorage }
        : {};

      // Make refresh token request with withCredentials to include cookies
      const response = await axiosInstance.post(
        '/auth/refresh-token',
        requestData,
        {
          withCredentials: true,
          // Skip the auth interceptor to avoid adding the expired token
          headers: {
            'Content-Type': 'application/json',
            // Don't include Authorization header here
          },
        }
      );

      console.log('Refresh token response:', response.status);

      // Extract data from response
      const { data } = response.data;

      console.log('New tokens received:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      });

      // Store new access token
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      } else {
        console.error('No access token received in refresh response');
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
    try {
      console.log('Fetching current user...');

      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      // Make request with explicit Authorization header
      const response = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        withCredentials: true,
      });

      console.log('Current user fetch successful');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);

      // If unauthorized, clear tokens
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }

      throw error;
    }
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
