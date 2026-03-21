import React from 'react';
import { MESSAGES } from '../../utils/constants';
import './Alert.css';

const Alert = ({ type = 'info', message, title, onClose }) => {
    const getDefaultTitle = () => {
        switch(type) {
            case 'success': return 'Success!';
            case 'error': return 'Error!';
            case 'warning': return 'Warning!';
            case 'info': return 'Information';
            default: return 'Notice';
        }
    };

    const getDefaultMessage = () => {
        switch(type) {
            case 'success': return MESSAGES.LOGIN_SUCCESS;
            case 'error': return MESSAGES.SERVER_ERROR;
            case 'warning': return MESSAGES.VALIDATION_ERROR;
            default: return '';
        }
    };

    const displayTitle = title || getDefaultTitle();
    const displayMessage = message || getDefaultMessage();

    return (
        <div className={`alert alert-${type}`}>
            <div className="alert-content">
                {displayTitle && <div className="alert-title">{displayTitle}</div>}
                <div className="alert-message">{displayMessage}</div>
            </div>
            {onClose && (
                <button className="alert-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            )}
        </div>
    );
};

export default Alert;