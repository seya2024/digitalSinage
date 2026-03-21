const User = require('../models/User');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');  // Add this import

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        
        // Check if user exists
        const existing = await User.findByUsername(username);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        
        const userId = await User.create(username, password, email, role || 'admin');
        const newUser = await User.findById(userId);
        
        res.json({ success: true, data: newUser, message: 'User created successfully' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, email, role, is_active } = req.body;
        
        // Prevent changing own role to lower privilege
        const userToUpdate = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);
        
        if (req.params.id == req.user.id && role !== currentUser.role) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot change your own role' 
            });
        }
        
        await User.update(req.params.id, { username, email, role, is_active });
        const updatedUser = await User.findById(req.params.id);
        
        res.json({ success: true, data: updatedUser, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Prevent deleting the last super admin
        const [superAdmins] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE role = "super_admin"'
        );
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (user.role === 'super_admin' && superAdmins[0].count === 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete the last super admin user' 
            });
        }
        
        if (req.params.id == req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot delete your own account' 
            });
        }
        
        await User.delete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        await User.resetPassword(req.params.id);
        res.json({ success: true, message: 'Password reset to "password123"' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const userId = req.params.id;
        
        // Get user with password
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const user = users[0];
        
        // Verify current password
        const isValid = await bcrypt.compare(current_password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Update password
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    changePassword  // Make sure changePassword is exported
};