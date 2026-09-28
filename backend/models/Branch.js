const { pool } = require('../config/database');

class Branch {
    static async getAll(filters = {}) {
        let query = `
            SELECT b.*, d.name AS district_name, d.location_type
            FROM branches b
            LEFT JOIN districts d ON b.district_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.district_id) {
            query += ' AND b.district_id = ?';
            params.push(filters.district_id);
        }
        if (filters.grade) {
            query += ' AND b.grade = ?';
            params.push(filters.grade);
        }
        if (filters.search) {
            query += ' AND (b.name LIKE ? OR b.code LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY b.grade, b.name';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getByCode(code) {
        const [rows] = await pool.execute(
            `SELECT 
                b.id, b.code, b.name, b.grade, b.message,
                d.id AS district_id, d.name AS district_name,
                d.location_type, d.contact AS district_contact
             FROM branches b
             LEFT JOIN districts d ON b.district_id = d.id
             WHERE b.code = ?`,
            [code]
        );
        return rows[0];
    }

    static async create(data) {
        const { code, name, district_id, grade, message } = data;
        const [result] = await pool.execute(
            `INSERT INTO branches (code, name, district_id, grade, message)
             VALUES (?, ?, ?, ?, ?)`,
            [code, name, district_id || null, grade || 'V', message || null]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { code, name, district_id, grade, message } = data;
        const [result] = await pool.execute(
            `UPDATE branches 
             SET code = ?, name = ?, district_id = ?, grade = ?, message = ?
             WHERE id = ?`,
            [code, name, district_id, grade, message, id]
        );
        return result.affectedRows;
    }

    static async updateMessage(id, message) {
        const [result] = await pool.execute(
            'UPDATE branches SET message = ? WHERE id = ?',
            [message, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM branches WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Branch;