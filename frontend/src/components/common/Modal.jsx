import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    footer = null,
    className = ''
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen && closeOnEsc) {
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, closeOnEsc, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-container modal-${size} ${className}`} ref={modalRef}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        <i className={`fas fa-${title.icon || 'info-circle'}`}></i>
                        {title.text || title}
                    </h3>
                    {showCloseButton && (
                        <button className="modal-close" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                
                <div className="modal-body">
                    {children}
                </div>
                
                {footer !== null && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ text: PropTypes.string, icon: PropTypes.string })
    ]).isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    showCloseButton: PropTypes.bool,
    closeOnOverlayClick: PropTypes.bool,
    closeOnEsc: PropTypes.bool,
    footer: PropTypes.node,
    className: PropTypes.string
};

Modal.defaultProps = {
    size: 'md',
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEsc: true,
    className: ''
};

export default Modal;