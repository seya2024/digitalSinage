import { useState, useCallback } from 'react';
import { MESSAGES } from '../utils/constants';

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, toast]);
        
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
        
        return id;
    }, []);

    const success = useCallback((message) => {
        return addToast(message, 'success');
    }, [addToast]);

    const error = useCallback((message) => {
        return addToast(message || MESSAGES.SERVER_ERROR, 'error');
    }, [addToast]);

    const info = useCallback((message) => {
        return addToast(message, 'info');
    }, [addToast]);

    const warning = useCallback((message) => {
        return addToast(message, 'warning');
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast: (id) => setToasts(prev => prev.filter(t => t.id !== id)),
        clearToasts: () => setToasts([]),
        success,
        error,
        info,
        warning
    };
};

export default useToast;