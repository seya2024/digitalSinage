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
            'SELECT id, username, email, role, is_active, last_login, created_at FROM users ORDER BY id'
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

    static async update(id, userData) {
        const { username, email, role, is_active } = userData;
        const [result] = await pool.execute(
            'UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
            [username, email, role, is_active, id]
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
}

module.exports = User;