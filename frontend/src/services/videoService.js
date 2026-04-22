import api from './api';

export const videoService = {
    getAll: async (activeOnly = true) => {
        const response = await api.get(`/videos?activeOnly=${activeOnly}`);
        return response.data;
    },
    
    getActiveVideo: async () => {
        const response = await api.get('/videos/active');
        return response.data;
    },
    
    // Create video with JSON data (for YouTube links)
    create: async (videoData) => {
        const response = await api.post('/videos', videoData);
        return response.data;
    },
    
    // Create video with file upload (for local videos)
    createWithFile: async (formData) => {
        const response = await api.post('/videos', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    // Update video with JSON data
    update: async (id, videoData) => {
        const response = await api.put(`/videos/${id}`, videoData);
        return response.data;
    },
    
    // Update video with file upload (for local videos)
    updateWithFile: async (id, formData) => {
        const response = await api.put(`/videos/${id}`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    // Toggle video status (enable/disable)
    toggleStatus: async (id, status) => {
        const response = await api.put(`/videos/${id}`, { status });
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/videos/${id}`);
        return response.data;
    }
};