/**
 * Application constants
 */

// ==================== API Endpoints ====================
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    CHANGE_PASSWORD: '/auth/change-password',
    GET_ME: '/auth/me',
    
    // Currencies
    CURRENCIES: '/currencies',
    CURRENCY: (id) => `/currencies/${id}`,
    CURRENCY_HISTORY: (id) => `/currencies/${id}/history`,
    PENDING_CHANGES: '/currencies/pending/changes',
    APPROVE_CHANGE: (id) => `/currencies/pending/${id}/approve`,
    REJECT_CHANGE: (id) => `/currencies/pending/${id}/reject`,
    
    // Videos
    VIDEOS: '/videos',
    ACTIVE_VIDEO: '/videos/active',
    
    // Users
    USERS: '/users',
    USER: (id) => `/users/${id}`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`
};

// ==================== App Settings ====================
export const APP_CONFIG = {
    NAME: 'Dashen Bank Exchange Rate System',
    VERSION: '2.0.0',
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    DEFAULT_REFRESH_INTERVAL: 30000, // 30 seconds
    TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
    DEFAULT_CURRENCY_DECIMALS: 4,
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm:ss',
    TIMEZONE: 'Africa/Addis_Ababa'
};

// ==================== User Roles ====================
export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin'
};

export const ROLE_LABELS = {
    [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
    [USER_ROLES.ADMIN]: 'Administrator'
};

export const ROLE_PERMISSIONS = {
    [USER_ROLES.SUPER_ADMIN]: ['*'], // All permissions
    [USER_ROLES.ADMIN]: [
        'view_rates',
        'request_rate_update',
        'request_add_currency',
        'view_profile',
        'edit_profile'
    ]
};

// ==================== Currency Constants ====================
export const CURRENCY_CODES = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    JPY: 'JPY',
    CNY: 'CNY',
    SAR: 'SAR',
    AUD: 'AUD',
    CAD: 'CAD',
    CHF: 'CHF',
    AED: 'AED'
};

export const CURRENCY_SYMBOLS = {
    [CURRENCY_CODES.USD]: '$',
    [CURRENCY_CODES.EUR]: '€',
    [CURRENCY_CODES.GBP]: '£',
    [CURRENCY_CODES.JPY]: '¥',
    [CURRENCY_CODES.CNY]: '¥',
    [CURRENCY_CODES.SAR]: '﷼',
    [CURRENCY_CODES.AUD]: 'A$',
    [CURRENCY_CODES.CAD]: 'C$',
    [CURRENCY_CODES.CHF]: 'CHF',
    [CURRENCY_CODES.AED]: 'د.إ'
};

export const CURRENCY_FLAGS = {
    [CURRENCY_CODES.USD]: 'us',
    [CURRENCY_CODES.EUR]: 'eu',
    [CURRENCY_CODES.GBP]: 'gb',
    [CURRENCY_CODES.JPY]: 'jp',
    [CURRENCY_CODES.CNY]: 'cn',
    [CURRENCY_CODES.SAR]: 'sa',
    [CURRENCY_CODES.AUD]: 'au',
    [CURRENCY_CODES.CAD]: 'ca',
    [CURRENCY_CODES.CHF]: 'ch',
    [CURRENCY_CODES.AED]: 'ae'
};

// ==================== Subject Types ====================
export const SUBJECT_TYPES = {
    CORE: 'core',
    ELECTIVE: 'elective',
    PRACTICAL: 'practical',
    LANGUAGE: 'language'
};

export const SUBJECT_TYPE_LABELS = {
    [SUBJECT_TYPES.CORE]: 'Core Subject',
    [SUBJECT_TYPES.ELECTIVE]: 'Elective',
    [SUBJECT_TYPES.PRACTICAL]: 'Practical',
    [SUBJECT_TYPES.LANGUAGE]: 'Language'
};

// ==================== Video Types ====================
export const VIDEO_TYPES = {
    YOUTUBE: 'youtube',
    VIMEO: 'vimeo',
    LOCAL: 'local'
};

export const VIDEO_TYPE_LABELS = {
    [VIDEO_TYPES.YOUTUBE]: 'YouTube',
    [VIDEO_TYPES.VIMEO]: 'Vimeo',
    [VIDEO_TYPES.LOCAL]: 'Local'
};

// ==================== Change Types ====================
export const CHANGE_TYPES = {
    ADD_CURRENCY: 'add_currency',
    UPDATE_RATE: 'update_rate',
    DELETE_CURRENCY: 'delete_currency'
};

export const CHANGE_TYPE_LABELS = {
    [CHANGE_TYPES.ADD_CURRENCY]: 'New Currency Request',
    [CHANGE_TYPES.UPDATE_RATE]: 'Rate Update Request',
    [CHANGE_TYPES.DELETE_CURRENCY]: 'Deletion Request'
};

export const CHANGE_TYPE_COLORS = {
    [CHANGE_TYPES.ADD_CURRENCY]: '#10b981',
    [CHANGE_TYPES.UPDATE_RATE]: '#f59e0b',
    [CHANGE_TYPES.DELETE_CURRENCY]: '#ef4444'
};

// ==================== Approval Status ====================
export const APPROVAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

export const APPROVAL_STATUS_LABELS = {
    [APPROVAL_STATUS.PENDING]: 'Pending',
    [APPROVAL_STATUS.APPROVED]: 'Approved',
    [APPROVAL_STATUS.REJECTED]: 'Rejected'
};

export const APPROVAL_STATUS_COLORS = {
    [APPROVAL_STATUS.PENDING]: '#f59e0b',
    [APPROVAL_STATUS.APPROVED]: '#10b981',
    [APPROVAL_STATUS.REJECTED]: '#ef4444'
};

// ==================== HTTP Status Codes ====================
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
};

// ==================== Local Storage Keys ====================
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    SETTINGS: 'app_settings',
    THEME: 'theme_preference'
};

// ==================== Date Formats ====================
export const DATE_FORMATS = {
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_LONG: 'DD MMMM YYYY',
    DISPLAY_FULL: 'DD MMMM YYYY, HH:mm',
    API: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    TIME_SHORT: 'HH:mm',
    DATETIME: 'YYYY-MM-DD HH:mm:ss'
};

// ==================== Pagination ====================
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [5, 10, 20, 50, 100]
};

// ==================== Messages ====================
export const MESSAGES = {
    // Success messages
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    RATE_UPDATED: 'Rate update requested successfully',
    CURRENCY_ADDED: 'Currency addition requested successfully',
    CURRENCY_DELETED: 'Currency deletion requested successfully',
    VIDEO_ADDED: 'Video added successfully',
    VIDEO_UPDATED: 'Video updated successfully',
    VIDEO_DELETED: 'Video deleted successfully',
    
    // Error messages
    LOGIN_FAILED: 'Invalid username or password',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    SESSION_EXPIRED: 'Session expired. Please login again',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please check the form for errors',
    
    // Confirmation messages
    CONFIRM_DELETE: 'Are you sure you want to delete this item?',
    CONFIRM_DELETE_CURRENCY: 'Are you sure you want to delete this currency? This action cannot be undone.',
    CONFIRM_LOGOUT: 'Are you sure you want to logout?'
};

// ==================== Validation Constants ====================
export const VALIDATION = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 6,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15,
    CURRENCY_CODE_LENGTH: 3,
    RATE_MIN: 0,
    RATE_MAX: 1000000
};

// ==================== UI Constants ====================
export const UI = {
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark'
    },
    SIDEBAR_WIDTH: 260,
    SIDEBAR_COLLAPSED_WIDTH: 70,
    HEADER_HEIGHT: 64,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500
};

// ==================== Country Codes for Flags ====================
export const FLAG_CODES = {
    'USD': 'us',
    'EUR': 'eu',
    'GBP': 'gb',
    'JPY': 'jp',
    'CNY': 'cn',
    'SAR': 'sa',
    'AUD': 'au',
    'CAD': 'ca',
    'CHF': 'ch',
    'AED': 'ae',
    'INR': 'in',
    'ZAR': 'za',
    'KES': 'ke'
};

export default {
    API_ENDPOINTS,
    APP_CONFIG,
    USER_ROLES,
    ROLE_LABELS,
    ROLE_PERMISSIONS,
    CURRENCY_CODES,
    CURRENCY_SYMBOLS,
    CURRENCY_FLAGS,
    SUBJECT_TYPES,
    SUBJECT_TYPE_LABELS,
    VIDEO_TYPES,
    VIDEO_TYPE_LABELS,
    CHANGE_TYPES,
    CHANGE_TYPE_LABELS,
    CHANGE_TYPE_COLORS,
    APPROVAL_STATUS,
    APPROVAL_STATUS_LABELS,
    APPROVAL_STATUS_COLORS,
    HTTP_STATUS,
    STORAGE_KEYS,
    DATE_FORMATS,
    PAGINATION,
    MESSAGES,
    VALIDATION,
    UI,
    FLAG_CODES
};