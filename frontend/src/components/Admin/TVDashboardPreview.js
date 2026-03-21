import React, { useState, useEffect } from 'react';
import { currencyService } from '../../services/currencyService';
import { videoService } from '../../services/videoService';
import './TVDashboardPreview.css';

const TVDashboardPreview = () => {
    const [currencies, setCurrencies] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadPreviewData();
        const interval = setInterval(loadPreviewData, 30000);
        const timeInterval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
        };
    }, []);

    const loadPreviewData = async () => {
        try {
            const [ratesRes, videoRes] = await Promise.all([
                currencyService.getAll(),
                videoService.getActiveVideo()
            ]);
            
            if (ratesRes.success) {
                setCurrencies(ratesRes.data || []);
            }
            if (videoRes.success) {
                setActiveVideo(videoRes.data);
            }
        } catch (error) {
            console.error('Error loading preview data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0.0000';
        const number = typeof num === 'string' ? parseFloat(num) : num;
        return isNaN(number) ? '0.0000' : number.toFixed(4);
    };

    const formatDateTime = (date) => ({
        date: date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true 
        })
    });

    const { date, time } = formatDateTime(currentDateTime);

    if (loading) {
        return (
            <div className="preview-loading">
                <div className="spinner-small"></div>
                <p>Loading preview...</p>
            </div>
        );
    }

    return (
        <div className={`tv-preview-container ${expanded ? 'expanded' : ''}`}>
            <div className="preview-header">
                <h3>
                    <i className="fas fa-tv"></i>
                    TV Dashboard Preview
                </h3>
                <button 
                    className="expand-btn" 
                    onClick={() => setExpanded(!expanded)}
                    title={expanded ? "Minimize" : "Expand to full view"}
                >
                    <i className={`fas fa-${expanded ? 'compress' : 'expand'}`}></i>
                    {expanded ? ' Minimize' : ' Expand'}
                </button>
            </div>
            
            <div className="preview-content">
                {/* Mini TV Dashboard */}
                <div className={`mini-tv-dashboard ${expanded ? 'expanded-view' : ''}`}>
                    {/* Header */}
                    <div className="mini-tv-header">
                        <div className="mini-logo">
                            <i className="fas fa-landmark"></i>
                            <span>DASHEN BANK</span>
                        </div>
                        <div className="mini-datetime">
                            <div className="mini-date">{date}</div>
                            <div className="mini-time">{time}</div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mini-tv-main">
                        {/* Video Section */}
                        <div className="mini-video-section">
                            {activeVideo ? (
                                <div className="mini-video-container">
                                    <iframe
                                        src={activeVideo.video_url}
                                        title={activeVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                    <div className="mini-video-caption">
                                        <i className="fas fa-play-circle"></i>
                                        {activeVideo.title}
                                    </div>
                                </div>
                            ) : (
                                <div className="mini-video-placeholder">
                                    <i className="fas fa-video"></i>
                                    <p>No video available</p>
                                </div>
                            )}
                        </div>

                        {/* Rates Section */}
                        <div className="mini-rates-section">
                            <div className="mini-rates-header">
                                <h4>
                                    <i className="fas fa-exchange-alt"></i>
                                    Live Exchange Rates
                                </h4>
                            </div>
                            <div className="mini-rates-list">
                                {currencies.slice(0, expanded ? 10 : 5).map(currency => (
                                    <div key={currency.id} className="mini-rate-card">
                                        <div className="mini-currency-info">
                                            <i className={`fas ${currency.icon || 'fa-money-bill-wave'}`}></i>
                                            <span className="mini-currency-code">{currency.code}</span>
                                        </div>
                                        <div className="mini-rate-values">
                                            <span className="mini-sell">{formatNumber(currency.sell_rate)}</span>
                                            <span className="mini-buy">{formatNumber(currency.buy_rate)}</span>
                                        </div>
                                    </div>
                                ))}
                                {!expanded && currencies.length > 5 && (
                                    <div className="more-rates">
                                        +{currencies.length - 5} more currencies
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mini-tv-footer">
                        <div className="mini-ticker">
                            <span>🏦 Dashen Bank - Authorized by Ethiopian National Bank of Ethiopia</span>
                            <span>📞 Contact Center: 6333 </span>
                            <span>💱 Competitive Exchange Rates</span>
                        </div>
                    </div>
                </div>

                {/* Preview Actions */}
                <div className="preview-actions">
                    <button 
                        className="view-full-btn"
                        onClick={() => window.open('/', '_blank')}
                    >
                        <i className="fas fa-external-link-alt"></i>
                        Open Full TV Dashboard
                    </button>
                    <button 
                        className="refresh-preview-btn"
                        onClick={loadPreviewData}
                    >
                        <i className="fas fa-sync-alt"></i>
                        Refresh Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TVDashboardPreview;