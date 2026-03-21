import { useState, useCallback } from 'react';

/**
 * Hook for toggling boolean values
 * @param {boolean} initialValue - Initial toggle state
 * @returns {Array} [value, toggle, setTrue, setFalse]
 */
export const useToggle = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);
    
    const toggle = useCallback(() => setValue(v => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    
    return [value, toggle, setTrue, setFalse];
};

export default useToggle;