import api from './api';

export const branchService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/branches${params ? '?' + params : ''}`);
        return res.data;
    },
    getByCode: async (code) => {
        const res = await api.get(`/branches/code/${code}`);
        return res.data;
    },
    create: async (data) => {
        const res = await api.post('/branches', data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.put(`/branches/${id}`, data);
        return res.data;
    },
    updateMessage: async (id, message) => {
        const res = await api.patch(`/branches/${id}/message`, { message });
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/branches/${id}`);
        return res.data;
    }
};