const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getVideos,
    getActiveVideo,
    createVideo,
    updateVideo,
    deleteVideo
} = require('../controllers/videoController');
const upload = require('../middleware/upload');         // ⭐ REQUIRED for file uploads

/* ─── Public routes ─── */
router.get('/', getVideos);
router.get('/active', getActiveVideo);

/* ─── Admin routes with multer for file uploads ─── */
router.post('/', protect, adminOnly, upload.single('video'), createVideo);    // ⭐ multer here
router.put('/:id', protect, adminOnly, upload.single('video'), updateVideo);  // ⭐ and here
router.delete('/:id', protect, adminOnly, deleteVideo);

module.exports = router;