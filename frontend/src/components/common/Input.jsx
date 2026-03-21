import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    icon = null,
    iconPosition = 'left',
    helperText = '',
    className = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label className="input-label" htmlFor={name}>
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}
            <div className="input-container">
                {icon && iconPosition === 'left' && (
                    <i className={`fas fa-${icon} input-icon-left`}></i>
                )}
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={`input-field ${error ? 'error' : ''} ${icon ? 'with-icon' : ''}`}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                )}
                {icon && iconPosition === 'right' && (
                    <i className={`fas fa-${icon} input-icon-right`}></i>
                )}
            </div>
            {error && <div className="input-error">{error}</div>}
            {helperText && !error && <div className="input-helper">{helperText}</div>}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    icon: PropTypes.string,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    helperText: PropTypes.string,
    className: PropTypes.string
};

Input.defaultProps = {
    type: 'text',
    required: false,
    disabled: false,
    readOnly: false,
    iconPosition: 'left',
    className: ''
};

export default Input;