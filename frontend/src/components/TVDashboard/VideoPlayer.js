import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ video }) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [video]);

    // Get the API base URL from environment or fallback
    const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        
        // Handle youtube.com/watch?v=...
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
        }
        
        // Handle youtu.be/...
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
        }
        
        // Handle youtube.com/embed/... (already embedded)
        if (url.includes('youtube.com/embed/')) {
            const videoId = url.split('embed/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
        }
        
        return url;
    };

    const getLocalVideoUrl = (url) => {
        if (!url) return '';
        
        // Already a full URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // Starts with /uploads/ or uploads/ → prepend API base
        if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
            const cleanPath = url.startsWith('/') ? url : `/${url}`;
            return `${API_BASE}${cleanPath}`;
        }
        
        // Relative path → prepend API base
        return `${API_BASE}/${url}`;
    };

    if (!video) {
        return (
            <div className="video-placeholder">
                <i className="fas fa-video"></i>
                <p>No promotional video available</p>
                <span>Contact admin to add videos</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="video-error">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Unable to load video</p>
                <button onClick={() => setError(false)}>Retry</button>
            </div>
        );
    }

    const isLocal = video.video_type === 'local';

    return (
        <div className="video-container">
            {isLocal ? (
                <video
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={() => setError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    key={video.id}
                >
                    <source 
                        src={getLocalVideoUrl(video.video_url || video.file_path)} 
                        type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <iframe
                    src={getYouTubeEmbedUrl(video.video_url)}
                    title={video.title || 'Promotional Video'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={() => setError(true)}
                ></iframe>
            )}
            
            {video.title && (
                <div className="video-title">
                    <h3>{video.title}</h3>
                    {video.description && <p>{video.description}</p>}
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;