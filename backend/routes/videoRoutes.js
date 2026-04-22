const express = require('express');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
    getVideos,
    getActiveVideo,
    createVideo,
    updateVideo,
    deleteVideo
} = require('../controllers/videoController');

const router = express.Router();

router.get('/', getVideos);
router.get('/active', getActiveVideo);

router.post('/', protect, superAdminOnly, createVideo);
router.put('/:id', protect, superAdminOnly, updateVideo);
router.delete('/:id', protect, superAdminOnly, deleteVideo);

const path = require('path');
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
