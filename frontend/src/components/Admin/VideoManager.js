import React, { useState, useEffect } from 'react';
import { videoService } from '../../services/videoService';
import { MESSAGES, VIDEO_TYPES, VIDEO_TYPE_LABELS } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import './VideoManager.css';

const VideoManager = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [previewVideo, setPreviewVideo] = useState(null);
    
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
            const response = await videoService.getAll(false);
            if (response.success) {
                setVideos(response.data || []);
            }
        } catch (error) {
            showMessage('error', 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const validateVideoUrl = (url, type) => {
        if (type === 'youtube') {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/;
            return youtubeRegex.test(url);
        }
        if (type === 'vimeo') {
            const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/(\d+)/;
            return vimeoRegex.test(url);
        }
        return true;
    };

    const handleAddVideo = async () => {
        if (!newVideo.title || !newVideo.video_url) {
            showMessage('error', 'Please fill title and video URL');
            return;
        }

        if (!validateVideoUrl(newVideo.video_url, newVideo.video_type)) {
            showMessage('error', `Invalid ${newVideo.video_type.toUpperCase()} URL`);
            return;
        }

        try {
            const response = await videoService.create(newVideo);
            if (response.success) {
                showMessage('success', MESSAGES.VIDEO_ADDED);
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
                loadVideos();
            } else {
                showMessage('error', response.message || 'Failed to add video');
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
                showMessage('success', MESSAGES.VIDEO_UPDATED);
                setEditingVideo(null);
                loadVideos();
            } else {
                showMessage('error', response.message || 'Failed to update video');
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
                    showMessage('success', MESSAGES.VIDEO_DELETED);
                    loadVideos();
                } else {
                    showMessage('error', response.message || 'Failed to delete video');
                }
            } catch (error) {
                showMessage('error', error.response?.data?.message || 'Failed to delete video');
            }
        }
    };

    const handleToggleStatus = async (video) => {
        const newStatus = video.status === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? 'enable' : 'disable';
        
        if (window.confirm(`Are you sure you want to ${action} this video?`)) {
            try {
                const updatedVideo = { ...video, status: newStatus };
                const response = await videoService.update(video.id, updatedVideo);
                if (response.success) {
                    showMessage('success', `Video ${action}d successfully`);
                    loadVideos();
                }
            } catch (error) {
                showMessage('error', `Failed to ${action} video`);
            }
        }
    };

    const getEmbedUrl = (url, type) => {
        if (type === 'youtube') {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId[1]}`;
            }
            return url;
        }
        if (type === 'vimeo') {
            const videoId = url.match(/vimeo\.com\/(\d+)/);
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId[1]}`;
            }
            return url;
        }
        return url;
    };

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
        <div className="video-manager-modern">
            {/* Header */}
            <div className="video-header">
                <div className="header-info">
                    <h2>
                        <i className="fas fa-video"></i>
                        Video Manager
                    </h2>
                    <p className="header-description">Manage promotional videos for TV dashboard display</p>
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
                    <Button
                        variant="primary"
                        icon="plus"
                        onClick={() => setShowAddForm(true)}
                    >
                        Add Video
                    </Button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <Alert
                    type={message.type}
                    message={message.text}
                    dismissible
                    onClose={() => setMessage({ type: '', text: '' })}
                />
            )}

            {/* Search Bar */}
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

            {/* Add Video Modal */}
            <Modal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                title={{ text: 'Add New Video', icon: 'plus-circle' }}
                size="lg"
                footer={
                    <>
                        <Button variant="success" onClick={handleAddVideo} icon="save">
                            Add Video
                        </Button>
                        <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                            Cancel
                        </Button>
                    </>
                }
            >
                <div className="video-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={newVideo.title}
                                onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                                placeholder="Enter video title"
                            />
                        </div>
                        <div className="form-group">
                            <label>Video Type *</label>
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
                        <div className="form-group full-width">
                            <label>Video URL *</label>
                            <input
                                type="url"
                                placeholder={newVideo.video_type === 'youtube' 
                                    ? 'https://www.youtube.com/watch?v=...' 
                                    : 'https://vimeo.com/...'}
                                value={newVideo.video_url}
                                onChange={(e) => setNewVideo({...newVideo, video_url: e.target.value})}
                            />
                            <small className="field-hint">
                                {newVideo.video_type === 'youtube' 
                                    ? 'Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)'
                                    : 'Enter Vimeo video URL (e.g., https://vimeo.com/VIDEO_ID)'}
                            </small>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                rows="3"
                                value={newVideo.description}
                                onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
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
                                onChange={(e) => setNewVideo({...newVideo, display_order: parseInt(e.target.value)})}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration (seconds)</label>
                            <input
                                type="number"
                                value={newVideo.duration}
                                onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={newVideo.status}
                                onChange={(e) => setNewVideo({...newVideo, status: e.target.value})}
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
                                onChange={(e) => setNewVideo({...newVideo, start_date: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date (Optional)</label>
                            <input
                                type="date"
                                value={newVideo.end_date}
                                onChange={(e) => setNewVideo({...newVideo, end_date: e.target.value})}
                            />
                        </div>
                    </div>
                    {newVideo.video_url && validateVideoUrl(newVideo.video_url, newVideo.video_type) && (
                        <div className="video-preview">
                            <h4>Preview</h4>
                            <div className="preview-container">
                                <iframe
                                    src={getEmbedUrl(newVideo.video_url, newVideo.video_type)}
                                    title="Video Preview"
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Edit Video Modal */}
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
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Video Type</label>
                                <select
                                    value={editingVideo.video_type}
                                    onChange={(e) => setEditingVideo({...editingVideo, video_type: e.target.value})}
                                >
                                    <option value="youtube">YouTube</option>
                                    <option value="vimeo">Vimeo</option>
                                    <option value="local">Local</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Video URL</label>
                                <input
                                    type="url"
                                    value={editingVideo.video_url}
                                    onChange={(e) => setEditingVideo({...editingVideo, video_url: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    value={editingVideo.description || ''}
                                    onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Display Order</label>
                                <input
                                    type="number"
                                    value={editingVideo.display_order || 0}
                                    onChange={(e) => setEditingVideo({...editingVideo, display_order: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={editingVideo.status}
                                    onChange={(e) => setEditingVideo({...editingVideo, status: e.target.value})}
                                >
                                    <option value="active">Active (Show on TV)</option>
                                    <option value="inactive">Inactive (Hidden)</option>
                                </select>
                            </div>
                        </div>
                        {editingVideo.video_url && validateVideoUrl(editingVideo.video_url, editingVideo.video_type) && (
                            <div className="video-preview">
                                <h4>Preview</h4>
                                <div className="preview-container">
                                    <iframe
                                        src={getEmbedUrl(editingVideo.video_url, editingVideo.video_type)}
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

            {/* Videos Grid */}
            {videos.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-video-slash"></i>
                    <h3>No Videos Found</h3>
                    <p>Add promotional videos to display on the TV dashboard</p>
                    <Button variant="primary" icon="plus" onClick={() => setShowAddForm(true)}>
                        Add Your First Video
                    </Button>
                </div>
            ) : (
                <div className="videos-grid">
                    {videos
                        .filter(video => 
                            video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            video.description?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(video => (
                            <div key={video.id} className={`video-card ${video.status === 'inactive' ? 'inactive' : ''}`}>
                                <div className="video-thumbnail">
                                    <iframe
                                        src={getEmbedUrl(video.video_url, video.video_type)}
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
                                    {video.duration && (
                                        <div className="video-duration">
                                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                        </div>
                                    )}
                                </div>
                                <div className="video-info">
                                    <h4>{video.title}</h4>
                                    <p>{video.description?.substring(0, 100)}</p>
                                    <div className="video-meta">
                                        <span className={`status-badge ${video.status}`}>
                                            <i className={`fas fa-${video.status === 'active' ? 'play-circle' : 'pause-circle'}`}></i>
                                            {video.status === 'active' ? 'Active' : 'Disabled'}
                                        </span>
                                        <span className="video-type">
                                            <i className={`fab fa-${video.video_type}`}></i>
                                            {video.video_type.toUpperCase()}
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
                                    <button 
                                        onClick={() => setEditingVideo(video)} 
                                        className="action-btn edit"
                                        title="Edit video"
                                    >
                                        <i className="fas fa-edit"></i> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(video)} 
                                        className={`action-btn ${video.status === 'active' ? 'disable' : 'enable'}`}
                                        title={video.status === 'active' ? 'Disable video' : 'Enable video'}
                                    >
                                        <i className={`fas fa-${video.status === 'active' ? 'eye-slash' : 'eye'}`}></i>
                                        {video.status === 'active' ? 'Disable' : 'Enable'}
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteVideo(video.id, video.title)} 
                                        className="action-btn delete"
                                        title="Delete video"
                                    >
                                        <i className="fas fa-trash-alt"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Info Box */}
            <div className="info-box">
                <i className="fas fa-info-circle"></i>
                <div className="info-content">
                    <strong>About Video Display:</strong>
                    <ul>
                        <li>Only <strong>ACTIVE</strong> videos appear on the TV dashboard</li>
                        <li>Videos with higher display order appear first</li>
                        <li>You can schedule videos with start and end dates</li>
                        <li>Disabled videos won't show on the TV dashboard</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VideoManager;