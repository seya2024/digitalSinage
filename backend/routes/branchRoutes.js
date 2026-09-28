const express = require('express');
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

module.exports = router;