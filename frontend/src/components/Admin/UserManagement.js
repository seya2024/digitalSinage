import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        userId: null,
        userName: '',
        title: '',
        message: '',
        confirmText: '',
        confirmVariant: '',
        icon: ''
    });
    const { user: currentUser } = useAuth();
    
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        role: 'ibd'  // Default to IBD for new users
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            if (response.success) {
                setUsers(response.data);
            } else {
                showMessage('error', response.message || 'Failed to load users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showMessage('error', error.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.password) {
            showMessage('error', 'Username and password are required');
            return;
        }

        if (newUser.username.length < 3) {
            showMessage('error', 'Username must be at least 3 characters');
            return;
        }

        if (newUser.password.length < 6) {
            showMessage('error', 'Password must be at least 6 characters');
            return;
        }

        try {
            const response = await userService.register(newUser);
            if (response.success) {
                showMessage('success', `User ${newUser.username} created successfully`);
                setShowAddForm(false);
                setNewUser({ username: '', password: '', email: '', role: 'ibd' });
                loadUsers();
            } else {
                showMessage('error', response.message || 'Failed to create user');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser.username || !editingUser.email) {
            showMessage('error', 'Please fill required fields');
            return;
        }

        try {
            // Use updateRole if only role is changing
            if (editingUser.role !== undefined) {
                const response = await userService.updateRole(editingUser.id, editingUser.role);
                if (response.success) {
                    showMessage('success', 'User role updated successfully');
                    setEditingUser(null);
                    loadUsers();
                    return;
                }
            }
            
            // Full update for other fields
            const updateData = {
                username: editingUser.username,
                email: editingUser.email,
                role: editingUser.role,
                is_active: editingUser.is_active
            };
            
            const response = await userService.update(editingUser.id, updateData);
            if (response.success) {
                showMessage('success', 'User updated successfully');
                setEditingUser(null);
                loadUsers();
            } else {
                showMessage('error', response.message || 'Failed to update user');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteClick = (userId, username) => {
        if (userId === currentUser?.id) {
            showMessage('error', 'You cannot delete your own account');
            return;
        }
        
        // Prevent deleting the main admin account
        if (username === 'admin') {
            showMessage('error', 'Cannot delete the main admin account');
            return;
        }
        
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            userId: userId,
            userName: username,
            title: 'Delete User',
            message: `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
            confirmText: 'Yes, Delete',
            confirmVariant: 'danger',
            icon: 'trash-alt'
        });
    };

    const handleDeleteUser = async () => {
        const { userId, userName } = confirmModal;
        try {
            const response = await userService.delete(userId);
            if (response.success) {
                showMessage('success', `User "${userName}" deleted successfully`);
                loadUsers();
            } else {
                showMessage('error', response.message || 'Failed to delete user');
            }
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to delete user');
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const handleResetPassword = async (userId, username) => {
        if (window.confirm(`Reset password for "${username}" to default "password123"? The user will need to change it on next login.`)) {
            try {
                const response = await userService.resetPassword(userId);
                if (response.success) {
                    showMessage('success', `Password for ${username} reset to "password123"`);
                } else {
                    showMessage('error', response.message || 'Failed to reset password');
                }
            } catch (error) {
                showMessage('error', error.response?.data?.message || 'Failed to reset password');
            }
        }
    };

    const handleConfirmAction = () => {
        if (confirmModal.type === 'delete') {
            handleDeleteUser();
        }
    };

    const filteredUsers = users.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'super_admin':
                return 'role-badge super-admin';
            case 'admin':
                return 'role-badge admin';
            case 'ibd':
                return 'role-badge ibd';
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
            case 'ibd':
                return 'fa-globe';
            default:
                return 'fa-user';
        }
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'super_admin':
                return 'Super Admin';
            case 'admin':
                return 'Admin';
            case 'ibd':
                return 'IBD';
            default:
                return 'User';
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="user-management">
            {/* Header */}
            <div className="manager-header">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-users"></i>
                        User Management
                    </h2>
                    <p className="header-description">Manage system users, roles, and permissions</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)} 
                    className="btn-add-user"
                >
                    <i className="fas fa-plus"></i>
                    Add New User
                </button>
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

            {/* Search Section */}
            <div className="search-section">
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-field"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <div className="stats-badge">
                    <i className="fas fa-users"></i>
                    <span>{filteredUsers.length} of {users.length} users</span>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddForm && (
                <div className="add-user-modal">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-user-plus"></i>
                                Add New User
                            </h3>
                            <button onClick={() => setShowAddForm(false)} className="modal-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-user"></i>
                                        Username <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-lock"></i>
                                        Password <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter password (min 6 characters)"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-envelope"></i>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-user-tag"></i>
                                        Role
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    >
                                        <option value="ibd">
                                            <i className="fas fa-globe"></i> IBD (International Banking Dept)
                                        </option>
                                        <option value="admin">
                                            <i className="fas fa-user-shield"></i> Admin
                                        </option>
                                    </select>
                                    <small className="field-hint">
                                        IBD: Can add currencies and update exchange rates | Admin: IBD + Video management
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleAddUser} className="btn-submit">
                                <i className="fas fa-save"></i>
                                Create User
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="btn-cancel">
                                <i className="fas fa-times"></i>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="edit-user-modal">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-user-edit"></i>
                                Edit User: {editingUser.username}
                            </h3>
                            <button onClick={() => setEditingUser(null)} className="modal-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-user"></i>
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-envelope"></i>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-user-tag"></i>
                                        Role
                                    </label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        disabled={editingUser.id === currentUser?.id && currentUser?.role === 'super_admin'}
                                    >
                                        <option value="ibd">IBD (International Banking Dept)</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                    {editingUser.id === currentUser?.id && (
                                        <small className="field-note">You cannot change your own role</small>
                                    )}
                                    {editingUser.username === 'admin' && editingUser.role === 'super_admin' && (
                                        <small className="field-note warning">Main admin account role cannot be changed</small>
                                    )}
                                </div>
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingUser.is_active === 1}
                                            onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked ? 1 : 0})}
                                        />
                                        <span className="checkbox-text">
                                            <i className="fas fa-check-circle"></i>
                                            Active Account
                                        </span>
                                    </label>
                                    <p className="field-hint">Inactive users cannot log in to the system</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleUpdateUser} className="btn-submit">
                                <i className="fas fa-save"></i>
                                Save Changes
                            </button>
                            <button onClick={() => setEditingUser(null)} className="btn-cancel">
                                <i className="fas fa-times"></i>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="table-container">
                {filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-users"></i>
                        <h3>No Users Found</h3>
                        <p>{searchTerm ? `No results for "${searchTerm}"` : 'No users available'}</p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="btn-clear-search">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className={user.id === currentUser?.id ? 'current-user-row' : ''}>
                                    <td className="user-avatar-cell">
                                        <div className="user-avatar-wrapper">
                                            <i className={`fas ${getRoleIcon(user.role)}`}></i>
                                        </div>
                                    </td>
                                    <td className="username-cell">
                                        <div className="username-info">
                                            <span className="username-text">{user.username}</span>
                                            {user.id === currentUser?.id && (
                                                <span className="current-user-badge">
                                                    <i className="fas fa-star"></i>
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="email-cell">
                                        <a href={`mailto:${user.email}`} className="email-link">
                                            <i className="fas fa-envelope"></i>
                                            {user.email || '—'}
                                        </a>
                                    </td>
                                    <td>
                                        <span className={getRoleBadgeClass(user.role)}>
                                            <i className={`fas ${getRoleIcon(user.role)}`}></i>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            <i className={`fas fa-${user.is_active ? 'check-circle' : 'times-circle'}`}></i>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {user.last_login ? (
                                            <span title={new Date(user.last_login).toLocaleString()}>
                                                <i className="fas fa-clock"></i>
                                                {new Date(user.last_login).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="never-logged">Never</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => setEditingUser(user)} 
                                                className="action-btn edit-btn"
                                                title="Edit user"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleResetPassword(user.id, user.username)} 
                                                className="action-btn reset-btn"
                                                title="Reset password"
                                            >
                                                <i className="fas fa-key"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(user.id, user.username)} 
                                                className="action-btn delete-btn"
                                                title="Delete user"
                                                disabled={user.id === currentUser?.id || user.username === 'admin'}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Statistics Footer */}
            <div className="stats-footer">
                <div className="stat-item">
                    <i className="fas fa-users"></i>
                    <div className="stat-details">
                        <span className="stat-value">{users.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-globe"></i>
                    <div className="stat-details">
                        <span className="stat-value">{users.filter(u => u.role === 'ibd').length}</span>
                        <span className="stat-label">IBD Users</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-user-shield"></i>
                    <div className="stat-details">
                        <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>
                <div className="stat-item">
                    <i className="fas fa-crown"></i>
                    <div className="stat-details">
                        <span className="stat-value">{users.filter(u => u.role === 'super_admin').length}</span>
                        <span className="stat-label">Super Admins</span>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                cancelText="Cancel"
                confirmVariant={confirmModal.confirmVariant}
                icon={confirmModal.icon}
            />
        </div>
    );
};

export default UserManagement;