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
    await pool.execute(
        `UPDATE branches 
         SET last_heartbeat = NOW(), 
             status = 'online',
             version = ?
         WHERE code = ?`,
        [req.body.version || 'v2.0', req.params.code]
    );
    res.json({ success: true });
});

module.exports = router;