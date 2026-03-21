import React, { useState } from 'react';

const VideoPlayer = ({ video }) => {
    const [error, setError] = useState(false);

    const getVideoUrl = (url, type) => {
        if (type === 'youtube') {
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1].split('&')[0];
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
            }
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1`;
            }
            return url;
        }
        return url;
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

    return (
        <div className="video-container">
            <iframe
                src={getVideoUrl(video.video_url, video.video_type)}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setError(true)}
            ></iframe>
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