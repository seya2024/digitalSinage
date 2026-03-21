const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Log received credentials (only for debugging, remove in production)
        console.log('Login attempt for username:', username);
        
        const user = await User.findByUsername(username);
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'User not found. Please check username or contact admin.' 
            });
        }
        
        console.log('User found, checking password...');
        const isValid = await User.validatePassword(password, user.password);
        
        if (!isValid) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid password. Please try again.' 
            });
        }
        
        await User.updateLastLogin(user.id);
        
        const token = generateToken(user.id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please check logs.' 
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { login, getMe };