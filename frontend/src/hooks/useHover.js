import { useState, useRef, useEffect } from 'react';

/**
 * Hook for detecting hover state
 * @returns {Array} [hoverRef, isHovered]
 */
export const useHover = () => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);
    
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        
        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);
        
        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            node.removeEventListener('mouseenter', handleMouseEnter);
            node.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    
    return [ref, isHovered];
};

export default useHover;