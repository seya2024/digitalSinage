import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

const Alert = ({
    type = 'info',
    message,
    title = null,
    dismissible = false,
    autoClose = false,
    autoCloseDelay = 5000,
    onClose = null,
    icon = null,
    className = ''
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (autoClose && visible) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay, visible]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) onClose();
    };

    if (!visible) return null;

    const getIcon = () => {
        if (icon) return icon;
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    };

    const getTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success': return 'Success!';
            case 'error': return 'Error!';
            case 'warning': return 'Warning!';
            case 'info': return 'Information';
            default: return 'Information';
        }
    };

    return (
        <div className={`alert alert-${type} ${className} ${dismissible ? 'alert-dismissible' : ''}`} role="alert">
            <div className="alert-icon">
                <i className={`fas fa-${getIcon()}`}></i>
            </div>
            <div className="alert-content">
                <div className="alert-title">{getTitle()}</div>
                <div className="alert-message">{message}</div>
            </div>
            {dismissible && (
                <button className="alert-close" onClick={handleClose}>
                    <i className="fas fa-times"></i>
                </button>
            )}
        </div>
    );
};

Alert.propTypes = {
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    dismissible: PropTypes.bool,
    autoClose: PropTypes.bool,
    autoCloseDelay: PropTypes.number,
    onClose: PropTypes.func,
    icon: PropTypes.string,
    className: PropTypes.string
};

Alert.defaultProps = {
    type: 'info',
    dismissible: false,
    autoClose: false,
    autoCloseDelay: 5000,
    className: ''
};

export default Alert;