import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ video }) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [video]);

    const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';

        let videoId = null;

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }

        if (videoId) {
            // ⭐ Clean params — no captions, no rate-limit 429, no branding
            const params = new URLSearchParams({
                autoplay: '1',
                mute: '1',
                controls: '0',
                rel: '0',
                modestbranding: '1',
                loop: '1',
                playlist: videoId,
                showinfo: '0',
                iv_load_policy: '3',
                cc_load_policy: '0',     // ← disable captions (fixes 429)
                disablekb: '1',          // ← disable keyboard shortcuts
                fs: '0',                 // ← hide fullscreen button
                playsinline: '1',        // ← plays inline on mobile
            });
            return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        }
        return url;
    };

    const getLocalVideoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
            return url;
        }
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE}${cleanPath}`;
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
                    <source src={getLocalVideoUrl(video.video_url || video.file_path)} type="video/mp4" />
                    <source src={getLocalVideoUrl(video.video_url || video.file_path)} type="video/webm" />
                    <source src={getLocalVideoUrl(video.video_url || video.file_path)} type="video/ogg" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="youtube-fill-wrapper">
                    <iframe
                        className="youtube-fill-iframe"
                        src={getYouTubeEmbedUrl(video.video_url)}
                        title={video.title || 'Promotional Video'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onError={() => setError(true)}
                    ></iframe>
                </div>
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