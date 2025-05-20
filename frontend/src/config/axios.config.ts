import axios from 'axios';

// Use relative URL since we're using the proxy
const baseURL = '/api';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Explicitly set CORS-related options
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Log the request configuration
        console.log('Making request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log('Response received:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request error:', {
                request: error.request,
                message: 'No response received from server'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }

        // Handle specific error cases
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - please check if the server is running');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 