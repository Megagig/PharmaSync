import axiosInstance from '../config/axios.config';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async logout(): Promise<void> {
        localStorage.removeItem('token');
        await axiosInstance.post('/auth/logout');
    },

    async getCurrentUser(): Promise<AuthResponse['user']> {
        const response = await axiosInstance.get<AuthResponse>('/auth/me');
        return response.data.user;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
};

export default authService; 