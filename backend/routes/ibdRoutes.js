/**
 * IBD Routes - International Banking Department
 * 
 * These routes handle direct currency and rate management operations.
 * All routes require authentication and IBD role or higher (IBD, Admin, Super Admin)
 * 
 * Access Levels:
 * - IBD: Can update rates, add currencies, view history, generate reports
 * - Admin: Same access as IBD plus user management
 * - Super Admin: Full system access
 */

const express = require('express');
const { protect, adminOrIbd } = require('../middleware/authMiddleware');
const {
    getCurrenciesForIBD,    // Get all currencies with detailed IBD view
    updateDailyRate,        // Update single currency rate
    bulkUpdateRates,        // Update multiple currencies at once
    addCurrency,            // Add new currency directly
    getRateHistory,         // Get detailed rate history for a currency
    getDailyReport          // Get daily rate update report
} = require('../controllers/ibdController');

const router = express.Router();

// ============================================
// MIDDLEWARE - Apply to all routes in this file
// ============================================
// All routes require:
// 1. Authentication (valid JWT token)
// 2. IBD role or higher (IBD, Admin, Super Admin)
router.use(protect);
router.use(adminOrIbd);

// ============================================
// IBD ROUTES
// ============================================

/**
 * GET /api/v1/ibd/currencies
 * Get all currencies with IBD-specific details
 * Includes: current rates, buy/sell rates, last updated info, previous rates
 */
router.get('/currencies', getCurrenciesForIBD);

/**
 * PUT /api/v1/ibd/update-rate
 * Update a single currency's exchange rate
 * Body: { currencyId, rate, buyRate, sellRate, notes }
 */
router.put('/update-rate', updateDailyRate);

/**
 * POST /api/v1/ibd/bulk-update
 * Update multiple currencies at once
 * Body: { updates: [{ currencyId, rate, buyRate, sellRate, notes }] }
 */
router.post('/bulk-update', bulkUpdateRates);

/**
 * POST /api/v1/ibd/currency
 * Add a new currency to the system
 * Body: { code, name, symbol, current_rate, buy_rate, sell_rate }
 */
router.post('/currency', addCurrency);

/**
 * GET /api/v1/ibd/history/:currencyId
 * Get detailed rate history for a specific currency
 * Query params: days (default: 30), limit (default: 100)
 */
router.get('/history/:currencyId', getRateHistory);

/**
 * GET /api/v1/ibd/daily-report
 * Get daily report of rate updates
 * Query params: date (default: today)
 */
router.get('/daily-report', getDailyReport);

module.exports = router;