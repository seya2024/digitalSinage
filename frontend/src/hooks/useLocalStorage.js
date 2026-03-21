import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with reactive state
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
export const useLocalStorage = (key, initialValue, ttl = null) => {
    // Get stored value
    const readValue = useCallback(() => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return initialValue;
            
            if (ttl) {
                const parsed = JSON.parse(item);
                if (parsed.expiry && Date.now() > parsed.expiry) {
                    localStorage.removeItem(key);
                    return initialValue;
                }
                return parsed.value;
            }
            
            return JSON.parse(item);
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return initialValue;
        }
    }, [key, initialValue, ttl]);

    const [storedValue, setStoredValue] = useState(readValue);

    // Update state when localStorage changes in another tab
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key) {
                setStoredValue(readValue());
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, readValue]);

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            
            if (ttl) {
                const item = {
                    value: valueToStore,
                    expiry: Date.now() + ttl
                };
                localStorage.setItem(key, JSON.stringify(item));
            } else {
                localStorage.setItem(key, JSON.stringify(valueToStore));
            }
            
            // Trigger storage event for same tab
            window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) }));
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    }, [key, storedValue, ttl]);

    const removeValue = useCallback(() => {
        localStorage.removeItem(key);
        setStoredValue(initialValue);
        window.dispatchEvent(new StorageEvent('storage', { key }));
    }, [key, initialValue]);

    const clearAll = useCallback(() => {
        localStorage.clear();
        setStoredValue(initialValue);
    }, [initialValue]);

    return [storedValue, setValue, removeValue, clearAll];
};

export default useLocalStorage;