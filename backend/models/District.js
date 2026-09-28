const { pool } = require('../config/database');

class District {
    // ⭐ REQUIRED METHOD — Controller calls District.getAll()
    static async getAll() {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    d.id,
                    d.name,
                    d.location_type,
                    d.contact,
                    d.created_at,
                    d.updated_at,
                    COUNT(b.id) AS branch_count
                 FROM districts d
                 LEFT JOIN branches b ON b.district_id = d.id
                 GROUP BY d.id
                 ORDER BY d.location_type, d.name`
            );
            return rows;
        } catch (error) {
            console.error('District.getAll error:', error);
            throw error;
        }
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            `SELECT 
                d.id, d.name, d.location_type, d.contact,
                (SELECT COUNT(*) FROM branches WHERE district_id = d.id) AS branch_count
             FROM districts d
             WHERE d.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async getBranches(id) {
        const [rows] = await pool.execute(
            `SELECT id, code, name, grade, message
             FROM branches
             WHERE district_id = ?
             ORDER BY grade, name`,
            [id]
        );
        return rows;
    }

    static async create(data) {
        const { name, location_type, contact } = data;
        const [result] = await pool.execute(
            `INSERT INTO districts (name, location_type, contact) 
             VALUES (?, ?, ?)`,
            [name, location_type || 'upcountry', contact || null]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, location_type, contact } = data;
        const [result] = await pool.execute(
            `UPDATE districts 
             SET name = ?, location_type = ?, contact = ?
             WHERE id = ?`,
            [name, location_type, contact, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM districts WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = District;