import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        const timeInterval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
        };
    }, []);

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
            
            // Check if there's an active video (not null and status is active)
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
                    <span className="tv-tagline">Exchange Rate Board</span>
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

            {/* Main Content - Dynamic layout based on video availability */}
            {hasActiveVideo ? (
                <div className="tv-main">
                    {/* Video Section - 60% width */}
                    <div className="tv-video-section">
                        <VideoPlayer video={activeVideo} />
                        <div className="video-caption">
                            <i className="fas fa-play-circle"></i>
                            <span>{activeVideo?.title || 'Promotional Video'}</span>
                        </div>
                    </div>

                    {/* Rates Section - 40% width */}
                    <div className="tv-rates-section">
                        <div className="rates-header">
                            <h2>
                                <i className="fas fa-exchange-alt"></i>
                                Live Exchange Rates
                            </h2>
                            <div className="last-update">
                                <i className="fas fa-clock"></i> 
                                Updated: {lastUpdate || 'Today'}
                            </div>
                        </div>
                        
                        <div className="rates-scroll">
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
                /* Full Screen Rates - No Video Available */
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
                        </div>
                        
                        <div className="rates-grid-fullscreen">
                            {currencies.length > 0 ? (
                                currencies.map((currency, index) => (
                                    <RateCardFull 
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
                        <span>🏦 Dashen Bank - Authorized by Ehiopian National Bank of Ethiopia</span>
                        <span>📞 Contact Center:6333 </span>
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

// Fullscreen Rate Card Component
const RateCardFull = ({ currency, index }) => {
    const [flagError, setFlagError] = useState(false);

    const getCountryCode = (code) => {
        const mapping = {
            'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'SAR': 'sa', 'CNY': 'cn',
            'JPY': 'jp', 'AUD': 'au', 'CAD': 'ca', 'CHF': 'ch', 'AED': 'ae'
        };
        return mapping[code] || code?.toLowerCase().slice(0, 2);
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0.0000';
        const n = typeof num === 'string' ? parseFloat(num) : num;
        return isNaN(n) ? '0.0000' : n.toFixed(4);
    };

    const sell = currency?.sell_rate !== undefined ? parseFloat(currency.sell_rate) : null;
    const buy = currency?.buy_rate !== undefined ? parseFloat(currency.buy_rate) : null;
    const spread = (sell !== null && buy !== null) ? (buy - sell).toFixed(4) : '0.0000';
    const flagUrl = `https://flagcdn.com/w40/${getCountryCode(currency?.code)}.png`;

    return (
        <div className="rate-card-full" style={{ animationDelay: `${(index || 0) * 0.05}s` }}>
            <div className="rate-card-header-full">
                <div className="currency-icon-full">
                    {!flagError ? (
                        <img src={flagUrl} alt={currency?.code} className="currency-flag-full" onError={() => setFlagError(true)} />
                    ) : (
                        <i className={`fas ${currency?.icon || 'fa-money-bill-wave'}`}></i>
                    )}
                </div>
                <div className="currency-info-full">
                    <div className="currency-name-full">{currency?.name || 'Unknown'}</div>
                    <div className="currency-code-full">{currency?.code || 'N/A'}</div>
                </div>
                <div className="trend-icon-full">
                    <i className="fas fa-chart-line"></i>
                </div>
            </div>
            <div className="rate-card-body-full">
                <div className="rate-item-full">
                    <div className="rate-label-full">
                        <i className="fas fa-arrow-up"></i> SELLING
                    </div>
                    <div className="rate-value-full sell-rate-full">{formatNumber(sell)}</div>
                </div>
                <div className="rate-divider-full"></div>
                <div className="rate-item-full">
                    <div className="rate-label-full">
                        <i className="fas fa-arrow-down"></i> BUYING
                    </div>
                    <div className="rate-value-full buy-rate-full">{formatNumber(buy)}</div>
                </div>
            </div>
            <div className="rate-card-footer-full">
                <span>ETB per unit</span>
                <span className="spread-info-full">
                    <i className="fas fa-chart-simple"></i> Spread: {spread}
                </span>
            </div>
        </div>
    );
};

export default TVDashboard;