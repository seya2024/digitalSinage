import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video }) => {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        setIsLoading(true);
        setError(false);
        
        // Force iframe to fill container
        const updateIframeSize = () => {
            if (iframeRef.current && containerRef.current) {
                const container = containerRef.current;
                iframeRef.current.style.width = `${container.clientWidth}px`;
                iframeRef.current.style.height = `${container.clientHeight}px`;
            }
        };
        
        updateIframeSize();
        window.addEventListener('resize', updateIframeSize);
        
        return () => window.removeEventListener('resize', updateIframeSize);
    }, [video]);

    const getVideoUrl = (url, type) => {
        if (!url) return '';
        
        // Extract video ID from YouTube URL
        const getYouTubeVideoId = (url) => {
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
                /youtube\.com\/embed\/([^&\n?#]+)/,
                /youtube\.com\/v\/([^&\n?#]+)/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        };

        if (type === 'youtube') {
            const videoId = getYouTubeVideoId(url);
            if (videoId) {
                // YouTube embed parameters for full screen display
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&loop=1&playlist=${videoId}&enablejsapi=1&origin=${window.location.origin}&widgetid=1`;
            }
            return url;
        }
        
        if (type === 'vimeo') {
            const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
            if (vimeoId) {
                return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&fullscreen=1`;
            }
            return url;
        }
        
        return url;
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setError(true);
        setIsLoading(false);
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

    const videoUrl = getVideoUrl(video.video_url, video.video_type);

    return (
        <div className="video-player-container" ref={containerRef}>
            {isLoading && (
                <div className="video-loading">
                    <div className="spinner"></div>
                    <p>Loading video...</p>
                </div>
            )}
            <iframe
                ref={iframeRef}
                src={videoUrl}
                title={video.title || 'Promotional Video'}
                className="video-iframe"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />
            {video.title && (
                <div className="video-overlay">
                    <h3>{video.title}</h3>
                    {video.description && <p>{video.description}</p>}
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;