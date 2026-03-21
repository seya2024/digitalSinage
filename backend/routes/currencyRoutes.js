const express = require('express');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
    getCurrencies,
    getCurrency,
    requestAddCurrency,
    requestUpdateRate,
    requestDeleteCurrency,
    getPendingChanges,
    approveChange,
    rejectChange,
    getRateHistory
} = require('../controllers/currencyController');

const router = express.Router();

router.get('/', getCurrencies);
router.get('/:id', getCurrency);
router.get('/:currencyId/history', getRateHistory);

router.post('/request-add', protect, requestAddCurrency);
router.post('/request-update', protect, requestUpdateRate);
router.post('/request-delete', protect, requestDeleteCurrency);

router.get('/pending/changes', protect, superAdminOnly, getPendingChanges);
router.post('/pending/:id/approve', protect, superAdminOnly, approveChange);
router.post('/pending/:id/reject', protect, superAdminOnly, rejectChange);
router.get('/:currencyId/history', getRateHistory);

module.exports = router;