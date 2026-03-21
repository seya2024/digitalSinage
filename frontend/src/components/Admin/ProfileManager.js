import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import './ProfileManager.css';

const ProfileManager = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        role: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editMode, setEditMode] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        if (user) {
            setProfile({
                username: user.username || '',
                email: user.email || '',
                role: user.role || ''
            });
        }
    }, [user]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleProfileUpdate = async () => {
        if (!profile.username || !profile.email) {
            showMessage('error', 'Username and email are required');
            return;
        }

        setLoading(true);
        try {
            const response = await userService.update(user.id, {
                username: profile.username,
                email: profile.email,
                role: profile.role,
                is_active: 1
            });
            
            if (response.success) {
                showMessage('success', 'Profile updated successfully');
                setEditMode(false);
                // Update local user data
                const updatedUser = { ...user, username: profile.username, email: profile.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                showMessage('error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
            showMessage('error', 'Please fill all password fields');
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 6) {
            showMessage('error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await userService.changePassword(user.id, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            
            if (response.success) {
                showMessage('success', 'Password changed successfully');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                setShowPasswordForm(false);
            } else {
                showMessage('error', response.message || 'Failed to change password');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'super_admin':
                return 'role-badge super-admin';
            case 'admin':
                return 'role-badge admin';
            default:
                return 'role-badge user';
        }
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'super_admin':
                return 'fa-crown';
            case 'admin':
                return 'fa-user-shield';
            default:
                return 'fa-user';
        }
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'super_admin':
                return 'Super Administrator';
            case 'admin':
                return 'Administrator';
            default:
                return 'User';
        }
    };

    return (
        <div className="profile-manager">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-header-left">
                    <h2>
                        <i className="fas fa-user-circle"></i>
                        My Profile
                    </h2>
                    <p className="header-description">Manage your account settings and preferences</p>
                </div>
                {!editMode && !showPasswordForm && (
                    <div className="profile-actions">
                        <button onClick={() => setEditMode(true)} className="btn-edit-profile">
                            <i className="fas fa-edit"></i>
                            Edit Profile
                        </button>
                        <button onClick={() => setShowPasswordForm(true)} className="btn-change-password">
                            <i className="fas fa-key"></i>
                            Change Password
                        </button>
                    </div>
                )}
            </div>

            {/* Message */}
            {message.text && (
                <div className={`alert-message ${message.type}`}>
                    <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    <span>{message.text}</span>
                    <button className="alert-close" onClick={() => setMessage({ type: '', text: '' })}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        <i className={`fas ${getRoleIcon(profile.role)}`}></i>
                    </div>
                    <div className="avatar-info">
                        <h3>{profile.username || user?.username}</h3>
                        <span className={getRoleBadgeClass(profile.role)}>
                            <i className={`fas ${getRoleIcon(profile.role)}`}></i>
                            {getRoleLabel(profile.role)}
                        </span>
                    </div>
                </div>

                {/* Edit Profile Form */}
                {editMode && (
                    <div className="profile-form-section">
                        <h3>
                            <i className="fas fa-user-edit"></i>
                            Edit Profile Information
                        </h3>
                        <div className="profile-form">
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-user"></i>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={profile.username}
                                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-envelope"></i>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-user-tag"></i>
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={getRoleLabel(profile.role)}
                                    disabled
                                    className="readonly-field"
                                />
                                <small className="field-hint">Role cannot be changed</small>
                            </div>
                            <div className="form-actions">
                                <button onClick={handleProfileUpdate} className="btn-save" disabled={loading}>
                                    <i className="fas fa-save"></i>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={() => setEditMode(false)} className="btn-cancel">
                                    <i className="fas fa-times"></i>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password Form */}
                {showPasswordForm && (
                    <div className="password-form-section">
                        <h3>
                            <i className="fas fa-key"></i>
                            Change Password
                        </h3>
                        <div className="password-form">
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-lock"></i>
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-key"></i>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-check-circle"></i>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="password-requirements">
                                <small>Password must be at least 6 characters long</small>
                            </div>
                            <div className="form-actions">
                                <button onClick={handlePasswordChange} className="btn-save" disabled={loading}>
                                    <i className="fas fa-save"></i>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button onClick={() => setShowPasswordForm(false)} className="btn-cancel">
                                    <i className="fas fa-times"></i>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Information Display */}
                {!editMode && !showPasswordForm && (
                    <div className="profile-info-section">
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-user"></i>
                                    Username
                                </div>
                                <div className="info-value">{profile.username || user?.username}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-envelope"></i>
                                    Email Address
                                </div>
                                <div className="info-value">{profile.email || user?.email}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-user-tag"></i>
                                    Role
                                </div>
                                <div className="info-value">
                                    <span className={getRoleBadgeClass(profile.role)}>
                                        <i className={`fas ${getRoleIcon(profile.role)}`}></i>
                                        {getRoleLabel(profile.role)}
                                    </span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-calendar-alt"></i>
                                    Member Since
                                </div>
                                <div className="info-value">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-clock"></i>
                                    Last Login
                                </div>
                                <div className="info-value">
                                    {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-shield-alt"></i>
                                    Account Status
                                </div>
                                <div className="info-value">
                                    <span className="status-badge active">
                                        <i className="fas fa-check-circle"></i>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Security Tips */}
            <div className="security-tips">
                <h3>
                    <i className="fas fa-shield-alt"></i>
                    Security Tips
                </h3>
                <div className="tips-list">
                    <div className="tip-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Use a strong password with at least 6 characters</span>
                    </div>
                    <div className="tip-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Never share your password with anyone</span>
                    </div>
                    <div className="tip-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Change your password regularly</span>
                    </div>
                    <div className="tip-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Enable two-factor authentication for extra security</span>
                    </div>
                    <div className="tip-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Always log out when using public computers</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;