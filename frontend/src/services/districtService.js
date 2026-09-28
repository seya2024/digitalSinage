import api from './api';

export const districtService = {
    getAll: async () => {
        const res = await api.get('/districts');
        return res.data;
    },
    getOne: async (id) => {
        const res = await api.get(`/districts/${id}`);
        return res.data;
    },
    getBranches: async (id) => {
        const res = await api.get(`/districts/${id}/branches`);
        return res.data;
    },
    create: async (data) => {
        const res = await api.post('/districts', data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.put(`/districts/${id}`, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/districts/${id}`);
        return res.data;
    }
};