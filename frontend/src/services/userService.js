import api from './api';

export const userService = {
    // Get all users
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    
    // Get user by ID
    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    
    // Create new user
    create: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    
    // Update user
    update: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },
    
    // Delete user
    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
    
    // Reset user password
    resetPassword: async (id) => {
        const response = await api.post(`/users/${id}/reset-password`);
        return response.data;
    }
,
    // Change user password
changePassword: async (userId, passwordData) => {
    try {
        const response = await api.post(`/users/${userId}/change-password`, passwordData);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

};