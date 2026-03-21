import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import RateCard from './RateCard';
import { currencyService } from '../../services/currencyService';
import { videoService } from '../../services/videoService';
import './TVDashboard.css';

const TVDashboard = () => {
    const [currencies, setCurrencies] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState('');
    const [error, setError] = useState(null);
    const [hasActiveVideo, setHasActiveVideo] = useState(false);
    
    // Auto-scroll refs
    const ratesScrollRef = useRef(null);
    const scrollIntervalRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [scrollEnabled, setScrollEnabled] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        const timeInterval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        
        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
            stopAutoScroll();
        };
    }, []);

    // Check if scrolling is needed and start auto-scroll
    useEffect(() => {
        if (!scrollEnabled && currencies.length > 0 && ratesScrollRef.current) {
            const container = ratesScrollRef.current;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            // Only enable scrolling if content exceeds container height
            if (scrollHeight > clientHeight + 50) {
                setScrollEnabled(true);
                startAutoScroll();
            }
        }
    }, [currencies, scrollEnabled]);

    const startAutoScroll = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
        }
        
        if (!ratesScrollRef.current) return;
        
        const container = ratesScrollRef.current;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Don't scroll if content fits
        if (scrollHeight <= clientHeight + 50) {
            setScrollEnabled(false);
            return;
        }
        
        scrollIntervalRef.current = setInterval(() => {
            if (!ratesScrollRef.current || !isAutoScrolling) return;
            
            const container = ratesScrollRef.current;
            const currentScrollTop = container.scrollTop;
            const maxScrollTop = container.scrollHeight - container.clientHeight;
            const scrollSpeed = 0.8; // Very slow scroll
            
            if (scrollDirection === 'down') {
                if (currentScrollTop + scrollSpeed >= maxScrollTop) {
                    // Reached bottom, change direction
                    setScrollDirection('up');
                    container.scrollTop = maxScrollTop - scrollSpeed;
                } else {
                    container.scrollTop = currentScrollTop + scrollSpeed;
                }
            } else {
                if (currentScrollTop - scrollSpeed <= 0) {
                    // Reached top, change direction
                    setScrollDirection('down');
                    container.scrollTop = scrollSpeed;
                } else {
                    container.scrollTop = currentScrollTop - scrollSpeed;
                }
            }
        }, 60); // 60ms interval
    };

    const stopAutoScroll = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const handleManualScroll = () => {
        if (!isAutoScrolling) return;
        
        // Pause auto-scroll when user manually scrolls
        setIsAutoScrolling(false);
        stopAutoScroll();
        
        // Resume auto-scroll after 15 seconds of inactivity
        setTimeout(() => {
            setIsAutoScrolling(true);
            if (scrollEnabled) {
                startAutoScroll();
            }
        }, 15000);
    };

    const handleMouseEnter = () => {
        if (scrollEnabled) {
            stopAutoScroll();
        }
    };

    const handleMouseLeave = () => {
        if (scrollEnabled && isAutoScrolling) {
            startAutoScroll();
        }
    };

    const loadData = async () => {
        try {
            setError(null);
            const [ratesRes, videoRes] = await Promise.all([
                currencyService.getAll(),
                videoService.getActiveVideo()
            ]);
            
            if (ratesRes.success) {
                const formattedRates = (ratesRes.data || []).map(rate => ({
                    ...rate,
                    sell_rate: rate.sell_rate ? parseFloat(rate.sell_rate) : null,
                    buy_rate: rate.buy_rate ? parseFloat(rate.buy_rate) : null
                }));
                setCurrencies(formattedRates);
                
                if (formattedRates.length > 0 && formattedRates[0].updated_at) {
                    setLastUpdate(new Date(formattedRates[0].updated_at).toLocaleString());
                }
            } else {
                setError('Failed to load exchange rates');
            }
            
            const hasVideo = videoRes.success && videoRes.data !== null && videoRes.data.status === 'active';
            setHasActiveVideo(hasVideo);
            setActiveVideo(hasVideo ? videoRes.data : null);
            
        } catch (error) {
            console.error('Error loading TV data:', error);
            setError('Connection error. Retrying...');
        } finally {
            setLoading(false);
        }
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

    // Calculate if scrolling is possible
    const canScroll = currencies.length > 6; // If more than 6 currencies, scrolling is possible

    if (loading) {
        return (
            <div className="tv-loading">
                <div className="spinner"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="tv-dashboard">
            <div className="tv-header">
                <div className="tv-logo">
                    <i className="fas fa-landmark"></i>
                    <h1>DASHEN BANK</h1>
                    <span className="tv-tagline">Foreign Exchange Market Rates for Major Currencies Against Ethiopian BIRR (ETB)


                    </span>
                </div>
                <div className="tv-datetime">
                    <div className="tv-date">{date}</div>
                    <div className="tv-time">{time}</div>
                </div>
            </div>

            {error && (
                <div className="tv-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button onClick={loadData} className="retry-btn">Retry</button>
                </div>
            )}

            {hasActiveVideo ? (
                <div className="tv-main">
                    <div className="tv-video-section">
                        <VideoPlayer video={activeVideo} />
                        <div className="video-caption">
                            <i className="fas fa-play-circle"></i>
                            <span>{activeVideo?.title || 'Promotional Video'}</span>
                        </div>
                    </div>
                    <div className="tv-rates-section">
                        <div className="rates-header">
                            <h2>
                                <i className="fas fa-exchange-alt"></i>
                                Daily Exchange Rates
                            </h2>
                            <div className="last-update">
                                <i className="fas fa-clock"></i> 
                                Updated: {lastUpdate || 'Today'}
                            </div>
                            {canScroll && scrollEnabled && (
                                <div className="scroll-indicator">
                                    <i className={`fas fa-arrow-${scrollDirection === 'down' ? 'down' : 'up'}`}></i>
                                    <span>Auto-scrolling</span>
                                </div>
                            )}
                        </div>
                        
                        <div 
                            className="rates-scroll" 
                            ref={ratesScrollRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onWheel={handleManualScroll}
                            onTouchStart={handleManualScroll}
                        >
                            {currencies.length > 0 ? (
                                currencies.map((currency, index) => (
                                    <RateCard 
                                        key={currency.id || index} 
                                        currency={currency} 
                                        index={index} 
                                    />
                                ))
                            ) : (
                                <div className="empty-rates">
                                    <i className="fas fa-chart-line"></i>
                                    <p>No exchange rates available</p>
                                    <small>Please check back later</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="tv-main-fullscreen">
                    <div className="tv-rates-section-fullscreen">
                        <div className="rates-header-fullscreen">
                            <h2>
                                <i className="fas fa-exchange-alt"></i>
                                Live Exchange Rates 
                            </h2>
                            <div className="last-update">
                                <i className="fas fa-clock"></i> 
                                Updated: {lastUpdate || 'Today'}
                            </div>
                            <div className="no-video-badge">
                                <i className="fas fa-video-slash"></i>
                                Video Disabled
                            </div>
                            {canScroll && scrollEnabled && (
                                <div className="scroll-indicator">
                                    <i className={`fas fa-arrow-${scrollDirection === 'down' ? 'down' : 'up'}`}></i>
                                    <span>Auto-scrolling</span>
                                </div>
                            )}
                        </div>
                        
                        <div 
                            className="rates-grid-fullscreen" 
                            ref={ratesScrollRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onWheel={handleManualScroll}
                            onTouchStart={handleManualScroll}
                        >
                            {currencies.length > 0 ? (
                                currencies.map((currency, index) => (
                                    <RateCard 
                                        key={currency.id || index} 
                                        currency={currency} 
                                        index={index} 
                                    />
                                ))
                            ) : (
                                <div className="empty-rates-fullscreen">
                                    <i className="fas fa-chart-line"></i>
                                    <p>No exchange rates available</p>
                                    <small>Please check back later</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="tv-footer">
                <div className="ticker">
                    <div className="ticker-content">
                        <span>🏦 Dashen Bank - Authorized by National Bank of Ethiopia</span>
                        <span>📞 Contact Center: 8076</span>
                        <span>💱 Competitive Exchange Rates</span>
                        <span>🔒 Safe & Secure Transactions</span>
                        <span>🌟 24/7 Customer Support</span>
                        <span>💰 Best Rates Guaranteed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TVDashboard;