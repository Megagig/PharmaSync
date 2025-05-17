import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Enable sending cookies
});

// Add a request interceptor to add the auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network errors
    if (!error.response) {
      console.error('Network Error:', error);
      throw new Error('Network error. Please check your internet connection.');
    }

    // If the error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token' && // Prevent infinite loop
      originalRequest.url !== '/auth/login' // Don't retry login requests
    ) {
      originalRequest._retry = true;

      try {
        // Import the auth service dynamically to avoid circular dependencies
        const { default: authService } = await import(
          './services/auth.service'
        );

        // Call the refreshToken method
        const { accessToken } = await authService.refreshToken();

        if (accessToken) {
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          // If no token received, clear auth state and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');

          // Dispatch an event that can be caught by the app to show a login prompt
          window.dispatchEvent(new CustomEvent('auth:sessionExpired'));

          throw new Error('Authentication failed. Please login again.');
        }
      } catch (refreshError: any) {
        // Clear tokens on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        // Dispatch an event that can be caught by the app to show a login prompt
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));

        console.error('Error refreshing token:', refreshError);

        // Provide a meaningful error message
        const errorMessage =
          refreshError.message || 'Session expired. Please login again.';
        throw new Error(errorMessage);
      }
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 400:
        throw new Error(error.response.data.message || 'Bad request');
      case 403:
        throw new Error('Access forbidden. Insufficient permissions.');
      case 404:
        throw new Error('Resource not found.');
      case 422:
        throw new Error(error.response.data.message || 'Validation error');
      case 429:
        throw new Error('Too many requests. Please try again later.');
      case 500:
        throw new Error('Internal server error. Please try again later.');
      default:
        throw new Error(error.response.data.message || 'An error occurred');
    }
  }
);

export default axiosInstance;
