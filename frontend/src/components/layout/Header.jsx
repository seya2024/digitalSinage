import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import './Header.css';

const Header = ({ title = "DASHEN BANK", tagline = "Exchange Rate Board", showDateTime = true }) => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const formatDateTime = (date) => ({
        date: date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true 
        })
    });

    const { date, time } = formatDateTime(currentDateTime);

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo">
                    <i className="fas fa-landmark"></i>
                    <div className="logo-text">
                        <h1>{title}</h1>
                        {tagline && <span className="tagline">{tagline}</span>}
                    </div>
                </div>
            </div>

            {showDateTime && (
                <div className="header-datetime">
                    <div className="date">
                        <i className="far fa-calendar-alt"></i>
                        <span>{date}</span>
                    </div>
                    <div className="time">
                        <i className="far fa-clock"></i>
                        <span>{time}</span>
                    </div>
                </div>
            )}

            {user && (
                <div className="header-user">
                    <div className="user-info">
                        <i className="fas fa-user-circle"></i>
                        <div className="user-details">
                            <span className="username">{user.username}</span>
                            <span className="user-role">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;