import React, { useState } from 'react';

const RateCard = ({ currency, index }) => {
    const [flagError, setFlagError] = useState(false);

    // Map currency codes to country codes for flags
    const getCountryCode = (code) => {
        const mapping = {
            'USD': 'us',
            'EUR': 'eu',      // European Union flag
            'GBP': 'gb',
            'SAR': 'sa',
            'CNY': 'cn',
            // Add more as needed
        };
        return mapping[code] || code.toLowerCase().slice(0, 2);
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') return '0.0000';
        const number = typeof num === 'string' ? parseFloat(num) : num;
        return isNaN(number) ? '0.0000' : number.toFixed(4);
    };

    const sell = currency?.sell_rate !== undefined ? parseFloat(currency.sell_rate) : null;
    const buy = currency?.buy_rate !== undefined ? parseFloat(currency.buy_rate) : null;
    const spread = (sell !== null && buy !== null) ? (buy - sell).toFixed(4) : '0.0000';

    const flagUrl = `https://flagcdn.com/w40/${getCountryCode(currency?.code)}.png`;
    const fallbackIcon = currency?.icon || 'fa-money-bill-wave';

    return (
        <div className="rate-card" style={{ animationDelay: `${(index || 0) * 0.05}s` }}>
            <div className="rate-card-header">
                <div className="currency-icon">
                    {!flagError ? (
                        <img
                            src={flagUrl}
                            alt={currency?.code}
                            className="currency-flag"
                            onError={() => setFlagError(true)}
                        />
                    ) : (
                        <i className={`fas ${fallbackIcon}`}></i>
                    )}
                </div>
                <div className="currency-info">
                    <div className="currency-name">{currency?.name || 'Unknown'}</div>
                    <div className="currency-code">{currency?.code || 'N/A'}</div>
                </div>
                <div className="trend-icon">
                    <i className="fas fa-chart-line"></i>
                </div>
            </div>
            
            <div className="rate-card-body">
                <div className="rate-item">
                    <div className="rate-label"><i className="fas fa-arrow-up"></i> SELLING</div>
                    <div className="rate-value sell-rate">{formatNumber(sell)}</div>
                </div>
                <div className="rate-divider"></div>
                <div className="rate-item">
                    <div className="rate-label"><i className="fas fa-arrow-down"></i> BUYING</div>
                    <div className="rate-value buy-rate">{formatNumber(buy)}</div>
                </div>
            </div>
            
            <div className="rate-card-footer">
                <span>ETB per unit</span>
                <span className="spread-info">
                    <i className="fas fa-chart-simple"></i> Spread: {spread}
                </span>
            </div>
        </div>
    );
};

export default RateCard;