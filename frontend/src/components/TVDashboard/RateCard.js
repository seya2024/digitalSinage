import React, { useState } from 'react';
import { formatNumber, calculateSpread } from '../../utils/formatters';
import { CURRENCY_FLAGS, CURRENCY_NAMES, CURRENCY_SYMBOLS } from '../../utils/constants';
import './RateCard.css';

const RateCard = ({ currency, index = 0, onClick, showTrend = true }) => {
    const [flagError, setFlagError] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Get country code for flag
    const getCountryCode = (code) => {
        if (!code) return 'unknown';
        return CURRENCY_FLAGS[code] || code.toLowerCase().slice(0, 2);
    };

    // Safe number formatting
    const safeFormatNumber = (value) => {
        if (value === null || value === undefined) return '0.0000';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0.0000' : num.toFixed(4);
    };

    // Get values with fallbacks
    const currencyName = currency?.name || CURRENCY_NAMES[currency?.code] || 'Unknown';
    const currencyCode = currency?.code || 'N/A';
    const currencySymbol = currency?.symbol || CURRENCY_SYMBOLS[currency?.code] || '';
    const currencyIcon = currency?.icon || 'fa-money-bill-wave';
    
    // Parse rates safely
    const sellRate = currency?.sell_rate !== undefined ? parseFloat(currency.sell_rate) : null;
    const buyRate = currency?.buy_rate !== undefined ? parseFloat(currency.buy_rate) : null;
    
    // Calculate spread
    const spread = calculateSpread(buyRate, sellRate);
    
    // Format rates
    const formattedSellRate = safeFormatNumber(sellRate);
    const formattedBuyRate = safeFormatNumber(buyRate);
    
    // Flag URL
    const flagUrl = `https://flagcdn.com/w40/${getCountryCode(currencyCode)}.png`;
    
    // Determine trend
    const getTrend = () => {
        if (!showTrend) return null;
        if (spread > 0) return 'up';
        if (spread < 0) return 'down';
        return 'stable';
    };
    
    const trend = getTrend();
    
    const trendIcon = {
        up: 'fa-arrow-up',
        down: 'fa-arrow-down',
        stable: 'fa-minus'
    };
    
    const trendColor = {
        up: '#10b981',
        down: '#ef4444',
        stable: '#6b7280'
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(currency);
        }
        setExpanded(!expanded);
    };

    return (
        <div 
            className={`rate-card ${expanded ? 'expanded' : ''}`} 
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={handleCardClick}
        >
            {/* Card Header */}
            <div className="rate-card-header">
                <div className="currency-icon">
                    {!flagError ? (
                        <img 
                            src={flagUrl} 
                            alt={currencyCode} 
                            className="currency-flag"
                            onError={() => setFlagError(true)}
                        />
                    ) : (
                        <i className={`fas ${currencyIcon}`}></i>
                    )}
                </div>
                
                <div className="currency-info">
                    <div className="currency-name">
                        {currencyName}
                        {currencySymbol && <span className="currency-symbol">{currencySymbol}</span>}
                    </div>
                    <div className="currency-code">{currencyCode}</div>
                </div>
                
                {showTrend && trend && (
                    <div className="trend-indicator" style={{ color: trendColor[trend] }}>
                        <i className={`fas ${trendIcon[trend]}`}></i>
                    </div>
                )}
            </div>
            
            {/* Card Body - Rates */}
            <div className="rate-card-body">
                <div className="rate-item sell">
                    <div className="rate-label">
                        <i className="fas fa-arrow-up"></i>
                        SELLING
                    </div>
                    <div className="rate-value sell-rate">
                        {formattedSellRate}
                    </div>
                    <div className="rate-unit">ETB</div>
                </div>
                
                <div className="rate-divider"></div>
                
                <div className="rate-item buy">
                    <div className="rate-label">
                        <i className="fas fa-arrow-down"></i>
                        BUYING
                    </div>
                    <div className="rate-value buy-rate">
                        {formattedBuyRate}
                    </div>
                    <div className="rate-unit">ETB</div>
                </div>
            </div>
            
            {/* Card Footer */}
            <div className="rate-card-footer">
                <div className="footer-info">
                    <i className="fas fa-chart-line"></i>
                    <span>Spread: {spread}</span>
                </div>
                <div className="footer-info">
                    <i className="fas fa-percent"></i>
                    <span>1 {currencyCode} = {formattedSellRate} ETB</span>
                </div>
            </div>
            
            {/* Expanded Details (on click) */}
            {expanded && (
                <div className="rate-card-expanded">
                    <div className="expanded-details">
                        <div className="detail-row">
                            <span>Last Updated:</span>
                            <strong>{currency?.updated_at ? new Date(currency.updated_at).toLocaleString() : 'N/A'}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Effective Date:</span>
                            <strong>{currency?.effective_date ? new Date(currency.effective_date).toLocaleDateString() : 'N/A'}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Spread Percentage:</span>
                            <strong>{((parseFloat(spread) / parseFloat(formattedSellRate)) * 100).toFixed(2)}%</strong>
                        </div>
                        <div className="detail-row">
                            <span>Status:</span>
                            <strong className={currency?.is_active ? 'status-active' : 'status-inactive'}>
                                {currency?.is_active ? 'Active' : 'Inactive'}
                            </strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateCard;