import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CurrencyManager from './CurrencyManager';
import PendingApprovals from './PendingApprovals';
import VideoManager from './VideoManager';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import TVDashboardPreview from './TVDashboardPreview';
import ProfileManager from './ProfileManager';  // Add this import
import { currencyService } from '../../services/currencyService';
import './AdminPanel.css';

// Rate History Component
const RateHistory = () => {
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Safe number formatting function
    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') return '0.0000';
        const number = typeof num === 'string' ? parseFloat(num) : num;
        return isNaN(number) ? '0.0000' : number.toFixed(4);
    };

    useEffect(() => {
        loadCurrencies();
    }, []);

    const loadCurrencies = async () => {
        try {
            const response = await currencyService.getAll();
            if (response.success) {
                setCurrencies(response.data || []);
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async (currencyId) => {
        try {
            const response = await currencyService.getRateHistory(currencyId);
            if (response.success) {
                const formattedHistory = (response.data || []).map(item => ({
                    ...item,
                    sell_rate: item.sell_rate ? parseFloat(item.sell_rate) : null,
                    buy_rate: item.buy_rate ? parseFloat(item.buy_rate) : null
                }));
                setHistory(formattedHistory);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleCurrencySelect = (currencyId) => {
        setSelectedCurrency(currencyId);
        if (currencyId) {
            loadHistory(currencyId);
        } else {
            setHistory([]);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading currencies...</div>;
    }

    return (
        <div className="rate-history">
            <div className="rate-history-header">
                <h2>
                    <i className="fas fa-chart-line"></i>
                    Rate History
                </h2>
                <p className="header-description">Track historical exchange rate changes</p>
            </div>

            <div className="history-controls">
                <div className="select-wrapper">
                    <i className="fas fa-search"></i>
                    <select 
                        onChange={(e) => handleCurrencySelect(e.target.value)} 
                        className="currency-select"
                        value={selectedCurrency || ''}
                    >
                        <option value="">Select a currency to view history</option>
                        {currencies.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedCurrency && (
                <div className="history-table-container">
                    <div className="history-header-info">
                        <h3>
                            <i className="fas fa-history"></i>
                            Rate Change History
                            {currencies.find(c => c.id == selectedCurrency) && (
                                <span className="currency-badge">
                                    {currencies.find(c => c.id == selectedCurrency)?.code}
                                </span>
                            )}
                        </h3>
                        <span className="history-count">{history.length} records found</span>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="empty-history">
                            <i className="fas fa-chart-line"></i>
                            <p>No rate history available for this currency</p>
                            <small>Rate changes will appear here when rates are updated</small>
                        </div>
                    ) : (
                        <div className="history-table-wrapper">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Selling Rate (ETB)</th>
                                        <th>Buying Rate (ETB)</th>
                                        <th>Spread</th>
                                        <th>Changed By</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h, index) => (
                                        <tr key={h.id || index}>
                                            <td className="date-cell">
                                                <i className="fas fa-calendar-alt"></i>
                                                <span>{new Date(h.created_at).toLocaleString()}</span>
                                            </td>
                                            <td className="sell-rate-cell">
                                                <span className="sell-rate-value">
                                                    {formatNumber(h.sell_rate)}
                                                </span>
                                            </td>
                                            <td className="buy-rate-cell">
                                                <span className="buy-rate-value">
                                                    {formatNumber(h.buy_rate)}
                                                </span>
                                            </td>
                                            <td className="spread-cell">
                                                <span className="spread-value">
                                                    {h.sell_rate && h.buy_rate ? 
                                                        formatNumber(h.buy_rate - h.sell_rate) : 
                                                        'N/A'}
                                                </span>
                                            </td>
                                            <td className="changed-by-cell">
                                                <div className="user-info">
                                                    <i className="fas fa-user-circle"></i>
                                                    <span>{h.changed_by_name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="action-cell">
                                                <span className={`action-badge ${h.action_type || 'update'}`}>
                                                    <i className={`fas fa-${h.action_type === 'delete' ? 'trash-alt' : 'edit'}`}></i>
                                                    {h.action_type || 'Update'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {!selectedCurrency && (
                <div className="select-prompt">
                    <i className="fas fa-chart-line"></i>
                    <h3>Select a Currency</h3>
                    <p>Choose a currency from the dropdown above to view its rate change history</p>
                </div>
            )}
        </div>
    );
};

// Settings Component
const Settings = () => {
    const [settings, setSettings] = useState({
        autoRefresh: 30,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        notifications: true
    });

    const handleSave = () => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    return (
        <div className="settings">
            <h2>System Settings</h2>
            <div className="settings-form">
                <div className="setting-group">
                    <label>Auto-Refresh Interval (seconds)</label>
                    <input 
                        type="number" 
                        value={settings.autoRefresh}
                        onChange={(e) => setSettings({...settings, autoRefresh: parseInt(e.target.value)})}
                        min="10"
                        max="300"
                    />
                </div>
                <div className="setting-group">
                    <label>Date Format</label>
                    <select value={settings.dateFormat} onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}>
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                    </select>
                </div>
                <div className="setting-group">
                    <label>Time Format</label>
                    <select value={settings.timeFormat} onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}>
                        <option>12h</option>
                        <option>24h</option>
                    </select>
                </div>
                <div className="setting-group checkbox">
                    <label>
                        <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({...settings, notifications: e.target.checked})} />
                        Enable Email Notifications
                    </label>
                </div>
                <button onClick={handleSave} className="save-settings-btn">
                    <i className="fas fa-save"></i> Save Settings
                </button>
            </div>
        </div>
    );
};

// Main AdminPanel Component
const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
        { id: 'currencies', label: 'Currency Manager', icon: 'fa-coins' },
        { id: 'pending', label: 'Pending Approvals', icon: 'fa-clock' },
        { id: 'videos', label: 'Video Manager', icon: 'fa-video' },
        { id: 'users', label: 'User Management', icon: 'fa-users' },
        { id: 'profile', label: 'My Profile', icon: 'fa-user-circle' },  // Add Profile menu item
        { id: 'reports', label: 'Rate History', icon: 'fa-chart-line' },
        { id: 'settings', label: 'Settings', icon: 'fa-cog' }
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return <DashboardStats />;
            case 'currencies':
                return <CurrencyManager />;
            case 'pending':
                return <PendingApprovals />;
            case 'videos':
                return <VideoManager />;
            case 'users':
                return <UserManagement />;
            case 'profile':
                return <ProfileManager />;  // Add Profile case
            case 'reports':
                return <RateHistory />;
            case 'settings':
                return <Settings />;
            default:
                return <DashboardStats />;
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="admin-panel-advanced">
            {/* Top Navigation Bar - Blue Brand */}
            <div className="admin-top-bar">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
                <div className="admin-logo">
                    <i className="fas fa-landmark"></i>
                    <div className="logo-text">
                        <span>DASHEN BANK</span>
                        <small>Exchange Rate Management System</small>
                    </div>
                </div>
                <div className="top-nav">
                    <div className="date-time">
                        <i className="far fa-calendar-alt"></i>
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="notifications">
                        <i className="fas fa-bell"></i>
                        <span className="badge">0</span>
                    </div>
                    <div className="user-menu">
                        <div className="user-avatar">
                            <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.username || 'Admin'}</span>
                            <span className="user-role">{user?.role || 'Super Administrator'}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar & Main Content */}
            <div className="admin-layout">
                {/* Sidebar - Blue Theme */}
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <i className="fas fa-chart-line"></i>
                        <span>Exchange Manager</span>
                    </div>
                    <nav className="sidebar-nav">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <i className={`fas ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="sidebar-footer">
                        <div className="system-status">
                            <i className="fas fa-circle"></i>
                            <span>System Online</span>
                        </div>
                        <div className="version">
                            <i className="fas fa-code-branch"></i>
                            v2.0.0
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <div className="page-header">
                        <h1>
                            <i className={`fas ${menuItems.find(m => m.id === activeTab)?.icon || 'fa-dashboard'}`}></i>
                            {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                        </h1>
                        <div className="breadcrumb">
                            <span>Home</span>
                            <i className="fas fa-chevron-right"></i>
                            <span>{menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}</span>
                        </div>
                    </div>
                    <div className="page-content">
                        {renderContent()}
                    </div>

                    {/* Footer */}
                    <footer className="admin-footer">
                        <div className="footer-content">
                            <div className="footer-copyright">
                                <i className="fas fa-copyright"></i>
                                <span>{currentYear} - {currentYear} Dashen Bank SC | All Rights Reserved</span>
                            </div>
                            <div className="footer-developer-wrapper">
                                <div className="footer-developer">
                                    <i className="fas fa-code"></i>
                                    <span>Developed by : Seid Mohammed</span>
                                </div>
                                <div className="developer-photo-tooltip">
                                    <img 
                                        src="/developer.jpg" 
                                        alt="Seid Mohammed - Developer"
                                        className="developer-photo"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/250x150/003366/white?text=SM";
                                        }}
                                    />
                                    <div className="tooltip-info">
                                        <h4>Seid Mohammed</h4>
                                        <p>Senior Software Engineer</p>
                                        <div className="developer-bio">
                                            Passionate developer creating innovative business solutions for Dashen Bank
                                        </div>
                                        <div className="social-links">
                                            <a href="#" target="_blank" rel="noopener noreferrer" title="GitHub">
                                                <i className="fab fa-github"></i>
                                            </a>
                                            <a href="#" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                                <i className="fab fa-linkedin"></i>
                                            </a>
                                            <a href="#" target="_blank" rel="noopener noreferrer" title="Twitter">
                                                <i className="fab fa-twitter"></i>
                                            </a>
                                            <a href="mailto:seid@dashenbank.com" title="Email">
                                                <i className="fas fa-envelope"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;