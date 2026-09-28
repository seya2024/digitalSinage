const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();
const { protect, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');
const {
    getAllBranches,
    getBranchByCode,
    createBranch,
    updateBranch,
    updateBranchMessage,
    deleteBranch
} = require('../controllers/branchController');

/* ═══════════════════════════════════════════════════════════
   PUBLIC ROUTES (TV dashboard)
   ═══════════════════════════════════════════════════════════ */
router.get('/', getAllBranches);
router.get('/code/:code', getBranchByCode);

/* ═══════════════════════════════════════════════════════════
   TV HEARTBEAT — each TV pings every 60s
   ═══════════════════════════════════════════════════════════ */
router.post('/:code/heartbeat', async (req, res) => {
    try {
        const { code } = req.params;
        const { version } = req.body || {};

        // Clean IP — handles IPv6-mapped IPv4
        let ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
              || req.socket.remoteAddress
              || 'unknown';
        if (ip.startsWith('::ffff:')) ip = ip.substring(7);
        if (ip === '::1') ip = '127.0.0.1';

        const [result] = await pool.execute(
            `UPDATE branches
             SET last_heartbeat = NOW(),
                 status = 'online',
                 version = COALESCE(?, version),
                 tv_ip = ?
             WHERE code = ?`,
            [version || null, ip, code]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.json({ 
            success: true, 
            message: 'Heartbeat recorded',
            ip: ip
        });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/* ═══════════════════════════════════════════════════════════
   TV MONITOR — get all TV statuses (Super Admin only)
   ⚠️ MUST be BEFORE /:id routes
   ═══════════════════════════════════════════════════════════ */
router.get('/status/all', protect, superAdminOnly, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT b.id, b.code, b.name, b.grade,
                    d.name AS district_name,
                    b.last_heartbeat, b.status, b.version, b.tv_ip,
                    CASE
                        WHEN b.last_heartbeat IS NULL THEN 'never'
                        WHEN TIMESTAMPDIFF(MINUTE, b.last_heartbeat, NOW()) <= 3 THEN 'online'
                        WHEN TIMESTAMPDIFF(MINUTE, b.last_heartbeat, NOW()) <= 15 THEN 'warning'
                        ELSE 'offline'
                    END AS computed_status
             FROM branches b
             LEFT JOIN districts d ON b.district_id = d.id
             ORDER BY computed_status, d.name, b.name`
        );

        const stats = {
            total: rows.length,
            online: rows.filter(r => r.computed_status === 'online').length,
            warning: rows.filter(r => r.computed_status === 'warning').length,
            offline: rows.filter(r => r.computed_status === 'offline').length,
            never: rows.filter(r => r.computed_status === 'never').length,
        };

        res.json({ success: true, data: rows, stats });
    } catch (error) {
        console.error('Get TV status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/* ═══════════════════════════════════════════════════════════
   ADMIN ROUTES
   ═══════════════════════════════════════════════════════════ */
router.post('/', protect, adminOnly, createBranch);
router.put('/:id', protect, adminOnly, updateBranch);
router.patch('/:id/message', protect, adminOnly, updateBranchMessage);
router.delete('/:id', protect, adminOnly, deleteBranch);

module.exports = router;