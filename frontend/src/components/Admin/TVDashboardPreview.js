import React, { useState, useEffect } from 'react';
import { currencyService } from '../../services/currencyService';
import { videoService } from '../../services/videoService';
import { branchService } from '../../services/branchService';
import { districtService } from '../../services/districtService';
import './TVDashboardPreview.css';

/* ═══════════════════════════════════════════════════════════
   HELPERS — same as main TV Dashboard
   ═══════════════════════════════════════════════════════════ */

const countryCodeToFlag = (code) => {
    if (!code || typeof code !== 'string' || code.length !== 2) return '💱';
    try {
        const upper = code.toUpperCase().trim();
        return String.fromCodePoint(
            ...upper.split('').map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)
        );
    } catch {
        return '💱';
    }
};

const currencyToFlagMap = {
    'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'SAR': '🇸🇦',
    'CNY': '🇨🇳', 'JPY': '🇯🇵', 'AUD': '🇦🇺', 'CAD': '🇨🇦',
    'CHF': '🇨🇭', 'AED': '🇦🇪', 'ZAR': '🇿🇦', 'INR': '🇮🇳',
    'KES': '🇰🇪', 'SEK': '🇸🇪'
};

const extractCurrency = (row) => {
    if (row.currency && typeof row.currency === 'object') {
        return {
            name: row.currency.name || '',
            code: row.currency.code || '',
            symbol: row.currency.symbol || '',
            countryCode: row.currency.country_code || '',
            icon: row.currency.icon || 'fa-money-bill-wave',
        };
    }
    return {
        name: row.currency_name || row.name || '',
        code: row.currency_code || row.code || '',
        symbol: row.currency_symbol || row.symbol || '',
        countryCode: row.country_code || '',
        icon: row.currency_icon || row.icon || 'fa-money-bill-wave',
    };
};

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getEmbedUrl = (url, type) => {
    if (!url) return '';
    if (type === 'local') {
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const clean = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE}${clean}`;
    }
    if (type === 'youtube') {
        let videoId = null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) { videoId = match[1]; break; }
        }
        if (videoId) {
            videoId = videoId.split('?')[0].split('&')[0];
            return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&cc_load_policy=0`;
        }
        return url;
    }
    return url;
};

