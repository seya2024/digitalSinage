import { useEffect, useRef } from 'react';

/**
 * Hook to get previous value of a variable
 * @param {any} value - Current value
 * @returns {any} Previous value
 */
export const usePrevious = (value) => {
    const ref = useRef();
    
    useEffect(() => {
        ref.current = value;
    }, [value]);
    
    return ref.current;
};

export default usePrevious;