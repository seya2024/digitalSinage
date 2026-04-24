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
            
            // Build dynamic update query based on what fields are provided
            const updates = [];
            const values = [];
            
            // Only add fields that are actually provided (not undefined)
            if (videoData.title !== undefined) {
                updates.push('title = ?');
                values.push(videoData.title);
            }
            if (videoData.description !== undefined) {
                updates.push('description = ?');
                values.push(videoData.description || null);
            }
            if (videoData.video_url !== undefined) {
                updates.push('video_url = ?');
                values.push(videoData.video_url || null);
            }
            if (videoData.video_type !== undefined) {
                updates.push('video_type = ?');
                values.push(videoData.video_type);
            }
            if (videoData.thumbnail_url !== undefined) {
                updates.push('thumbnail_url = ?');
                values.push(videoData.thumbnail_url || null);
            }
            if (videoData.duration !== undefined) {
                updates.push('duration = ?');
                values.push(videoData.duration ? parseInt(videoData.duration) : null);
            }
            if (videoData.status !== undefined) {
                updates.push('status = ?');
                values.push(videoData.status);
                console.log('📹 Updating status to:', videoData.status);
            }
            if (videoData.display_order !== undefined) {
                updates.push('display_order = ?');
                values.push(videoData.display_order ? parseInt(videoData.display_order) : 0);
            }
            if (videoData.start_date !== undefined) {
                updates.push('start_date = ?');
                values.push(videoData.start_date || null);
            }
            if (videoData.end_date !== undefined) {
                updates.push('end_date = ?');
                values.push(videoData.end_date || null);
            }
            if (videoData.file_path !== undefined) {
                updates.push('file_path = ?');
                values.push(videoData.file_path || null);
            }
            
            // Always update the timestamp
            updates.push('updated_at = NOW()');
            
            // Check if there's anything to update
            if (updates.length === 1) {
                console.log('⚠️ No fields to update');
                return 0;
            }
            
            // Add the ID to values array
            values.push(id);
            
            // Build and execute query
            const query = `UPDATE videos SET ${updates.join(', ')} WHERE id = ?`;
            
            console.log('📹 Update query:', query);
            console.log('📹 Update values:', values);
            
            const [result] = await pool.execute(query, values);
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