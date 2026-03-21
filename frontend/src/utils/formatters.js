/**
 * Utility functions for formatting numbers, dates, and currencies
 */

// ==================== Number Formatters ====================

/**
 * Format number with decimal places
 * @param {number|string} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted number
 */
export const formatNumber = (num, decimals = 4) => {
    if (num === null || num === undefined || num === '') return '0.0000';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0.0000';
    return number.toFixed(decimals);
};

/**
 * Format number with thousand separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumberWithCommas = (num) => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return number.toLocaleString('en-US');
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'ETB')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'ETB') => {
    const formatted = formatNumber(amount, 2);
    return `${currency} ${formatted}`;
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '0%';
    return `${number.toFixed(decimals)}%`;
};

/**
 * Calculate spread between buy and sell rates
 * @param {number} buyRate - Buying rate
 * @param {number} sellRate - Selling rate
 * @returns {string} Formatted spread
 */
export const calculateSpread = (buyRate, sellRate) => {
    if (!buyRate || !sellRate) return '0.0000';
    const spread = parseFloat(buyRate) - parseFloat(sellRate);
    return formatNumber(spread);
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {string} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
    if (!oldValue || !newValue) return '0%';
    const change = ((newValue - oldValue) / oldValue) * 100;
    return formatPercentage(change);
};

// ==================== Date Formatters ====================

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'full', 'date', 'time', 'datetime'
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'datetime') => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const options = {
        full: { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        date: { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        },
        time: { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        },
        datetime: { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        },
        short: {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        }
    };
    
    return d.toLocaleString('en-US', options[format] || options.datetime);
};

/**
 * Format date for API requests (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
};

/**
 * Format time duration (seconds to readable format)
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
};

// ==================== Specialized Formatters ====================

/**
 * Format exchange rate with color indicator
 * @param {number} rate - Rate value
 * @param {string} type - 'sell' or 'buy'
 * @returns {object} { value, className }
 */
export const formatExchangeRate = (rate, type = 'sell') => {
    const value = formatNumber(rate);
    const className = type === 'sell' ? 'sell-rate' : 'buy-rate';
    return { value, className };
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.replace(/\b\w/g, char => char.toUpperCase());
};

export default {
    formatNumber,
    formatNumberWithCommas,
    formatCurrency,
    formatPercentage,
    calculateSpread,
    calculatePercentageChange,
    formatDate,
    formatDateForAPI,
    getRelativeTime,
    isToday,
    formatDuration,
    formatExchangeRate,
    formatPhoneNumber,
    truncateText,
    capitalizeWords
};