/**
 * Validation functions for forms and data
 */

// ==================== Basic Validators ====================

/**
 * Check if value is not empty
 * @param {any} value - Value to check
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/**
 * Check if value is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Check if value is a valid phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};

/**
 * Check if value is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Check if value is a valid number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isNumber = (value) => {
    if (value === null || value === undefined) return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
};

/**
 * Check if number is positive
 * @param {number} value - Number to validate
 * @returns {boolean} True if positive
 */
export const isPositiveNumber = (value) => {
    if (!isNumber(value)) return false;
    return parseFloat(value) > 0;
};

/**
 * Check if number is within range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
export const isInRange = (value, min, max) => {
    if (!isNumber(value)) return false;
    const num = parseFloat(value);
    return num >= min && num <= max;
};

/**
 * Check if string length is within range
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if length within range
 */
export const isValidLength = (value, min, max) => {
    if (!value) return false;
    const length = value.length;
    return length >= min && length <= max;
};

/**
 * Check if value matches regex pattern
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Regex pattern
 * @returns {boolean} True if matches
 */
export const matchesPattern = (value, pattern) => {
    if (!value) return false;
    return pattern.test(value);
};

// ==================== Currency Validators ====================

/**
 * Check if currency code is valid
 * @param {string} code - Currency code (e.g., USD, EUR)
 * @returns {boolean} True if valid
 */
export const isValidCurrencyCode = (code) => {
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(code);
};

/**
 * Check if exchange rate is valid
 * @param {number} rate - Rate to validate
 * @returns {boolean} True if valid rate
 */
export const isValidExchangeRate = (rate) => {
    if (!isNumber(rate)) return false;
    const num = parseFloat(rate);
    return num > 0 && num < 1000000;
};

/**
 * Check if buy rate is greater than sell rate
 * @param {number} buyRate - Buying rate
 * @param {number} sellRate - Selling rate
 * @returns {boolean} True if buy > sell
 */
export const isValidSpread = (buyRate, sellRate) => {
    if (!isNumber(buyRate) || !isNumber(sellRate)) return false;
    return parseFloat(buyRate) > parseFloat(sellRate);
};

// ==================== User Validators ====================

/**
 * Check if username is valid
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid username
 */
export const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Check if password is strong enough
 * @param {string} password - Password to validate
 * @returns {object} { valid, errors }
 */
export const isStrongPassword = (password) => {
    const errors = [];
    
    if (!password) {
        errors.push('Password is required');
        return { valid: false, errors };
    }
    
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

// ==================== Video Validators ====================

/**
 * Check if video URL is valid (YouTube or Vimeo)
 * @param {string} url - Video URL
 * @returns {object} { valid, type, videoId }
 */
export const isValidVideoUrl = (url) => {
    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    // Vimeo pattern
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    
    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return { valid: true, type: 'youtube', videoId: match[1] };
        }
    }
    
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) {
        return { valid: true, type: 'vimeo', videoId: vimeoMatch[1] };
    }
    
    return { valid: false, type: null, videoId: null };
};

// ==================== Form Validation Helpers ====================

/**
 * Create validation rules object
 * @param {object} rules - Validation rules
 * @returns {function} Validation function
 */
export const createValidator = (rules) => {
    return (values) => {
        const errors = {};
        
        Object.keys(rules).forEach(field => {
            const value = values[field];
            const fieldRules = rules[field];
            
            if (Array.isArray(fieldRules)) {
                fieldRules.forEach(rule => {
                    const error = rule(value, values);
                    if (error && !errors[field]) {
                        errors[field] = error;
                    }
                });
            } else {
                const error = fieldRules(value, values);
                if (error) {
                    errors[field] = error;
                }
            }
        });
        
        return errors;
    };
};

// Common validation rules
export const validationRules = {
    required: (fieldName) => (value) => {
        return isRequired(value) ? null : `${fieldName} is required`;
    },
    
    email: (fieldName) => (value) => {
        return isValidEmail(value) ? null : `Please enter a valid email address`;
    },
    
    minLength: (fieldName, min) => (value) => {
        return value && value.length >= min ? null : `${fieldName} must be at least ${min} characters`;
    },
    
    maxLength: (fieldName, max) => (value) => {
        return value && value.length <= max ? null : `${fieldName} must be at most ${max} characters`;
    },
    
    number: (fieldName) => (value) => {
        return isNumber(value) ? null : `${fieldName} must be a number`;
    },
    
    positive: (fieldName) => (value) => {
        return isPositiveNumber(value) ? null : `${fieldName} must be positive`;
    },
    
    currencyCode: () => (value) => {
        return isValidCurrencyCode(value) ? null : 'Currency code must be 3 uppercase letters';
    },
    
    passwordMatch: (fieldName, matchField) => (value, values) => {
        return value === values[matchField] ? null : `${fieldName} does not match`;
    }
};

export default {
    isRequired,
    isValidEmail,
    isValidPhone,
    isValidUrl,
    isNumber,
    isPositiveNumber,
    isInRange,
    isValidLength,
    matchesPattern,
    isValidCurrencyCode,
    isValidExchangeRate,
    isValidSpread,
    isValidUsername,
    isStrongPassword,
    isValidVideoUrl,
    createValidator,
    validationRules
};