import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const success = await login(username, password);
            if (success) {
                navigate('/admin/panel');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="login-header">
                    <i className="fas fa-landmark"></i>
                    <h2>Dashen Bank</h2>
                    <p>Administrator Login</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label><i className="fas fa-user"></i> Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label><i className="fas fa-lock"></i> Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    
                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin"></i> Logging in...</>
                        ) : (
                            <><i className="fas fa-sign-in-alt"></i> Login</>
                        )}
                    </button>
                </form>
                
                <div className="login-footer">
                    <small>Default: admin / admin123</small>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;