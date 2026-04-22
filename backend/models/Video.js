const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

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
                status,
                file_path
            } = videoData;
            
            // Validate required fields
            if (!title) {
                throw new Error('Title is required');
            }
            if (!video_url && video_type !== 'local') {
                throw new Error('Video URL is required');
            }
            if (video_type === 'local' && !video_url && !file_path) {
                throw new Error('Video file is required for local videos');
            }
            
            // Prepare values with defaults
            const values = [
                title,
                description || null,
                video_url || null,
                video_type || 'youtube',
                thumbnail_url || null,
                duration ? parseInt(duration) : null,
                display_order ? parseInt(display_order) : 0,
                start_date || null,
                end_date || null,
                status || 'active',
                userId,
                file_path || null
            ];
            
            console.log('📝 SQL Values:', values);
            
            const [result] = await pool.execute(
                `INSERT INTO videos 
                 (title, description, video_url, video_type, thumbnail_url, duration, display_order, start_date, end_date, status, created_by, file_path)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                end_date,
                file_path
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
                     file_path = ?,
                     updated_at = NOW()
                 WHERE id = ?`,
                [
                    title, 
                    description || null, 
                    video_url || null, 
                    video_type, 
                    thumbnail_url || null,
                    duration ? parseInt(duration) : null, 
                    status, 
                    display_order ? parseInt(display_order) : 0,
                    start_date || null,
                    end_date || null,
                    file_path || null,
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
            
            // Get file path before deleting
            const [video] = await pool.execute('SELECT file_path FROM videos WHERE id = ?', [id]);
            
            // Delete physical file if exists
            if (video[0] && video[0].file_path) {
                const uploadsDir = path.join(__dirname, '../../uploads');
                const filePath = path.join(uploadsDir, video[0].file_path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('🗑️ Deleted file:', filePath);
                }
            }
            
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