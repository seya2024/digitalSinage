import React, { createContext, useState, useContext, useEffect } from 'react';
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const currentUser = authService.getCurrentUser();
            const token = localStorage.getItem('token');
            
            if (token && currentUser) {
                setUser(currentUser);
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const data = await authService.login(username, password);
        if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};