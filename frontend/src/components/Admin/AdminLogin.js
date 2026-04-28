import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MESSAGES } from '../../utils/constants';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login(username, password);
        
        if (result.success) {
            navigate('/admin/panel');
        } else {
            setError(result.error || 'Login failed. Please check your credentials.');
        }
        
        setLoading(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="login-header">
                    <div className="logo-icon">
                        <img src="/images/logo.png" alt="Dashen Bank"  className="logo-image"
                              
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/80x80?text=DB";
                            }}
                        />
                    </div>
                    {/* <h2>ዳሽን ባንክ</h2> */}
                    <p>ዕለታዊ የውጭ ምንዛሪ ገበያ ተመኖች</p>
                    <small>Exchange Rate Management System</small>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Username Field */}
                    <div className="input-group">
                        <label>
                            <i className="fas fa-user"></i> Username 
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="input-field"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>
                    </div>
                    
                    {/* Password Field with Toggle */}
                    <div className="input-group">
                        <label>
                            <i className="fas fa-lock"></i> Password 
                        </label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                tabIndex="-1"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                    
                    {/* Login Button */}
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Logging in...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                Login
                            </>
                        )}
                    </button>
                </form>


                <div className="login-footer">
    <small>
        <i className="fas fa-shield-alt"></i> Developed by : Seid Mohammed.
    </small>
    <small style={{ display: 'block', marginTop: '10px' }}>
        <i className="far fa-copyright"></i> 2026 Dashen Bank S.C. All rights reserved.
    </small>
</div>

            </div>
        </div>
    );
};

export default AdminLogin;