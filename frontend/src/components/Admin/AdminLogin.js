import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MESSAGES } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
            setError(result.error || MESSAGES.LOGIN_FAILED);
        }
        
        setLoading(false);
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
                    <Input
                        label="Username"
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        icon="user"
                        disabled={loading}
                    />
                    
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        icon="lock"
                        disabled={loading}
                    />
                    
                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                    
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        icon="sign-in-alt"
                    >
                        Login
                    </Button>
                </form>
                
                <div className="login-footer">
                    <small>Secure system access. All activities are logged.</small>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;