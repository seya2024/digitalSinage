const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
            [username]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, username, email, role, is_active, last_login, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, username, email, role, is_active, last_login, created_at FROM users ORDER BY id DESC'
        );
        return rows;
    }

    static async create(username, password, email, role = 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, role]
        );
        return result.insertId;
    }

    // Register a new user (by super admin)
    static async register(username, password, email, role, createdBy) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if username already exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existing.length > 0) {
            throw new Error('Username already exists');
        }
        
        // Validate role
        const allowedRoles = ['admin', 'ibd'];
        if (role && !allowedRoles.includes(role)) {
            throw new Error('Invalid role. Allowed roles: admin, ibd');
        }
        
        const [result] = await pool.execute(
            `INSERT INTO users (username, password, email, role, created_by, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [username, hashedPassword, email, role || 'ibd', createdBy]
        );
        
        return result.insertId;
    }

    static async update(id, userData) {
        const { username, email, role, is_active } = userData;
        const [result] = await pool.execute(
            'UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
            [username, email, role, is_active, id]
        );
        return result.affectedRows;
    }

    // Update user role only
    static async updateRole(userId, role) {
        // Validate role
        const allowedRoles = ['admin', 'ibd', 'super_admin'];
        if (!allowedRoles.includes(role)) {
            throw new Error('Invalid role');
        }
        
        const [result] = await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );
        return result.affectedRows;
    }

    // Toggle user active status
    static async toggleStatus(userId, isActive) {
        const [result] = await pool.execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [isActive, userId]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async resetPassword(id, newPassword = 'password123') {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows;
    }

    static async updateLastLogin(id) {
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [id]
        );
    }

    static async validatePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    
    // Get users by role
    static async findByRole(role) {
        const [rows] = await pool.execute(
            'SELECT id, username, email, role, is_active, last_login, created_at FROM users WHERE role = ?',
            [role]
        );
        return rows;
    }
    
    // Get count of users by role
    static async getCountByRole() {
        const [rows] = await pool.execute(
            'SELECT role, COUNT(*) as count FROM users WHERE is_active = TRUE GROUP BY role'
        );
        return rows;
    }
}

module.exports = User;