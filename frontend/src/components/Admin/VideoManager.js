import React, { useState, useEffect } from 'react';
import { videoService } from '../../services/videoService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import Alert from '../common/Alert';
import './VideoManager.css';

/* ⭐ API base URL — used to build full URLs for local videos */
const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/**
 * Convert a stored video_url into a fully-qualified URL.
 */
const getPlayableUrl = (url, type) => {
    if (!url) return '';
    if (type === 'youtube') return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
        const clean = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE}${clean}`;
    }
    return `${API_BASE}/${url}`;
};

const VideoManager = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        videoId: null,
        videoTitle: '',
        newStatus: null,
        title: '',
        message: '',
        confirmText: '',
        confirmVariant: '',
        icon: ''
    });

    const [newVideo, setNewVideo] = useState({
        title: '',
        description: '',
        video_url: '',
        video_type: 'youtube',
        duration: '',
        status: 'active',
        display_order: 0,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const response = await videoService.getAll(false);
            if (response && response.success) {
                setVideos(response.data || []);
            } else {
                console.error('Failed to load videos:', response);
                showMessage('error', response?.message || 'Failed to load videos');
            }
        } catch (error) {
            console.error('Load videos error:', error);
            showMessage('error', error.response?.data?.message || 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    /* ─── YouTube helpers ─── */
    const validateYouTubeUrl = (url) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    };

    const extractYouTubeVideoId = (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : null;
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
            return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&cc_load_policy=0`;
        }
        return url;
    };

    /* ─── File select ─── */
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('error', 'Only MP4, WebM, and OGG video files are allowed');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showMessage('error', 'File size must be less than 100MB');
            return;
        }

        setSelectedFile(file);

        setNewVideo((prev) => ({
            ...prev,
            video_url: URL.createObjectURL(file),
            video_type: 'local'
        }));
    };

    /* ─── Add video ─── */
    const handleAddVideo = async () => {
        const trimmedTitle = newVideo.title.trim();
        if (!trimmedTitle) {
            showMessage('error', 'Please enter a video title');
            return;
        }

        if (newVideo.video_type === 'youtube') {
            if (!newVideo.video_url || newVideo.video_url.trim() === '') {
                showMessage('error', 'Please enter a YouTube URL');
                return;
            }
            if (!validateYouTubeUrl(newVideo.video_url)) {
                showMessage('error', 'Please enter a valid YouTube URL');
                return;
            }
        }

        if (newVideo.video_type === 'local' && !selectedFile) {
            showMessage('error', 'Please select a video file to upload');
            return;
        }

        setUploading(true);

        try {
            let response;

            if (newVideo.video_type === 'local' && selectedFile) {
                const formData = new FormData();
                formData.append('title', trimmedTitle);
                formData.append('description', newVideo.description || '');
                formData.append('video_type', 'local');
                formData.append('status', newVideo.status);
                formData.append('display_order', String(newVideo.display_order || 0));
                formData.append('start_date', newVideo.start_date || '');
                formData.append('end_date', newVideo.end_date || '');
                formData.append('video', selectedFile);

                for (let pair of formData.entries()) {
                    console.log('FormData:', pair[0], pair[1] instanceof File ? pair[1].name : pair[1]);
                }

                response = await videoService.createWithFile(formData);
            } else {
                const videoData = {
                    title: trimmedTitle,
                    description: newVideo.description || '',
                    video_url: newVideo.video_url.trim(),
                    video_type: 'youtube',
                    duration: newVideo.duration || null,
                    status: newVideo.status,
                    display_order: parseInt(newVideo.display_order) || 0,
                    start_date: newVideo.start_date || null,
                    end_date: newVideo.end_date || null
                };
                response = await videoService.create(videoData);
            }

            if (response && response.success) {
                showMessage('success', 'Video added successfully');
                setShowAddForm(false);
                setNewVideo({
                    title: '',
                    description: '',
                    video_url: '',
                    video_type: 'youtube',
                    duration: '',
                    status: 'active',
                    display_order: 0,
                    start_date: '',
                    end_date: ''
                });
                setSelectedFile(null);
                await loadVideos();
            } else {
                showMessage('error', response?.message || 'Failed to add video');
            }
        } catch (error) {
            console.error('Add video error:', error);
            let errorMsg = 'Failed to add video. ';
            if (error.response) {
                errorMsg += error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMsg += 'No response from server. Please check if backend is running.';
            } else {
                errorMsg += error.message || 'Unknown error occurred.';
            }
            showMessage('error', errorMsg);
        } finally {
            setUploading(false);
        }
    };

    /* ─── Update video ─── */
    const handleUpdateVideo = async () => {
        if (!editingVideo.title || editingVideo.title.trim() === '') {
            showMessage('error', 'Please enter a video title');
            return;
        }

        if (editingVideo.video_type === 'youtube' && editingVideo.video_url) {
            if (!validateYouTubeUrl(editingVideo.video_url)) {
                showMessage('error', 'Please enter a valid YouTube URL');
                return;
            }
        }

        try {
            const updateData = {
                title: editingVideo.title.trim(),
                description: editingVideo.description || '',
                video_type: editingVideo.video_type,
                status: editingVideo.status,
                display_order: parseInt(editingVideo.display_order) || 0,
                start_date: editingVideo.start_date || null,
                end_date: editingVideo.end_date || null
            };

            if (editingVideo.video_type === 'youtube') {
                updateData.video_url = editingVideo.video_url.trim();
            }

            const response = await videoService.update(editingVideo.id, updateData);

            if (response && response.success) {
                showMessage('success', 'Video updated successfully');
                setEditingVideo(null);
                await loadVideos();
            } else {
                showMessage('error', response?.message || 'Failed to update video');
            }
        } catch (error) {
            console.error('Update video error:', error);
            showMessage('error', error.response?.data?.message || 'Failed to update video');
        }
    };

    /* ─── Delete ─── */
    const handleDeleteClick = (id, title) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            videoId: id,
            videoTitle: title,
            title: 'Delete Video',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            confirmText: 'Yes, Delete',
            confirmVariant: 'danger',
            icon: 'trash-alt'
        });
    };

    const handleDeleteVideo = async () => {
        const { videoId, videoTitle } = confirmModal;
        try {
            const response = await videoService.delete(videoId);
            if (response && response.success) {
                showMessage('success', `Video "${videoTitle}" deleted successfully`);
                await loadVideos();
            } else {
                showMessage('error', response?.message || 'Failed to delete video');
            }
        } catch (error) {
            console.error('Delete video error:', error);
            showMessage('error', error.response?.data?.message || 'Failed to delete video');
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    /* ─── Toggle status ─── */
    const handleToggleClick = (video) => {
        const newStatus = video.status === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? 'enable' : 'disable';

        setConfirmModal({
            isOpen: true,
            type: 'toggle',
            videoId: video.id,
            videoTitle: video.title,
            newStatus,
            title: `${action === 'enable' ? 'Enable' : 'Disable'} Video`,
            message: `Are you sure you want to ${action} "${video.title}"?`,
            confirmText: `Yes, ${action === 'enable' ? 'Enable' : 'Disable'}`,
            confirmVariant: action === 'enable' ? 'success' : 'warning',
            icon: action === 'enable' ? 'check-circle' : 'exclamation-triangle'
        });
    };

    const handleToggleStatus = async () => {
        const { videoId, newStatus } = confirmModal;
        const action = newStatus === 'active' ? 'enable' : 'disable';

        try {
            const response = await videoService.toggleStatus(videoId, newStatus);
            if (response && response.success) {
                showMessage('success', `Video ${action}d successfully`);
                await loadVideos();
            } else {
                showMessage('error', response?.message || `Failed to ${action} video`);
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            showMessage('error', `Failed to ${action} video`);
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const handleConfirmAction = () => {
        if (confirmModal.type === 'delete') {
            handleDeleteVideo();
        } else if (confirmModal.type === 'toggle') {
            handleToggleStatus();
        }
    };

    const activeVideosCount = videos.filter(v => v && v.status === 'active').length;

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading videos...</p>
            </div>
        );
    }

    return (
        <div className="video-manager-modern">
            <div className="video-header">
                <div className="header-info">
                    <h2>
                        <i className="fas fa-video"></i>
                        Video Manager
                    </h2>
                    <p className="header-description">Manage YouTube links and local video uploads for TV dashboard</p>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <i className="fas fa-play-circle"></i>
                        <span>{activeVideosCount} Active</span>
                    </div>
                    <div className="stat-chip">
                        <i className="fas fa-list"></i>
                        <span>{videos.length} Total</span>
                    </div>
                    <Button variant="primary" icon="plus" onClick={() => setShowAddForm(true)}>
                        Add Video
                    </Button>
                </div>
            </div>

            {message.text && (
                <Alert
                    type={message.type}
                    message={message.text}
                    dismissible
                    onClose={() => setMessage({ type: '', text: '' })}
                />
            )}

            <div className="search-section">
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="clear-search">
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Add Video Modal ─── */}
            <Modal
                isOpen={showAddForm}
                onClose={() => {
                    setShowAddForm(false);
                    setSelectedFile(null);
                    setNewVideo({
                        title: '',
                        description: '',
                        video_url: '',
                        video_type: 'youtube',
                        duration: '',
                        status: 'active',
                        display_order: 0,
                        start_date: '',
                        end_date: ''
                    });
                }}
                title={{ text: 'Add New Video', icon: 'plus-circle' }}
                size="lg"
                footer={
                    <>
                        <Button variant="success" onClick={handleAddVideo} icon="save" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Add Video'}
                        </Button>
                        <Button variant="secondary" onClick={() => {
                            setShowAddForm(false);
                            setSelectedFile(null);
                        }}>
                            Cancel
                        </Button>
                    </>
                }
            >
                <div className="video-form">
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={newVideo.title}
                                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                placeholder="Enter video title"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Video Source *</label>
                            <div className="source-tabs">
                                <button
                                    type="button"
                                    className={`source-tab ${newVideo.video_type === 'youtube' ? 'active' : ''}`}
                                    onClick={() => {
                                        setNewVideo({ ...newVideo, video_type: 'youtube', video_url: '' });
                                        setSelectedFile(null);
                                    }}
                                >
                                    <i className="fab fa-youtube"></i> YouTube Link
                                </button>
                                <button
                                    type="button"
                                    className={`source-tab ${newVideo.video_type === 'local' ? 'active' : ''}`}
                                    onClick={() => {
                                        setNewVideo({ ...newVideo, video_type: 'local', video_url: '' });
                                    }}
                                >
                                    <i className="fas fa-upload"></i> Upload Video
                                </button>
                            </div>
                        </div>
                    </div>

                    {newVideo.video_type === 'youtube' ? (
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>YouTube URL *</label>
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={newVideo.video_url}
                                    onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                                />
                                <small className="field-hint">
                                    Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
                                </small>
                            </div>
                        </div>
                    ) : (
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Upload Video File *</label>
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        id="video-file"
                                        accept="video/mp4,video/webm,video/ogg"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="video-file" className="file-upload-label">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        {selectedFile ? selectedFile.name : 'Click or drag to select video file'}
                                    </label>
                                    <small className="field-hint">
                                        Supported formats: MP4, WebM, OGG (Max: 100MB)
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                rows="3"
                                value={newVideo.description}
                                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                placeholder="Enter video description (optional)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Display Order</label>
                            <input
                                type="number"
                                value={newVideo.display_order}
                                onChange={(e) => setNewVideo({ ...newVideo, display_order: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={newVideo.status}
                                onChange={(e) => setNewVideo({ ...newVideo, status: e.target.value })}
                            >
                                <option value="active">Active (Show on TV)</option>
                                <option value="inactive">Inactive (Hidden)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date (Optional)</label>
                            <input
                                type="date"
                                value={newVideo.start_date}
                                onChange={(e) => setNewVideo({ ...newVideo, start_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date (Optional)</label>
                            <input
                                type="date"
                                value={newVideo.end_date}
                                onChange={(e) => setNewVideo({ ...newVideo, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    {newVideo.video_type === 'youtube' && newVideo.video_url && validateYouTubeUrl(newVideo.video_url) && (
                        <div className="video-preview">
                            <h4>Preview</h4>
                            <div className="preview-container">
                                <iframe
                                    src={getYouTubeEmbedUrl(newVideo.video_url)}
                                    title="Video Preview"
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {newVideo.video_type === 'local' && selectedFile && (
                        <div className="video-preview">
                            <h4>Preview</h4>
                            <div className="preview-container">
                                <video
                                    controls
                                    preload="metadata"
                                    style={{ width: '100%', maxHeight: '300px' }}
                                    key={newVideo.video_url}
                                >
                                    <source src={newVideo.video_url} type={selectedFile.type} />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* ─── Edit Video Modal ─── */}
            <Modal
                isOpen={!!editingVideo}
                onClose={() => setEditingVideo(null)}
                title={{ text: 'Edit Video', icon: 'edit' }}
                size="lg"
                footer={
                    <>
                        <Button variant="success" onClick={handleUpdateVideo} icon="save">
                            Save Changes
                        </Button>
                        <Button variant="secondary" onClick={() => setEditingVideo(null)}>
                            Cancel
                        </Button>
                    </>
                }
            >
                {editingVideo && (
                    <div className="video-form">
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                />
                            </div>
                        </div>

                        {editingVideo.video_type === 'youtube' && (
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>YouTube URL</label>
                                    <input
                                        type="url"
                                        value={editingVideo.video_url}
                                        onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    value={editingVideo.description || ''}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Display Order</label>
                                <input
                                    type="number"
                                    value={editingVideo.display_order || 0}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, display_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={editingVideo.status}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value })}
                                >
                                    <option value="active">Active (Show on TV)</option>
                                    <option value="inactive">Inactive (Hidden)</option>
                                </select>
                            </div>
                        </div>

                        {editingVideo.video_type === 'youtube' && editingVideo.video_url && validateYouTubeUrl(editingVideo.video_url) && (
                            <div className="video-preview">
                                <h4>Preview</h4>
                                <div className="preview-container">
                                    <iframe
                                        src={getYouTubeEmbedUrl(editingVideo.video_url)}
                                        title="Video Preview"
                                        frameBorder="0"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* ─── Videos Grid ─── */}
            {videos.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-video-slash"></i>
                    <h3>No Videos Found</h3>
                    <p>Add YouTube links or upload videos to display on the TV dashboard</p>
                    <Button variant="primary" icon="plus" onClick={() => setShowAddForm(true)}>
                        Add Your First Video
                    </Button>
                </div>
            ) : (
                <div className="videos-grid">
                    {videos
                        .filter(video =>
                            video && (
                                video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                video.description?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                        )
                        .map(video => (
                            <div key={video.id} className={`video-card ${video.status === 'inactive' ? 'inactive' : ''}`}>
                                <div className="video-thumbnail">
                                    {video.video_type === 'youtube' ? (
                                        <iframe
                                            src={getYouTubeEmbedUrl(video.video_url)}
                                            title={video.title}
                                            frameBorder="0"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        /* ⭐ FIXED — shows first frame as thumbnail */
                                        <video
                                            controls
                                            preload="metadata"
                                            muted
                                            playsInline
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                background: '#000',
                                                display: 'block'
                                            }}
                                            key={`video-${video.id}-${video.updated_at || ''}`}
                                            onLoadedMetadata={(e) => {
                                                try { e.currentTarget.currentTime = 0.1; } catch {}
                                            }}
                                            onError={(e) => console.error('Video thumbnail error:', video.title, e)}
                                        >
                                            <source src={getPlayableUrl(video.video_url, 'local')} type="video/mp4" />
                                            <source src={getPlayableUrl(video.video_url, 'local')} type="video/webm" />
                                            <source src={getPlayableUrl(video.video_url, 'local')} type="video/ogg" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                    {video.status === 'inactive' && (
                                        <div className="inactive-overlay">
                                            <i className="fas fa-eye-slash"></i>
                                            <span>Disabled</span>
                                        </div>
                                    )}
                                </div>
                                <div className="video-info">
                                    <h4>{video.title}</h4>
                                    <p
                                        className="video-description"
                                        title={video.description || 'No description'}
                                    >
                                        {video.description
                                            ? (video.description.length > 100
                                                ? `${video.description.substring(0, 100)}…`
                                                : video.description)
                                            : 'No description'}
                                    </p>
                                    <div className="video-meta">
                                        <span className={`status-badge ${video.status}`}>
                                            <i className={`fas fa-${video.status === 'active' ? 'play-circle' : 'pause-circle'}`}></i>
                                            {video.status === 'active' ? 'Active' : 'Disabled'}
                                        </span>
                                        <span className="video-type">
                                            <i className={`fab fa-${video.video_type === 'youtube' ? 'youtube' : 'video'}`}></i>
                                            {video.video_type === 'youtube' ? 'YOUTUBE' : 'LOCAL'}
                                        </span>
                                        {video.display_order !== undefined && (
                                            <span className="order-badge">
                                                <i className="fas fa-sort-numeric-down"></i>
                                                Order: {video.display_order}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="video-actions">
                                    <button onClick={() => setEditingVideo(video)} className="action-btn edit" title="Edit video">
                                        <i className="fas fa-edit"></i> Edit
                                    </button>
                                    <button onClick={() => handleToggleClick(video)} className={`action-btn ${video.status === 'active' ? 'disable' : 'enable'}`} title={video.status === 'active' ? 'Disable video' : 'Enable video'}>
                                        <i className={`fas fa-${video.status === 'active' ? 'eye-slash' : 'eye'}`}></i>
                                        {video.status === 'active' ? 'Disable' : 'Enable'}
                                    </button>
                                    <button onClick={() => handleDeleteClick(video.id, video.title)} className="action-btn delete" title="Delete video">
                                        <i className="fas fa-trash-alt"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* ─── Confirm Modal ─── */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                cancelText="Cancel"
                confirmVariant={confirmModal.confirmVariant}
                icon={confirmModal.icon}
            />

            {/* ─── Info Box ─── */}
            <div className="info-box">
                <i className="fas fa-info-circle"></i>
                <div className="info-content">
                    <strong>About Video Display:</strong>
                    <ul>
                        <li><strong>YouTube Videos:</strong> Just paste a YouTube link</li>
                        <li><strong>Local Videos:</strong> Upload MP4, WebM, or OGG files (max 100MB)</li>
                        <li>Only <strong>ACTIVE</strong> videos appear on the TV dashboard</li>
                        <li>Videos with higher display order appear first</li>
                        <li>You can schedule videos with start and end dates</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VideoManager;