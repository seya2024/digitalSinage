import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching data with loading and error states
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {boolean} immediate - Fetch immediately on mount
 */
export const useFetch = (url, options = {}, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchData = useCallback(async (params = {}) => {
        if (!url) return null;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get(url, {
                params: { ...options.params, ...params }
            });
            
            if (isMounted.current) {
                setData(response.data);
                return response.data;
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err.response?.data?.message || err.message || 'Fetch error');
            }
            throw err;
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [url, JSON.stringify(options)]);

    const refetch = useCallback((params = {}) => {
        return fetchData(params);
    }, [fetchData]);

    useEffect(() => {
        if (immediate && url) {
            fetchData();
        }
    }, [url, immediate, fetchData]);

    return { data, loading, error, refetch };
};

/**
 * Custom hook for mutation (POST, PUT, DELETE)
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method
 */
export const useMutation = (url, method = 'POST') => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = useCallback(async (payload = {}, config = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            let response;
            switch (method.toUpperCase()) {
                case 'POST':
                    response = await api.post(url, payload, config);
                    break;
                case 'PUT':
                    response = await api.put(url, payload, config);
                    break;
                case 'PATCH':
                    response = await api.patch(url, payload, config);
                    break;
                case 'DELETE':
                    response = await api.delete(url, config);
                    break;
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
            
            setData(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Mutation failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, method]);

    return { data, loading, error, execute };
};

export default useFetch;