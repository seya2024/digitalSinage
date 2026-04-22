const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

const getVideos = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const videos = await Video.getAll(activeOnly);
        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

const getActiveVideo = async (req, res) => {
    try {
        const videos = await Video.getAll(true);
        const activeVideo = videos && videos.length > 0 ? videos[0] : null;
        res.json({ success: true, data: activeVideo });
    } catch (error) {
        console.error('Get active video error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

const createVideo = async (req, res) => {
    try {
        console.log('📹 Received create video request');
        console.log('📝 Request body:', req.body);
        console.log('📁 File:', req.file);
        console.log('👤 User ID:', req.user?.id);
        
        // Prepare video data
        const videoData = { ...req.body };
        
        // Handle file upload
        if (req.file) {
            videoData.video_url = `/uploads/${req.file.filename}`;
            videoData.video_type = 'local';
            videoData.file_path = req.file.filename;
            console.log('📁 Local video file saved:', req.file.filename);
        }
        
        // Validate required fields
        if (!videoData.title) {
            // Clean up uploaded file if validation fails
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('🗑️ Cleaned up file after validation error:', filePath);
                }
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Title is required' 
            });
        }
        
        // For YouTube videos, URL is required
        if (videoData.video_type === 'youtube' && !videoData.video_url) {
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(400).json({ 
                success: false, 
                message: 'YouTube URL is required' 
            });
        }
        
        // For local videos, file is required
        if (videoData.video_type === 'local' && !req.file && !videoData.video_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Video file is required for local videos' 
            });
        }
        
        const videoId = await Video.create(videoData, req.user.id);
        
        res.json({ 
            success: true, 
            data: { id: videoId }, 
            message: 'Video created successfully' 
        });
    } catch (error) {
        console.error('❌ Create video error:', error);
        
        // Clean up uploaded file if error occurs
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ Cleaned up file after error:', filePath);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
};

const updateVideo = async (req, res) => {
    try {
        console.log('📹 Received update request for video:', req.params.id);
        console.log('📝 Request body:', req.body);
        console.log('📁 File:', req.file);
        
        // Get existing video to check for old file
        const existingVideo = await Video.getById(req.params.id);
        
        if (!existingVideo) {
            // Clean up uploaded file if video not found
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(404).json({ success: false, message: 'Video not found' });
        }
        
        // Prepare update data
        const videoData = { ...req.body };
        
        // Handle new file upload
        if (req.file) {
            // Delete old file if it exists
            if (existingVideo && existingVideo.file_path) {
                const oldFilePath = path.join(__dirname, '../uploads', existingVideo.file_path);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                    console.log('🗑️ Deleted old video file:', oldFilePath);
                }
            }
            
            videoData.video_url = `/uploads/${req.file.filename}`;
            videoData.video_type = 'local';
            videoData.file_path = req.file.filename;
            console.log('📁 New local video file saved:', req.file.filename);
        }
        
        const result = await Video.update(req.params.id, videoData);
        
        if (result) {
            res.json({ success: true, message: 'Video updated successfully' });
        } else {
            // Clean up uploaded file if update fails
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            res.status(404).json({ success: false, message: 'Video not found' });
        }
    } catch (error) {
        console.error('❌ Update video error:', error);
        
        // Clean up uploaded file if error occurs
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ Cleaned up file after error:', filePath);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
};

const deleteVideo = async (req, res) => {
    try {
        console.log('🗑️ Received delete request for video:', req.params.id);
        
        // Get video info to delete physical file
        const video = await Video.getById(req.params.id);
        
        const result = await Video.delete(req.params.id);
        
        if (result) {
            res.json({ success: true, message: 'Video deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Video not found' });
        }
    } catch (error) {
        console.error('❌ Delete video error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
};

module.exports = {
    getVideos,
    getActiveVideo,
    createVideo,
    updateVideo,
    deleteVideo
};