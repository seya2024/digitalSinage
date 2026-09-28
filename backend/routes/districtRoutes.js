const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getAllDistricts,
    getDistrict,
    getDistrictBranches,
    createDistrict,
    updateDistrict,
    deleteDistrict
} = require('../controllers/districtController');

// Public
router.get('/', getAllDistricts);
router.get('/:id', getDistrict);
router.get('/:id/branches', getDistrictBranches);

// Admin only
router.post('/', protect, adminOnly, createDistrict);
router.put('/:id', protect, adminOnly, updateDistrict);
router.delete('/:id', protect, adminOnly, deleteDistrict);

module.exports = router;