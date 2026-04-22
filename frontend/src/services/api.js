import axios from 'axios';
import { authService } from './authService';

// Auto-detect API URL based on current hostname
const getApiUrl = () => {
    const hostname = window.location.hostname;
    
    // If accessing via localhost or 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    
    // If accessing via network IP (e.g., 192.168.x.x)
    // Use the same IP for backend (port 5000)
    return `http://${hostname}:5000/api`;
};

const API_URL = process.env.REACT_APP_API_URL || getApiUrl();

console.log('🌐 API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('🚀 API Request:', config.method.toUpperCase(), config.baseURL + config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        console.error('❌ API Error:', error.response?.status, error.config?.url);
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const newToken = await authService.refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                authService.logout();
                window.location.href = '/admin/login';
                return Promise.reject(refreshError);
            }
        }
        
        // Handle other errors
        const errorResponse = {
            success: false,
            message: error.response?.data?.message || error.message || 'Network error',
            status: error.response?.status,
            data: error.response?.data
        };
        
        return Promise.reject(errorResponse);
    }
);

export default api;