import api from './api';

export const currencyService = {
    getAll: async () => {
        const response = await api.get('/currencies');
        return response.data;
    },
    
    getOne: async (id) => {
        const response = await api.get(`/currencies/${id}`);
        return response.data;
    },
    
    requestAdd: async (currencyData) => {
        const response = await api.post('/currencies/request-add', currencyData);
        return response.data;
    },

    // Get rate history for a currency
getRateHistory: async (currencyId) => {
    try {
        const response = await api.get(`/currencies/${currencyId}/history`);
        return response.data;
    } catch (error) {
        console.error('Error getting rate history:', error);
        throw error;
    }
},
    
    requestUpdate: async (currencyId, sellRate, buyRate, reason) => {
        const response = await api.post('/currencies/request-update', {
            currency_id: currencyId,
            sell_rate: sellRate,
            buy_rate: buyRate,
            reason
        });
        return response.data;
    },
    
    requestDelete: async (currencyId, reason) => {
        const response = await api.post('/currencies/request-delete', {
            currency_id: currencyId,
            reason
        });
        return response.data;
    },
    
    getPendingChanges: async () => {
        const response = await api.get('/currencies/pending/changes');
        return response.data;
    },
    
    approveChange: async (changeId) => {
        const response = await api.post(`/currencies/pending/${changeId}/approve`);
        return response.data;
    },
    
    rejectChange: async (changeId, reason) => {
        const response = await api.post(`/currencies/pending/${changeId}/reject`, { reason });
        return response.data;
    },
    
    getRateHistory: async (currencyId) => {
        const response = await api.get(`/currencies/${currencyId}/history`);
        return response.data;
    }

    
};