const TVDashboardPreview = () => {
    const [currencies, setCurrencies] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [videoError, setVideoError] = useState(false);

    // ⭐ Branch selection
    const [districts, setDistricts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [branchInfo, setBranchInfo] = useState(null);
    const [branchSearch, setBranchSearch] = useState('');

    /* ─── Load districts once ─── */
    useEffect(() => {
        const loadDistricts = async () => {
            try {
                const res = await districtService.getAll();
                if (res.success) {
                    setDistricts(res.data || []);
                    if (res.data && res.data.length > 0) {
                        setSelectedDistrict(String(res.data[0].id));
                    }
                }
            } catch (err) {
                console.error('Load districts error:', err);
            }
        };
        loadDistricts();
    }, []);

    /* ─── Load branches when district changes ─── */
    useEffect(() => {
        const loadBranches = async () => {
            if (!selectedDistrict) {
                setBranches([]);
                setSelectedBranch('');
                return;
            }
            try {
                const res = await branchService.getAll({ district_id: selectedDistrict });
                if (res.success) {
                    const list = res.data || [];
                    setBranches(list);
                    if (list.length > 0) {
                        setSelectedBranch(list[0].code);
                    } else {
                        setSelectedBranch('');
                    }
                }
            } catch (err) {
                console.error('Load branches error:', err);
            }
        };
        loadBranches();
    }, [selectedDistrict]);

    /* ─── Load branch details when branch changes ─── */
    useEffect(() => {
        const loadBranchInfo = async () => {
            if (!selectedBranch) {
                setBranchInfo(null);
                return;
            }
            try {
                const res = await branchService.getByCode(selectedBranch);
                if (res.success) {
                    setBranchInfo(res.data);
                }
            } catch (err) {
                console.error('Load branch info error:', err);
                setBranchInfo(null);
            }
        };
        loadBranchInfo();
    }, [selectedBranch]);

    /* ─── Load rates + videos (shared across branches) ─── */
    const loadPreviewData = async () => {
        try {
            setVideoError(false);
            const [ratesRes, videoRes] = await Promise.all([
                currencyService.getAll(),
                videoService.getActiveVideo()
            ]);

            if (ratesRes.success) {
                const rows = ratesRes.data || [];
                const formatted = rows.map((row) => {
                    const cur = extractCurrency(row);
                    let flag = '💱';
                    if (cur.countryCode && cur.countryCode.length === 2) {
                        flag = countryCodeToFlag(cur.countryCode);
                    } else if (currencyToFlagMap[cur.code]) {
                        flag = currencyToFlagMap[cur.code];
                    }
                    return {
                        id: row.id,
                        sell_rate: row.sell_rate ? parseFloat(row.sell_rate) : null,
                        buy_rate: row.buy_rate ? parseFloat(row.buy_rate) : null,
                        effective_date: row.effective_date || '',
                        status: row.status || 'active',
                        updated_at: row.updated_at || '',
                        _flag: flag,
                        _countryCode: cur.countryCode || '',
                        _name: cur.name || cur.code || 'Unknown',
                        _code: cur.code || 'N/A',
                        _symbol: cur.symbol || '',
                        _icon: cur.icon,
                    };
                });
                setCurrencies(formatted);
            }

            if (videoRes.success && videoRes.data && videoRes.data.status === 'active') {
                setActiveVideo({
                    ...videoRes.data,
                    embed_url: getEmbedUrl(videoRes.data.video_url, videoRes.data.video_type)
                });
            } else {
                setActiveVideo(null);
            }
        } catch (error) {
            console.error('Error loading preview data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPreviewData();
        const dataInterval = setInterval(loadPreviewData, 15000);
        const timeInterval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const handleVideoError = () => setVideoError(true);

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0.0000';
        const number = typeof num === 'string' ? parseFloat(num) : num;
        return isNaN(number) ? '0.0000' : number.toFixed(4);
    };

    const formatDateTime = (date) => ({
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    });

    /* TV online status */
    const getTvStatus = () => {
        if (!branchInfo || !branchInfo.last_heartbeat) return { label: 'Never', cls: 'never' };
        const mins = (Date.now() - new Date(branchInfo.last_heartbeat).getTime()) / 60000;
        if (mins <= 3) return { label: 'Online', cls: 'online' };
        if (mins <= 15) return { label: 'Warning', cls: 'warning' };
        return { label: 'Offline', cls: 'offline' };
    };

    const { date, time } = formatDateTime(currentDateTime);
    const hasActiveVideo = activeVideo && activeVideo.status === 'active' && !videoError;
    const tvStatus = getTvStatus();

    /* Filter branch dropdown by search */
    const filteredBranches = branches.filter(b =>
        !branchSearch ||
        b.name?.toLowerCase().includes(branchSearch.toLowerCase()) ||
        b.code?.toLowerCase().includes(branchSearch.toLowerCase())
    );

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

            {/* ⭐ Branch Selector */}
            <div className="preview-branch-selector">
                <div className="selector-field">
                    <label><i className="fas fa-building"></i> District</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setBranchSearch('');
                        }}
                    >
                        {districts.length === 0 && <option value="">— No districts —</option>}
                        {districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="selector-field">
                    <label><i className="fas fa-code-branch"></i> Branch</label>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        {filteredBranches.length === 0 && <option value="">— No branches —</option>}
                        {filteredBranches.map(b => (
                            <option key={b.id} value={b.code}>
                                {b.code} — {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selector-field">
                    <label><i className="fas fa-search"></i> Search</label>
                    <input
                        type="text"
                        placeholder="Filter branch..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* ⭐ Branch Info Bar */}
            {branchInfo && (
                <div className="preview-branch-info">
                    <span className="branch-name">
                        <i className="fas fa-map-marker-alt"></i>
                        {branchInfo.code} — {branchInfo.name}
                    </span>
                    {branchInfo.district_name && (
                        <span className="branch-district">
                            <i className="fas fa-building"></i>
                            {branchInfo.district_name}
                        </span>
                    )}
                    <span className={`tv-status ${tvStatus.cls}`}>
                        <i className="fas fa-circle"></i>
                        TV {tvStatus.label}
                        {branchInfo.last_heartbeat && (
                            <small>
                                {new Date(branchInfo.last_heartbeat).toLocaleTimeString()}
                            </small>
                        )}
                    </span>
                </div>
            )}

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
                            {hasActiveVideo ? (
                                <div className="mini-video-container">
                                    {activeVideo.video_type === 'local' ? (
                                        <video
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            onError={handleVideoError}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        >
                                            <source src={activeVideo.embed_url} type="video/mp4" />
                                            Your browser does not support video.
                                        </video>
                                    ) : (
                                        <iframe
                                            src={activeVideo.embed_url || getEmbedUrl(activeVideo.video_url, activeVideo.video_type)}
                                            title={activeVideo.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            onError={handleVideoError}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                        ></iframe>
                                    )}
                                    <div className="mini-video-caption">
                                        <i className="fas fa-play-circle"></i>
                                        {activeVideo.title}
                                    </div>
                                </div>
                            ) : (
                                <div className="mini-video-placeholder">
                                    {videoError ? (
                                        <>
                                            <i className="fas fa-exclamation-triangle"></i>
                                            <p>Video failed to load</p>
                                            <small>Click refresh to try again</small>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-video-slash"></i>
                                            <p>No active video</p>
                                            <small>Enable a video in Video Manager</small>
                                        </>
                                    )}
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
                                <span className="rates-count">{currencies.length} currencies</span>
                            </div>
                            <div className="mini-rates-list">
                                {currencies.slice(0, expanded ? 10 : 5).map(currency => (
                                    <div key={currency.id} className="mini-rate-card">
                                        <div className="mini-currency-info">
                                            <span className="mini-flag">{currency._flag}</span>
                                            <span className="mini-currency-code">{currency._code}</span>
                                            <span className="mini-currency-name">{currency._name}</span>
                                        </div>
                                        <div className="mini-rate-values">
                                            <span className="mini-sell">
                                                <i className="fas fa-arrow-up"></i>
                                                {formatNumber(currency.sell_rate)}
                                            </span>
                                            <span className="mini-buy">
                                                <i className="fas fa-arrow-down"></i>
                                                {formatNumber(currency.buy_rate)}
                                            </span>
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
                            <span>🏦 Dashen Bank - Authorized by NBE</span>
                            <span>📞 6333</span>
                            <span>💱 Competitive Exchange Rates</span>
                            {branchInfo?.district_name && (
                                <span>🏢 {branchInfo.district_name}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Actions */}
                <div className="preview-actions">
                    <button
                        className="view-full-btn"
                        onClick={() => window.open(`/?branch=${selectedBranch || ''}`, '_blank')}
                        disabled={!selectedBranch}
                    >
                        <i className="fas fa-external-link-alt"></i>
                        Open {selectedBranch || 'this branch'}'s TV
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