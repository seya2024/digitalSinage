const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Super Admin only (full access, can approve/reject changes)
const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as super admin' });
    }
};

// Admin only (regular admin or super admin)
const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
};

// IBD or higher (IBD, Admin, Super Admin)
// IBD can add currencies and update exchange rates
const ibdOrHigher = (req, res, next) => {
    if (req.user && (req.user.role === 'ibd' || req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized. IBD role or higher required.' });
    }
};

module.exports = { protect, superAdminOnly, adminOnly, ibdOrHigher };