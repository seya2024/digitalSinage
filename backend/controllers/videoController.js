const Video = require('../models/Video');

const getVideos = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const videos = await Video.getAll(activeOnly);
        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getActiveVideo = async (req, res) => {
    try {
        // Get only active video (status = 'active')
        const videos = await Video.getAll(true); // true = active only
        const activeVideo = videos && videos.length > 0 ? videos[0] : null;
        
        // Return null if no active video exists
        res.json({ success: true, data: activeVideo });
    } catch (error) {
        console.error('Get active video error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createVideo = async (req, res) => {
    try {
        const videoId = await Video.create(req.body, req.user.id);
        res.json({ success: true, data: { id: videoId }, message: 'Video created successfully' });
    } catch (error) {
        console.error('Create video error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateVideo = async (req, res) => {
    try {
        const result = await Video.update(req.params.id, req.body);
        if (result) {
            res.json({ success: true, message: 'Video updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Video not found' });
        }
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const result = await Video.delete(req.params.id);
        if (result) {
            res.json({ success: true, message: 'Video deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Video not found' });
        }
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getVideos,
    getActiveVideo,
    createVideo,
    updateVideo,
    deleteVideo
};