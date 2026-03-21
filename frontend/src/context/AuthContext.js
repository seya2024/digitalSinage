import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = authService.getUser();
                if (storedUser && authService.isAuthenticated()) {
                    setUser(storedUser);
                    // Refresh user data from API
                    const freshUser = await authService.getCurrentUser();
                    if (freshUser) {
                        setUser(freshUser);
                    }
                }
            } catch (err) {
                console.error('Load user error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        loadUser();
        
        // Setup auto-refresh
        authService.setupAutoRefresh();
    }, []);

    // Login function
    const login = useCallback(async (username, password) => {
        setError(null);
        setLoading(true);
        
        try {
            const response = await authService.login(username, password);
            if (response.success) {
                setUser(response.user);
                return { success: true, user: response.user };
            } else {
                setError(response.message);
                return { success: false, error: response.message };
            }
        } catch (err) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setError(null);
    }, []);

    // Change password
    const changePassword = useCallback(async (currentPassword, newPassword) => {
        setError(null);
        try {
            const response = await authService.changePassword(currentPassword, newPassword);
            if (response.success) {
                return { success: true, message: response.message };
            } else {
                setError(response.message);
                return { success: false, error: response.message };
            }
        } catch (err) {
            const errorMessage = err.message || 'Password change failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    // Update user data
    const updateUser = useCallback((updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        authService.setUser(updatedUser);
    }, [user]);

    // Check user role
    const hasRole = useCallback((role) => {
        return authService.hasRole(role);
    }, [user]);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user && authService.isAuthenticated(),
        login,
        logout,
        changePassword,
        updateUser,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;