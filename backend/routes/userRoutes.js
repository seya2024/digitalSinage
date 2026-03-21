const express = require('express');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    changePassword  // Add this import
} = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication and super admin role
router.use(protect);
router.use(superAdminOnly);

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetPassword);
router.post('/:id/change-password', changePassword);  // Add this route

module.exports = router;