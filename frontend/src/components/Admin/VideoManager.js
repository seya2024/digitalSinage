import React, { useState, useEffect } from 'react';
import { videoService } from '../../services/videoService';
import './VideoManager.css';

const VideoManager = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newVideo, setNewVideo] = useState({
        title: '',
        description: '',
        video_url: '',
        video_type: 'youtube',
        duration: '',
        status: 'active',
        display_order: 0
    });

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const response = await videoService.getAll(false);
            if (response.success) {
                setVideos(response.data);
            }
        } catch (error) {
            showMessage('error', 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleAddVideo = async () => {
        if (!newVideo.title || !newVideo.video_url) {
            showMessage('error', 'Please fill title and video URL');
            return;
        }

        try {
            const response = await videoService.create(newVideo);
            if (response.success) {
                showMessage('success', 'Video added successfully');
                setShowAddForm(false);
                setNewVideo({
                    title: '',
                    description: '',
                    video_url: '',
                    video_type: 'youtube',
                    duration: '',
                    status: 'active',
                    display_order: 0
                });
                loadVideos();
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to add video');
        }
    };

    const handleUpdateVideo = async () => {
        if (!editingVideo.title || !editingVideo.video_url) {
            showMessage('error', 'Please fill title and video URL');
            return;
        }

        try {
            const response = await videoService.update(editingVideo.id, editingVideo);
            if (response.success) {
                showMessage('success', 'Video updated successfully');
                setEditingVideo(null);
                loadVideos();
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update video');
        }
    };

    const handleDeleteVideo = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                const response = await videoService.delete(id);
                if (response.success) {
                    showMessage('success', 'Video deleted successfully');
                    loadVideos();
                }
            } catch (error) {
                showMessage('error', error.response?.data?.message || 'Failed to delete video');
            }
        }
    };

    const handleToggleStatus = async (video) => {
        const newStatus = video.status === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? 'enable' : 'disable';
        
        if (window.confirm(`Are you sure you want to ${action} this video? ${newStatus === 'active' ? 'It will appear on the TV dashboard.' : 'It will be hidden from the TV dashboard.'}`)) {
            try {
                const updatedVideo = { ...video, status: newStatus };
                const response = await videoService.update(video.id, updatedVideo);
                if (response.success) {
                    showMessage('success', `Video ${action}d successfully`);
                    loadVideos();
                }
            } catch (error) {
                showMessage('error', error.response?.data?.message || `Failed to ${action} video`);
            }
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    };

    // Count active videos
    const activeVideosCount = videos.filter(v => v.status === 'active').length;

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading videos...</p>
            </div>
        );
    }

    return (
        <div className="video-manager">
            <div className="manager-header">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-video"></i>
                        Video Manager
                    </h2>
                    <p className="header-description">Manage promotional videos for TV dashboard</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge">
                        <i className="fas fa-play-circle"></i>
                        <span>{activeVideosCount} Active</span>
                    </div>
                    <div className="stat-badge">
                        <i className="fas fa-video"></i>
                        <span>{videos.length} Total</span>
                    </div>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add-video">
                        <i className="fas fa-plus"></i>
                        Add Video
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`alert-message ${message.type}`}>
                    <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    <span>{message.text}</span>
                    <button className="alert-close" onClick={() => setMessage({ type: '', text: '' })}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {showAddForm && (
                <div className="add-video-modal">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-plus-circle"></i>
                                Add New Video
                            </h3>
                            <button onClick={() => setShowAddForm(false)} className="modal-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-heading"></i>
                                        Title <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newVideo.title}
                                        onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                                        placeholder="Video title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fab fa-youtube"></i>
                                        Video Type
                                    </label>
                                    <select
                                        value={newVideo.video_type}
                                        onChange={(e) => setNewVideo({...newVideo, video_type: e.target.value})}
                                    >
                                        <option value="youtube">YouTube</option>
                                        <option value="vimeo">Vimeo</option>
                                        <option value="local">Local</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-link"></i>
                                        Video URL <span className="required">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                        value={newVideo.video_url}
                                        onChange={(e) => setNewVideo({...newVideo, video_url: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-align-left"></i>
                                        Description
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={newVideo.description}
                                        onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                                        placeholder="Video description"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-sort-numeric-down"></i>
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={newVideo.display_order}
                                        onChange={(e) => setNewVideo({...newVideo, display_order: parseInt(e.target.value)})}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-toggle-on"></i>
                                        Status
                                    </label>
                                    <select
                                        value={newVideo.status}
                                        onChange={(e) => setNewVideo({...newVideo, status: e.target.value})}
                                    >
                                        <option value="active">Active (Shown on TV)</option>
                                        <option value="inactive">Inactive (Hidden)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleAddVideo} className="btn-submit">
                                <i className="fas fa-save"></i>
                                Add Video
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="videos-grid">
                {videos.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-video-slash"></i>
                        <h3>No Videos</h3>
                        <p>Add promotional videos to display on the TV dashboard</p>
                        <button onClick={() => setShowAddForm(true)} className="btn-add-video">
                            <i className="fas fa-plus"></i>
                            Add Your First Video
                        </button>
                    </div>
                ) : (
                    videos.map(video => (
                        <div key={video.id} className={`video-card ${video.status === 'inactive' ? 'inactive-card' : ''}`}>
                            {editingVideo?.id === video.id ? (
                                <div className="edit-form">
                                    <input
                                        type="text"
                                        value={editingVideo.title}
                                        onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                                        placeholder="Title"
                                    />
                                    <select
                                        value={editingVideo.video_type}
                                        onChange={(e) => setEditingVideo({...editingVideo, video_type: e.target.value})}
                                    >
                                        <option value="youtube">YouTube</option>
                                        <option value="vimeo">Vimeo</option>
                                    </select>
                                    <input
                                        type="url"
                                        value={editingVideo.video_url}
                                        onChange={(e) => setEditingVideo({...editingVideo, video_url: e.target.value})}
                                        placeholder="URL"
                                    />
                                    <textarea
                                        value={editingVideo.description}
                                        onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                                        placeholder="Description"
                                        rows="2"
                                    ></textarea>
                                    <select
                                        value={editingVideo.status}
                                        onChange={(e) => setEditingVideo({...editingVideo, status: e.target.value})}
                                    >
                                        <option value="active">Active (Show on TV)</option>
                                        <option value="inactive">Inactive (Hide from TV)</option>
                                    </select>
                                    <div className="edit-actions">
                                        <button onClick={handleUpdateVideo} className="save-btn">
                                            <i className="fas fa-check"></i> Save
                                        </button>
                                        <button onClick={() => setEditingVideo(null)} className="cancel-btn">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="video-thumbnail">
                                        <iframe
                                            src={getYouTubeEmbedUrl(video.video_url)}
                                            title={video.title}
                                            frameBorder="0"
                                            allowFullScreen
                                        ></iframe>
                                        {video.status === 'inactive' && (
                                            <div className="inactive-overlay">
                                                <i className="fas fa-eye-slash"></i>
                                                <span>Disabled</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="video-info">
                                        <h4>{video.title}</h4>
                                        <p>{video.description}</p>
                                        <div className="video-meta">
                                            <span>
                                                <i className={`fab fa-${video.video_type}`}></i>
                                                {video.video_type.toUpperCase()}
                                            </span>
                                            <span className={`status-badge ${video.status}`}>
                                                <i className={`fas fa-${video.status === 'active' ? 'play-circle' : 'pause-circle'}`}></i>
                                                {video.status === 'active' ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="video-actions">
                                        <button onClick={() => setEditingVideo(video)} className="edit-btn">
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(video)} 
                                            className={`toggle-btn ${video.status === 'active' ? 'disable-btn' : 'enable-btn'}`}
                                            title={video.status === 'active' ? 'Disable video (hide from TV)' : 'Enable video (show on TV)'}
                                        >
                                            <i className={`fas fa-${video.status === 'active' ? 'eye-slash' : 'eye'}`}></i>
                                            {video.status === 'active' ? 'Disable' : 'Enable'}
                                        </button>
                                        <button onClick={() => handleDeleteVideo(video.id, video.title)} className="delete-btn">
                                            <i className="fas fa-trash-alt"></i> Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Info Box */}
            <div className="video-info-box">
                <div className="info-content">
                    <i className="fas fa-info-circle"></i>
                    <div>
                        <strong>About Video Display:</strong>
                        <ul>
                            <li>Only <strong>ACTIVE</strong> videos appear on the TV dashboard</li>
                            <li>If multiple videos are active, the one with highest display order shows first</li>
                            <li>You can disable videos without deleting them</li>
                            <li>Disabled videos won't show on the TV dashboard</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoManager;