import { useState, useEffect } from 'react';

/**
 * Hook for detecting key presses
 * @param {string|Array} targetKey - Key(s) to detect
 * @returns {boolean} Whether the key is pressed
 */
export const useKeyPress = (targetKey) => {
    const [keyPressed, setKeyPressed] = useState(false);
    
    useEffect(() => {
        const downHandler = ({ key }) => {
            if (Array.isArray(targetKey)) {
                if (targetKey.includes(key)) {
                    setKeyPressed(true);
                }
            } else if (key === targetKey) {
                setKeyPressed(true);
            }
        };
        
        const upHandler = ({ key }) => {
            if (Array.isArray(targetKey)) {
                if (targetKey.includes(key)) {
                    setKeyPressed(false);
                }
            } else if (key === targetKey) {
                setKeyPressed(false);
            }
        };
        
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [targetKey]);
    
    return keyPressed;
};

export default useKeyPress;