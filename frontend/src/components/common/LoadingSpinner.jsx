import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
    size = 'md', 
    color = 'primary', 
    text = null,
    fullPage = false,
    overlay = false
}) => {
    const spinnerClasses = [
        'spinner',
        `spinner-${size}`,
        `spinner-${color}`,
        overlay && 'spinner-overlay',
        fullPage && 'spinner-fullpage'
    ].filter(Boolean).join(' ');

    if (fullPage) {
        return (
            <div className="spinner-fullpage-container">
                <div className={spinnerClasses}>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                {text && <p className="spinner-text">{text}</p>}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="spinner-overlay-container">
                <div className={spinnerClasses}>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                {text && <p className="spinner-text">{text}</p>}
            </div>
        );
    }

    return (
        <div className="spinner-wrapper">
            <div className={spinnerClasses}>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.oneOf(['primary', 'secondary', 'white', 'dark']),
    text: PropTypes.string,
    fullPage: PropTypes.bool,
    overlay: PropTypes.bool
};

LoadingSpinner.defaultProps = {
    size: 'md',
    color: 'primary',
    fullPage: false,
    overlay: false
};

export default LoadingSpinner;