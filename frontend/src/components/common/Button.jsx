import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    fullWidth = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    ...props
}) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        loading && 'btn-loading',
        fullWidth && 'btn-full-width',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <i className={`fas fa-${icon} btn-icon-left`}></i>
            )}
            <span className="btn-text">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <i className={`fas fa-${icon} btn-icon-right`}></i>
            )}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'dark', 'light']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    fullWidth: PropTypes.bool,
    icon: PropTypes.string,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    className: PropTypes.string
};

Button.defaultProps = {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
    fullWidth: false,
    iconPosition: 'left',
    className: ''
};

export default Button;