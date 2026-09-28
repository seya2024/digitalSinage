const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getAllBranches,
    getBranchByCode,
    createBranch,
    updateBranch,
    updateBranchMessage,
    deleteBranch
} = require('../controllers/branchController');

// Public (TV dashboard uses /code/:code)
router.get('/', getAllBranches);
router.get('/code/:code', getBranchByCode);

// Admin only
router.post('/', protect, adminOnly, createBranch);
router.put('/:id', protect, adminOnly, updateBranch);
router.patch('/:id/message', protect, adminOnly, updateBranchMessage);
router.delete('/:id', protect, adminOnly, deleteBranch);
// routes/branchRoutes.js
router.post('/:code/heartbeat', async (req, res) => {
    try {
        const { code } = req.params;
        const { version } = req.body || {};
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const [result] = await pool.execute(
            `UPDATE branches
             SET last_heartbeat = NOW(),
                 tv_status = 'online',
                 tv_version = COALESCE(?, tv_version),
                 tv_ip = ?
             WHERE code = ?`,
            [version || null, ip, code]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.json({ success: true, message: 'Heartbeat recorded' });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;