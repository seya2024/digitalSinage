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
        try {
            console.log('📹 Creating video with data:', JSON.stringify(videoData, null, 2));
            console.log('👤 Created by user ID:', userId);
            
            const { 
                title, 
                description, 
                video_url, 
                video_type, 
                thumbnail_url, 
                duration, 
                display_order, 
                start_date, 
                end_date, 
                status 
            } = videoData;
            
            // Validate required fields
            if (!title) {
                throw new Error('Title is required');
            }
            if (!video_url) {
                throw new Error('Video URL is required');
            }
            
            // Prepare values with defaults
            const values = [
                title,
                description || null,
                video_url,
                video_type || 'youtube',
                thumbnail_url || null,
                duration ? parseInt(duration) : null,
                display_order ? parseInt(display_order) : 0,
                start_date || null,
                end_date || null,
                status || 'active',
                userId
            ];
            
            console.log('📝 SQL Values:', values);
            
            const [result] = await pool.execute(
                `INSERT INTO videos 
                 (title, description, video_url, video_type, thumbnail_url, duration, display_order, start_date, end_date, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                values
            );
            
            console.log('✅ Video created with ID:', result.insertId);
            return result.insertId;
            
        } catch (error) {
            console.error('❌ Error creating video:', error);
            throw error;
        }
    }

    static async update(id, videoData) {
        try {
            console.log('📹 Updating video:', id);
            console.log('📝 Update data:', JSON.stringify(videoData, null, 2));
            
            const { 
                title, 
                description, 
                video_url, 
                video_type, 
                thumbnail_url,
                duration, 
                status, 
                display_order, 
                start_date, 
                end_date 
            } = videoData;
            
            const [result] = await pool.execute(
                `UPDATE videos 
                 SET title = ?, 
                     description = ?, 
                     video_url = ?, 
                     video_type = ?,
                     thumbnail_url = ?,
                     duration = ?, 
                     status = ?, 
                     display_order = ?,
                     start_date = ?,
                     end_date = ?,
                     updated_at = NOW()
                 WHERE id = ?`,
                [
                    title, 
                    description || null, 
                    video_url, 
                    video_type, 
                    thumbnail_url || null,
                    duration ? parseInt(duration) : null, 
                    status, 
                    display_order ? parseInt(display_order) : 0,
                    start_date || null,
                    end_date || null,
                    id
                ]
            );
            
            console.log('✅ Video updated, affected rows:', result.affectedRows);
            return result.affectedRows;
            
        } catch (error) {
            console.error('❌ Error updating video:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            console.log('🗑️ Deleting video:', id);
            const [result] = await pool.execute('DELETE FROM videos WHERE id = ?', [id]);
            console.log('✅ Video deleted, affected rows:', result.affectedRows);
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error deleting video:', error);
            throw error;
        }
    }
}

module.exports = Video;