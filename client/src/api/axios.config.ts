import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
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
          return axiosInstance(originalRequest);
        } else {
          console.error('No access token received from refresh token request');
          // Don't redirect automatically, let the error propagate
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Don't redirect automatically, just return the error
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
