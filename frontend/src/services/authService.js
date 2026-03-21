import api from './api';
import { STORAGE_KEYS, MESSAGES } from '../utils/constants';

class AuthService {
    constructor() {
        this.tokenKey = STORAGE_KEYS.AUTH_TOKEN;
        this.refreshTokenKey = STORAGE_KEYS.REFRESH_TOKEN;
        this.userKey = STORAGE_KEYS.USER_DATA;
    }

    // ==================== Authentication Methods ====================

    /**
     * Login user
     */
    async login(username, password) {
        try {
            const response = await api.post('/auth/login', { username, password });
            
            if (response.data.success && response.data.token) {
                this.setTokens(response.data.token, response.data.refreshToken);
                this.setUser(response.data.user);
                return { success: true, message: MESSAGES.LOGIN_SUCCESS, user: response.data.user };
            }
            
            throw new Error(MESSAGES.LOGIN_FAILED);
            
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || MESSAGES.LOGIN_FAILED 
            };
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.clearTokens();
        this.clearUser();
        return { success: true, message: MESSAGES.LOGOUT_SUCCESS };
    }

    /**
     * Get current user from API
     */
    async getCurrentUser() {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success && response.data.user) {
                this.setUser(response.data.user);
                return response.data.user;
            }
            return null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error.response?.data || { success: false, message: MESSAGES.SERVER_ERROR };
        }
    }

    /**
     * Refresh token
     */
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            
            const response = await api.post('/auth/refresh-token', { refreshToken });
            
            if (response.data.success && response.data.token) {
                this.setToken(response.data.token);
                return response.data.token;
            }
            
            throw new Error('Token refresh failed');
            
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            throw error;
        }
    }

    // ==================== Token Management ====================

    /**
     * Set auth token
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
        this.setAuthHeader(token);
    }

    /**
     * Set refresh token
     */
    setRefreshToken(refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    /**
     * Set both tokens
     */
    setTokens(token, refreshToken) {
        this.setToken(token);
        if (refreshToken) {
            this.setRefreshToken(refreshToken);
        }
    }

    /**
     * Get auth token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Get refresh token
     */
    getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }

    /**
     * Clear all tokens
     */
    clearTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.setAuthHeader(null);
    }

    /**
     * Set auth header for axios
     */
    setAuthHeader(token) {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }

    // ==================== User Management ====================

    /**
     * Set user data
     */
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Get user from localStorage
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Clear user data
     */
    clearUser() {
        localStorage.removeItem(this.userKey);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Check token expiration
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }

    /**
     * Check user role
     */
    hasRole(role) {
        const user = this.getUser();
        if (!user) return false;
        
        if (role === 'admin') {
            return user.role === 'admin' || user.role === 'super_admin';
        }
        
        return user.role === role;
    }

    /**
     * Setup auto token refresh
     */
    setupAutoRefresh() {
        // Refresh token every 5 minutes
        setInterval(async () => {
            if (this.isAuthenticated()) {
                try {
                    await this.refreshToken();
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            }
        }, 5 * 60 * 1000);
    }
}

// Create and export singleton instance
const authServiceInstance = new AuthService();

// Initialize auth header on app start
const token = authServiceInstance.getToken();
if (token) {
    authServiceInstance.setAuthHeader(token);
}

export { authServiceInstance as authService };
export default authServiceInstance;