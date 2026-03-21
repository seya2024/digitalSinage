/**
 * Helper functions for common tasks
 */

// ==================== Storage Helpers ====================

/**
 * Save data to localStorage with expiration
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
export const setWithExpiry = (key, value, ttl) => {
    const item = {
        value: value,
        expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get data from localStorage with expiration check
 * @param {string} key - Storage key
 * @returns {any|null} Stored value or null if expired
 */
export const getWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    return item.value;
};

/**
 * Clear all app storage
 */
export const clearAppStorage = () => {
    const keys = ['auth_token', 'refresh_token', 'user_data', 'app_settings'];
    keys.forEach(key => localStorage.removeItem(key));
};

// ==================== Cookie Helpers ====================

/**
 * Set cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days to expire
 */
export const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

/**
 * Get cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value
 */
export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

/**
 * Delete cookie
 * @param {string} name - Cookie name
 */
export const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

// ==================== URL Helpers ====================

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {object} Parsed query parameters
 */
export const parseQueryString = (queryString) => {
    const params = {};
    const search = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    
    if (!search) return params;
    
    search.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    
    return params;
};

/**
 * Build query string from object
 * @param {object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
    const query = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    
    return query ? `?${query}` : '';
};

// ==================== Array Helpers ====================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {boolean} ascending - Sort order
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, ascending = true) => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @param {string} key - Key to check for uniqueness
 * @returns {Array} Array with duplicates removed
 */
export const uniqueBy = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
        const value = key ? item[key] : item;
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

// ==================== Object Helpers ====================

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
    );
};

/**
 * Pick specific keys from object
 * @param {object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {object} Object with picked keys
 */
export const pick = (obj, keys) => {
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
};

/**
 * Omit specific keys from object
 * @param {object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {object} Object without omitted keys
 */
export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

// ==================== File Helpers ====================

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Download filename
 */
export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== Color Helpers ====================

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const randomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Lighten color
 * @param {string} color - Hex color
 * @param {number} percent - Lighten percentage
 * @returns {string} Lightened color
 */
export const lightenColor = (color, percent) => {
    const num = parseInt(color.slice(1), 16);
    const r = (num >> 16) + percent;
    const g = ((num >> 8) & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;
    return `#${(0x1000000 + (r < 255 ? r < 1 ? 0 : r : 255) * 0x10000 + 
        (g < 255 ? g < 1 ? 0 : g : 255) * 0x100 + 
        (b < 255 ? b < 1 ? 0 : b : 255)).toString(16).slice(1)}`;
};

// ==================== Browser Helpers ====================

/**
 * Check if running on mobile device
 * @returns {boolean} True if mobile
 */
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if running in iframe
 * @returns {boolean} True if in iframe
 */
export const isInIframe = () => {
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get current scroll position
 * @returns {number} Scroll position
 */
export const getScrollPosition = () => {
    return window.pageYOffset || document.documentElement.scrollTop;
};

/**
 * Smooth scroll to element
 * @param {string} elementId - Element ID
 * @param {number} offset - Scroll offset
 */
export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// ==================== Debounce & Throttle ====================

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};

// ==================== String Helpers ====================

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export const randomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Slugify string
 * @param {string} text - Text to slugify
 * @returns {string} Slugified string
 */
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

export default {
    setWithExpiry,
    getWithExpiry,
    clearAppStorage,
    setCookie,
    getCookie,
    deleteCookie,
    parseQueryString,
    buildQueryString,
    groupBy,
    sortBy,
    uniqueBy,
    deepClone,
    pick,
    omit,
    fileToBase64,
    downloadBlob,
    formatFileSize,
    randomColor,
    lightenColor,
    isMobile,
    isInIframe,
    copyToClipboard,
    getScrollPosition,
    scrollToElement,
    debounce,
    throttle,
    randomString,
    slugify
};