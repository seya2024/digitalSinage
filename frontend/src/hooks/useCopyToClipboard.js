import { useState, useCallback } from 'react';

/**
 * Hook for copying text to clipboard
 * @returns {Object} { copied, copy, error }
 */
export const useCopyToClipboard = () => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    
    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setError(null);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (err) {
            setError(err.message);
            setCopied(false);
            return false;
        }
    }, []);
    
    return { copied, copy, error };
};

export default useCopyToClipboard;