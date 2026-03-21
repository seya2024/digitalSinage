const { pool } = require('../config/database');

class Video {
    static async getAll(activeOnly = true) {
        let query = `
            SELECT v.*, u.username as created_by_name
            FROM videos v
            LEFT JOIN users u ON v.created_by = u.id
        `;
        
        if (activeOnly) {
            query += ` WHERE v.status = 'active' 
                      AND (v.start_date IS NULL OR v.start_date <= CURDATE())
                      AND (v.end_date IS NULL OR v.end_date >= CURDATE())`;
        }
        
        query += ' ORDER BY v.display_order ASC, v.created_at DESC';
        
        const [rows] = await pool.execute(query);
        return rows;
    }

    static async getActiveVideo() {
        const videos = await this.getAll(true);
        return videos[0] || null;
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            `SELECT v.*, u.username as created_by_name
             FROM videos v
             LEFT JOIN users u ON v.created_by = u.id
             WHERE v.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async create(videoData, userId) {
        const { title, description, video_url, video_type, thumbnail_url, duration, display_order, start_date, end_date, status } = videoData;
        const [result] = await pool.execute(
            `INSERT INTO videos 
             (title, description, video_url, video_type, thumbnail_url, duration, display_order, start_date, end_date, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, video_url, video_type, thumbnail_url, duration, display_order || 0, start_date, end_date, status || 'active', userId]
        );
        return result.insertId;
    }

    static async update(id, videoData) {
        const { title, description, video_url, video_type, thumbnail_url, duration, status, display_order, start_date, end_date } = videoData;
        const [result] = await pool.execute(
            `UPDATE videos 
             SET title = ?, description = ?, video_url = ?, video_type = ?,
                 thumbnail_url = ?, duration = ?, status = ?, display_order = ?,
                 start_date = ?, end_date = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, description, video_url, video_type, thumbnail_url, duration, status, display_order, start_date, end_date, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM videos WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Video;