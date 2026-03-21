import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for setting up intervals
 * @param {Function} callback - Function to call on interval
 * @param {number} delay - Delay in milliseconds (null to pause)
 * @param {boolean} immediate - Run immediately on start
 */
export const useInterval = (callback, delay = null, immediate = false) => {
    const savedCallback = useRef();
    const intervalRef = useRef(null);

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Run immediately if specified
    useEffect(() => {
        if (immediate && delay !== null) {
            savedCallback.current();
        }
    }, [immediate, delay]);

    // Set up the interval
    useEffect(() => {
        if (delay === null) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current();
            }
        };

        intervalRef.current = setInterval(tick, delay);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [delay]);
};

/**
 * Custom hook for polling data with automatic cleanup
 * @param {Function} fetchFn - Function to poll
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} active - Whether polling is active
 * @returns {Object} Polling state
 */
export const usePolling = (fetchFn, interval = 5000, active = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!active) return;
        
        setLoading(true);
        try {
            const result = await fetchFn();
            if (isMounted.current) {
                setData(result);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err.message || 'Polling error');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [fetchFn, active]);

    // Set up polling
    useInterval(() => {
        fetchData();
    }, active ? interval : null, true);

    return { data, loading, error, refetch: fetchData };
};

export default useInterval;