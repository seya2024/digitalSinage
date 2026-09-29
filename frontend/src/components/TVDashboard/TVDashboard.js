import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import { currencyService } from '../../services/currencyService';
import { videoService } from '../../services/videoService';
import { branchService } from '../../services/branchService';
import './TVDashboard.css';
import api from '../../services/api';

/* ═══════════════════════════════════════════════════════════
   FLAG HELPERS
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

/* ═══════════════════════════════════════════════════════════
   EXTRACT CURRENCY DATA
   ═══════════════════════════════════════════════════════════ */
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

const TVDashboard = () => {
    const [currencies, setCurrencies] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [error, setError] = useState(null);
    const [hasActiveVideo, setHasActiveVideo] = useState(false);

    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [usingCache, setUsingCache] = useState(false);
    const [cacheAge, setCacheAge] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const [showTransition, setShowTransition] = useState(false);

    // ⭐ Branch state
    const [branch, setBranch] = useState(null);

    // Auto-scroll refs
    const ratesScrollRef = useRef(null);
    const scrollAnimRef = useRef(null);
    const pauseTimerRef = useRef(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const [scrollDirection, setScrollDirection] = useState('down');
    const scrollEnabledRef = useRef(false);

    /* ─── Branch code from URL ─── */
    const branchCode = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('branch') || null;
    }, []);

    /* ─── Load Branch Info ─── */
    useEffect(() => {
        const loadBranch = async () => {
            if (!branchCode) {
                setBranch(null);
                return;
            }
            try {
                const res = await branchService.getByCode(branchCode);
                if (res.success) {
                    setBranch(res.data);
                } else {
                    console.warn('Branch not found:', branchCode);
                    setBranch(null);
                }
            } catch (err) {
                console.error('Failed to load branch:', err);
                setBranch(null);
            }
        };
        loadBranch();

        // Refresh branch info every 5 minutes (message updates)
        const branchInterval = setInterval(loadBranch, 300000);
        return () => clearInterval(branchInterval);
    }, [branchCode]);

    /* ─── Heartbeat — ping backend every 60 seconds ─── */
    useEffect(() => {
        if (!branchCode || !branch) return;

        const sendHeartbeat = async () => {
            try {
                await api.post(`/branches/${branchCode}/heartbeat`, {
                    version: 'v2.0'
                });
                console.log('✅ Heartbeat sent');
            } catch (err) {
                console.warn('Heartbeat failed:', err.message);
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 60000);
        return () => clearInterval(interval);
    }, [branchCode, branch]);

    /* ─── Data Loading ─── */
    const loadData = useCallback(async () => {
        try {
            setError(null);
            setConnectionStatus('connecting');

            const [ratesRes, videoRes] = await Promise.all([
                currencyService.getAll(),
                videoService.getActiveVideo()
            ]);

            setConnectionStatus('connected');
            setUsingCache(false);
            setCacheAge(null);
            setRetryCount(0);

            if (ratesRes.success) {
                const rows = ratesRes.data || [];

                const formattedRates = rows.map((row) => {
                    const cur = extractCurrency(row);

                    let flag = '💱';
                    if (cur.countryCode && cur.countryCode.length === 2) {
                        flag = countryCodeToFlag(cur.countryCode);
                    } else if (currencyToFlagMap[cur.code]) {
                        flag = currencyToFlagMap[cur.code];
                    }

                  // ⭐ Compute rate direction (up / down / same)
                    const sellToday = row.sell_rate ? parseFloat(row.sell_rate) : null;
                    const sellPrev  = row.prev_sell_rate ? parseFloat(row.prev_sell_rate) : null;
                    const buyToday  = row.buy_rate  ? parseFloat(row.buy_rate)  : null;
                    const buyPrev   = row.prev_buy_rate ? parseFloat(row.prev_buy_rate) : null;

                    const sellDiff = (sellToday != null && sellPrev != null) ? sellToday - sellPrev : 0;
                    const buyDiff  = (buyToday  != null && buyPrev  != null) ? buyToday  - buyPrev  : 0;

                    const sellDir = sellDiff > 0 ? 'up' : sellDiff < 0 ? 'down' : 'same';
                    const buyDir  = buyDiff  > 0 ? 'up' : buyDiff  < 0 ? 'down' : 'same';
                   ////////////////////////////////////
                    return {
                        id: row.id,
                        sell_rate: row.sell_rate ? parseFloat(row.sell_rate) : null,
                        buy_rate: row.buy_rate ? parseFloat(row.buy_rate) : null,
                        effective_date: row.effective_date || '',
                        status: row.status || 'active',
                        updated_at: row.updated_at || '',
                        _flag: flag,
                        _name: cur.name || cur.code || 'Unknown',
                        _code: cur.code || 'N/A',
                        _symbol: cur.symbol || '',
                        _icon: cur.icon,
                        _sellDir: sellDir,
                        _buyDir:  buyDir,
                        _sellDiff: sellDiff,
                        _buyDiff:  buyDiff,
                    };
                });

                setCurrencies(formattedRates);

                if (formattedRates.length > 0) {
                    const first = formattedRates[0];
                    if (first.updated_at) {
                        setLastUpdate(new Date(first.updated_at).toLocaleString());
                    }
                    if (first.effective_date) {
                        const ed = new Date(first.effective_date);
                        setEffectiveDate(ed.toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        }));
                    }
                }

                // ⭐ SAVE TO CACHE
                try {
                    localStorage.setItem('dashen_tv_cache', JSON.stringify({
                        currencies: formattedRates,
                        effectiveDate: formattedRates[0]?.effective_date || '',
                        lastUpdate: new Date().toISOString(),
                        timestamp: Date.now()
                    }));
                    console.log('✅ Cache saved:', formattedRates.length, 'currencies');
                } catch (e) {
                    console.warn('Cache save failed:', e);
                }
            } else {
                setError('Failed to load exchange rates');
                setConnectionStatus('error');
            }

            const hasVideo = videoRes.success && videoRes.data !== null && videoRes.data.status === 'active';
            setShowTransition(true);
            setTimeout(() => setShowTransition(false), 600);
            setHasActiveVideo(hasVideo);
            setActiveVideo(hasVideo ? videoRes.data : null);

        } catch (err) {
            console.error('❌ Error loading TV data:', err);
            setConnectionStatus('error');
            setRetryCount(prev => prev + 1);

            // ⭐ LOAD FROM CACHE
            console.log('🔄 Attempting to load from cache...');
            try {
                const cached = localStorage.getItem('dashen_tv_cache');
                console.log('Cache found?', !!cached);

                if (cached) {
                    const { currencies: c, lastUpdate: lu, timestamp } = JSON.parse(cached);
                    console.log('Cached currencies:', c?.length);

                    if (Array.isArray(c) && c.length > 0) {
                        setCurrencies(c);
                        setUsingCache(true);
                        setCacheAge(Math.floor((Date.now() - timestamp) / 1000));
                        if (lu) setLastUpdate(new Date(lu).toLocaleString());
                        setError(null);
                        console.log('✅ usingCache = true, banner should show');
                        return;
                    }
                }
                console.log('⚠ No usable cache — showing error');
                setError(`Connection error. Retrying (${retryCount + 1})...`);
            } catch (cacheErr) {
                console.warn('Cache read failed:', cacheErr);
                setError(`Connection error. Retrying (${retryCount + 1})...`);
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    /* ─── Init & Intervals ─── */
    useEffect(() => {
        loadData();
        const dataInterval = setInterval(loadData, 30000);
        const timeInterval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(timeInterval);
            cancelAnimationFrame(scrollAnimRef.current);
            clearTimeout(pauseTimerRef.current);
        };
    }, [loadData]);

    /* ─── Offline mode cache-age ticker ─── */
    useEffect(() => {
        if (!usingCache || !cacheAge) return;
        const t = setInterval(() => {
            setCacheAge(prev => (prev ? prev + 1 : 1));
        }, 1000);
        return () => clearInterval(t);
    }, [usingCache, cacheAge]);

    /* ─── Auto-Scroll Logic ─── */
    const startAutoScroll = useCallback(() => {
        cancelAnimationFrame(scrollAnimRef.current);
        if (!ratesScrollRef.current) return;
        const container = ratesScrollRef.current;
        const canScroll = container.scrollHeight > container.clientHeight + 40;
        scrollEnabledRef.current = canScroll;
        if (!canScroll) return;

        let lastTime = performance.now();
        const animate = (now) => {
            if (!isAutoScrolling || !ratesScrollRef.current) return;
            const delta = now - lastTime;
            lastTime = now;
            const speed = 0.03 * delta;
            const c = ratesScrollRef.current;
            const maxScroll = c.scrollHeight - c.clientHeight;

            if (scrollDirection === 'down') {
                c.scrollTop += speed;
                if (c.scrollTop >= maxScroll - 1) {
                    setScrollDirection('up');
                    c.scrollTop = maxScroll;
                }
            } else {
                c.scrollTop -= speed;
                if (c.scrollTop <= 1) {
                    setScrollDirection('down');
                    c.scrollTop = 0;
                }
            }
            scrollAnimRef.current = requestAnimationFrame(animate);
        };
        scrollAnimRef.current = requestAnimationFrame(animate);
    }, [isAutoScrolling, scrollDirection]);

    useEffect(() => {
        if (currencies.length > 0 && ratesScrollRef.current) {
            const container = ratesScrollRef.current;
            if (container.scrollHeight > container.clientHeight + 40) {
                scrollEnabledRef.current = true;
                if (isAutoScrolling) startAutoScroll();
            }
        }
    }, [currencies, isAutoScrolling, startAutoScroll]);

    const pauseAutoScroll = useCallback((resumeDelay = 10000) => {
        setIsAutoScrolling(false);
        cancelAnimationFrame(scrollAnimRef.current);
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => setIsAutoScrolling(true), resumeDelay);
    }, []);

    useEffect(() => {
        if (isAutoScrolling && scrollEnabledRef.current) startAutoScroll();
        return () => cancelAnimationFrame(scrollAnimRef.current);
    }, [isAutoScrolling, startAutoScroll]);

    /* ⭐ Helper — formats seconds into "5m ago" / "2h ago" */
    const formatCacheAge = (seconds) => {
        if (!seconds) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    /* ─── Formatters ─── */
    const { date, time, dayName } = useMemo(() => {
        const d = currentDateTime;
        return {
            date: d.toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            }),
            time: d.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            }),
            dayName: d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
        };
    }, [currentDateTime]);

    const formatRate = (val) => {
        if (val == null) return '—';
        return val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
    };

    /* ─── Footer Messages for Scrolling Ticker ─── */
    const footerMessages = useMemo(() => [
        { text: 'አንኳን ወደ ዳሻን ባንክ በደህና መጡ። — ዳሻን ባንክ ሁልጊዜም አንድ እርምጃ ቀዳሚ!' },
        { text: 'Welcome to Dashen Bank — Dashen Bank Always One Step Ahead' },
        { text: 'አንኳን ወደ ዳሻን ባንክ በደህና መጡ። — ዳሻን ባንክ ሁልጊዜም አንድ እርምጃ ቀዳሚ!' },
        { text: 'Welcome to Dashen Bank — Dashen Bank Always One Step Ahead' },
        { text: 'አንኳን ወደ ዳሻን ባንክ በደህና መጡ። — ሁልጊዜም አንድ እርምጃ ቀዳሚ!' },
        { text: 'Welcome to Dashen Bank — Dashen Bank Always One Step Ahead' },
    ], []);

    /* ─── Loading State ─── */
    if (loading) {
        return (
            <div className="tv-loading">
                <div className="tv-loading-inner">
                    <div className="loading-logo">
                        <div className="loading-icon-ring">
                            <i className="fas fa-landmark"></i>
                        </div>
                    </div>
                    <h2> ዳሽን ባንክ </h2>
                    <div className="loading-bar">
                        <div className="loading-bar-fill"></div>
                    </div>
                    <p>Initializing Exchange Rate Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tv-dashboard">
            {/* Background Effects */}
            <div className="tv-bg-effects">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
                <div className="bg-grid-overlay"></div>
            </div>

            {/* Header */}
            <header className="tv-header">
                <div className="header-left">
                    <div className="bank-logo">
                        <img src="/images/logo.png" alt="Dashen Bank" className="logo-image" />
                        <div className="logo-text">
                            <h1>
                                ዳሽን <span className="bank-small">ባንክ</span>
                            </h1>
                            <span className="logo-subtitle">Dashen Bank</span>
                        </div>
                    </div>

                    <div className="header-badge">
                        <div className="badge-icon">
                            <i className="fas fa-tower-cell"></i>
                        </div>
                        <div className="badge-content">
                            <span className="badge-number">24/7 Customer Care : 6333</span>
                        </div>
                    </div>
                </div>

                <div className="header-right">
                    <div className="rate-count-badge">
                        <i className="fas fa-coins"></i>
                        <span>{currencies.length} Currencies</span>
                    </div>

                    <div className="datetime-block">
                        <div className="dt-day">{dayName}</div>
                        <div className="dt-dates-container">
                            <div className="dt-date-gregorian">
                                <span>{date}</span>
                            </div>
                        </div>
                        <div className="dt-time">
                            <span className="time-pulse"></span>
                            {time}
                        </div>
                    </div>

                    <div className={`connection-dot ${connectionStatus}`}>
                        <span className="dot-tooltip">
                            {connectionStatus === 'connected' ? 'Live' :
                             connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
                        </span>
                    </div>
                </div>
            </header>

            {/* ⭐ Red Warning — Unknown / Missing Branch */}
            {!branch && (
                <div className="tv-warning-bar">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>
                        <strong>⚠ INVALID BRANCH</strong> —
                        {branchCode ? ` Branch "${branchCode}" not found.` : ' No branch code set.'}
                        {' '}Add <code>?branch=CODE</code> to the URL.
                    </span>
                </div>
            )}

            {/* ⭐ Offline Mode Banner */}
            {usingCache && (
                <div className="tv-offline-bar">
                    <i className="fas fa-wifi"></i>
                    <span>
                        <strong>OFFLINE MODE</strong> — Showing cached rates from {formatCacheAge(cacheAge)}
                    </span>
                    <span className="offline-retry">
                        <i className="fas fa-sync-alt"></i> Retrying in 30s
                    </span>
                </div>
            )}

            {/* Error Bar */}
            {error && (
                <div className="tv-error-bar">
                    <div className="error-content">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                        <button onClick={loadData} className="retry-btn">
                            <i className="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`tv-main ${showTransition ? 'fade-transition' : ''}`}>
                {hasActiveVideo && activeVideo ? (
                    <div className="tv-split-layout">
                        <div className="tv-video-panel">
                            <div className="panel-label">
                                <i className="fas fa-play-circle"></i> Now Showing
                            </div>
                            <VideoPlayer video={activeVideo} />
                            <div className="video-info-bar">
                                <span className="video-title">{activeVideo?.title || 'Promotional Video'}</span>
                                <span className="video-live-badge">
                                    <span className="live-dot"></span> LIVE
                                </span>
                            </div>
                        </div>

                        <div className="tv-rates-panel">
                            <div className="rates-panel-header">
                                <h2>
                                    <i className="fas fa-chart-line"></i>
                                    Daily Exchange Rates
                                </h2>
                                <div className="rates-panel-meta">
                                    {effectiveDate && (
                                        <span className="effective-date-tag">
                                            <i className="fas fa-calendar-alt"></i> {effectiveDate}
                                        </span>
                                    )}
                                    {lastUpdate && (
                                        <span className="update-tag">
                                            <i className="fas fa-clock"></i> {lastUpdate}
                                        </span>
                                    )}
                                    {scrollEnabledRef.current && (
                                        <span className="scroll-tag">
                                            <i className="fas fa-arrows-alt-v"></i> Auto
                                        </span>
                                    )}
                                </div>
                            </div>

                         { /* Split screen */}  
                            <div className="rates-table-wrapper">
                                <div
                                    className="rates-table-body"
                                    ref={ratesScrollRef}
                                    onMouseEnter={() => cancelAnimationFrame(scrollAnimRef.current)}
                                    onMouseLeave={() => {
                                        if (isAutoScrolling && scrollEnabledRef.current) startAutoScroll();
                                    }}
                                    onWheel={() => pauseAutoScroll(12000)}
                                    onTouchStart={() => pauseAutoScroll(12000)}>

                                    <table className="rates-table">
                                        <thead>
                                            <tr>
                                                <th className="th-currency">CURRENCY</th>
                                                <th className="th-code">CODE</th>
                                                <th className="th-buy">BUYING (ETB)</th>
                                                <th className="th-sell">SELLING (ETB)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currencies.length > 0 ? currencies.map((item) => (
                                                <tr key={item.id} className="rate-row">
                                                    <td className="td-currency">
                                                        <span className="currency-name-cell">{item._name}</span>
                                                    </td>
                                                    <td className="td-code">
                                                        <span className="flag-icon">{item._flag}</span>
                                                        <span className="code-badge">{item._code}</span>
                                                    </td>

                                                    <td className="td-buy">
                                                        <span className="rate-val rate-buy">{formatRate(item.buy_rate)}</span>
                                                        <i className={`fas fa-arrow-${item._buyDir === 'up' ? 'up' : item._buyDir === 'down' ? 'down' : 'right'} rate-dir ${item._buyDir}`}></i>
                                                    </td>
                                                <td className="td-sell">
                                                <span className="rate-val rate-sell">{formatRate(item.sell_rate)}</span>
                                                <i 
                                                    className={`fas fa-arrow-${item._sellDir === 'up' ? 'up' : item._sellDir === 'down' ? 'down' : 'right'} rate-dir ${item._sellDir}`}
                                                    title={item._sellDiff !== 0 ? `${item._sellDiff > 0 ? '+' : ''}${item._sellDiff.toFixed(4)} vs yesterday` : 'No change'}
                                                ></i>
                                                  </td>

                                                    {/* <td className="td-buy">
                                                        <span className="rate-val rate-buy">{formatRate(item.buy_rate)}</span>
                                                    </td>
                                                    <td className="td-sell">
                                                        <span className="rate-val rate-sell">{formatRate(item.sell_rate)}</span>
                                                    </td> */}

                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="td-empty">
                                                        <div className="empty-inline">
                                                            <i className="fas fa-chart-line"></i>
                                                            <p>No exchange rates available</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="tv-fullscreen-rates">
                        <div className="fullscreen-header">
                            <h2>
                                <i className="fas fa-exchange-alt"></i>
                                Daily Exchange Rates Against Ethiopian Birr (ETB)
                            </h2>
                            <div className="fullscreen-meta">
                                {effectiveDate && (
                                    <span className="effective-date-tag">
                                        <i className="fas fa-calendar-alt"></i> {effectiveDate}
                                    </span>
                                )}
                                {lastUpdate && (
                                    <span className="update-tag">
                                        <i className="fas fa-clock"></i> Updated: {lastUpdate}
                                    </span>
                                )}
                                {scrollEnabledRef.current && (
                                    <span className="scroll-tag">
                                        <i className="fas fa-arrows-alt-v"></i> Auto-scrolling
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            className="fullscreen-grid"
                            ref={ratesScrollRef}
                            onMouseEnter={() => cancelAnimationFrame(scrollAnimRef.current)}
                            onMouseLeave={() => {
                                if (isAutoScrolling && scrollEnabledRef.current) startAutoScroll();
                            }}
                            onWheel={() => pauseAutoScroll(12000)}
                            onTouchStart={() => pauseAutoScroll(12000)}>
                            {currencies.length > 0 ? (
                                <div className="grid-cards">
                                    {currencies.map((item) => (
                                        <div key={item.id} className="grid-card">
                                            <div className="grid-card-top">
                                                <span className="grid-flag-box">{item._flag}</span>
                                                <div className="grid-cur-info">
                                                    <span className="grid-cur-name">{item._name}</span>
                                                    <span className="grid-cur-code">{item._code}</span>
                                                </div>
                                                {item._symbol && (
                                                    <span className="grid-cur-symbol">{item._symbol}</span>
                                                )}
                                            </div>
                                            <div className="grid-card-rates">
                                                <div className="grid-rate-block grid-buy-block">
                                                    <span className="grid-rate-label">BUYING</span>
                                                    <span className="grid-rate-num">{formatRate(item.buy_rate)}</span>
                                                </div>
                                                <div className="grid-rate-sep"></div>
                                                <div className="grid-rate-block grid-sell-block">
                                                    <span className="grid-rate-label">SELLING</span>
                                                    <span className="grid-rate-num">{formatRate(item.sell_rate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-fullscreen">
                                    <i className="fas fa-chart-line"></i>
                                    <p>No exchange rates available</p>
                                    <small>Please check back later</small>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="tv-footer">
                <div className="footer-left">
                    <div className={`brand-logo ${!branch ? 'unknown-branch' : ''}`}>
                        <i className={`fas ${!branch ? 'fa-exclamation-triangle' : 'fa-map-marker-alt'}`}></i>
                        <span className="brand-name">
                            {branch?.name || (branchCode ? `Unknown: ${branchCode}` : '')}  {/* Unknown branch */}
                        </span>
                    </div>
                    {branch?.district_name && (
                        <div className="footer-contact">
                            <i className="fas fa-building"></i>
                            <span>{branch.district_name}</span>
                        </div>
                    )}
                </div>

                <div className="footer-center">
                    <div className="welcome-banner">
                        <div className="welcome-text-amharic">
                            {branch?.message ? (
                                <span className="welcome-message-white">
                                    {branch.message}
                                </span>
                            ) : (
                                <div className="dt-dates">
                                    <span className="gregorian-date">📅 12/06/2026 G.C</span>
                                    <span className="ethiopian-date">| 20/02/2018 ዓ.ም</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ticker-track">
                        <div className="ticker-content">
                            {[...footerMessages, ...footerMessages].map((msg, i) => (
                                <span key={i} className="ticker-item">
                                    <i className={`fas ${msg.icon}`}></i>
                                    <span className="ticker-separator">✦</span>
                                    {msg.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="footer-right">
                    <div className="footer-status">
                        <span className={`status-dot ${connectionStatus === 'connected' ? 'live' : 'connecting'}`}></span>
                        <span className="status-text">
                            {connectionStatus === 'connected' ? 'LIVE' : 'CONNECTING'}
                        </span>
                    </div>
                    <div className="footer-divider"></div>
                    <div className="footer-version">
                        <i className="fas fa-code-branch"></i>
                        <span>v2.0</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TVDashboard;