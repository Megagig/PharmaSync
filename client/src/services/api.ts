import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token' // Prevent infinite loop
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data.data;

        // Update the token in localStorage
        if (accessToken) {
          localStorage.setItem('token', accessToken);

          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request
          return api(originalRequest);
        } else {
          console.error('No access token received from refresh token request');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('API Error:', error);

    if (error.response) {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        // Clear token from localStorage
        localStorage.removeItem('token');
      }

      // Log the error details
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Return the error response data
      return Promise.reject(error.response.data);
    }

    if (error.request) {
      // The request was made but no response was received
      console.error('Request error - no response:', error.request);
      return Promise.reject({
        status: 'error',
        message: 'No response from server. Please check your connection.',
      });
    }

    // Network errors or other issues
    console.error('Error message:', error.message);
    return Promise.reject({
      status: 'error',
      message: error.message || 'An unexpected error occurred',
    });
  }
);

export default api;
