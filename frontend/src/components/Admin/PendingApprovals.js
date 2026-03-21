import React, { useState, useEffect } from 'react';
import { currencyService } from '../../services/currencyService';
import './PendingApprovals.css';

const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '0.0000';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(number) ? '0.0000' : number.toFixed(4);
};

const PendingApprovals = () => {
    const [pendingChanges, setPendingChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        loadPendingChanges();
    }, []);

    const loadPendingChanges = async () => {
        try {
            setLoading(true);
            const response = await currencyService.getPendingChanges();
            if (response.success) {
                setPendingChanges(response.data || []);
            } else {
                showMessage('error', response.message || 'Failed to load pending changes');
            }
        } catch (error) {
            console.error('Error loading pending changes:', error);
            showMessage('error', error.response?.data?.message || 'Failed to load pending changes');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleApprove = async (changeId) => {
        try {
            const response = await currencyService.approveChange(changeId);
            if (response.success) {
                showMessage('success', 'Change approved successfully');
                loadPendingChanges();
            } else {
                showMessage('error', response.message || 'Failed to approve change');
            }
        } catch (error) {
            console.error('Error approving change:', error);
            showMessage('error', error.response?.data?.message || 'Failed to approve change');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            showMessage('error', 'Please provide a rejection reason');
            return;
        }
        
        try {
            const response = await currencyService.rejectChange(selectedRequest.id, rejectReason);
            if (response.success) {
                showMessage('success', 'Change rejected successfully');
                setShowRejectModal(false);
                setSelectedRequest(null);
                setRejectReason('');
                loadPendingChanges();
            } else {
                showMessage('error', response.message || 'Failed to reject change');
            }
        } catch (error) {
            console.error('Error rejecting change:', error);
            showMessage('error', error.response?.data?.message || 'Failed to reject change');
        }
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setShowRejectModal(true);
    };

    const getChangeTypeIcon = (type) => {
        switch(type) {
            case 'add_currency': return 'fa-plus-circle';
            case 'update_rate': return 'fa-edit';
            case 'delete_currency': return 'fa-trash-alt';
            default: return 'fa-clock';
        }
    };

    const getChangeTypeColor = (type) => {
        switch(type) {
            case 'add_currency': return '#10b981';
            case 'update_rate': return '#f59e0b';
            case 'delete_currency': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getChangeTypeBgColor = (type) => {
        switch(type) {
            case 'add_currency': return '#d1fae5';
            case 'update_rate': return '#fef3c7';
            case 'delete_currency': return '#fee2e2';
            default: return '#f3f4f6';
        }
    };

    const getChangeTypeText = (type) => {
        switch(type) {
            case 'add_currency': return 'New Currency Request';
            case 'update_rate': return 'Rate Update Request';
            case 'delete_currency': return 'Deletion Request';
            default: return 'Pending Request';
        }
    };

    if (loading) {
        return (
            <div className="pending-loading">
                <div className="spinner"></div>
                <p>Loading pending approvals...</p>
            </div>
        );
    }

    return (
        <div className="pending-approvals">
            {/* Header */}
            <div className="pending-header-section">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-clock"></i>
                        Pending Approvals
                    </h2>
                    <p className="header-description">Review and manage pending currency change requests</p>
                </div>
                <div className="header-right">
                    <div className="pending-count">
                        <i className="fas fa-bell"></i>
                        <span>{pendingChanges.length} Pending Request{pendingChanges.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button onClick={loadPendingChanges} className="refresh-btn">
                        <i className="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                </div>
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

            {/* Empty State */}
            {pendingChanges.length === 0 && (
                <div className="empty-state">
                    <i className="fas fa-check-circle"></i>
                    <h3>No Pending Approvals</h3>
                    <p>All currency change requests have been processed.</p>
                </div>
            )}

            {/* Pending Requests Table */}
            {pendingChanges.length > 0 && (
                <div className="pending-table-container">
                    <table className="pending-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Type</th>
                                <th>Currency</th>
                                <th>Details</th>
                                <th>Requested By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingChanges.map(change => (
                                <tr key={change.id}>
                                    <td className="id-cell">#{change.id}</td>
                                    <td>
                                        <span 
                                            className="request-type-badge"
                                            style={{
                                                background: getChangeTypeBgColor(change.change_type),
                                                color: getChangeTypeColor(change.change_type)
                                            }}
                                        >
                                            <i className={`fas ${getChangeTypeIcon(change.change_type)}`}></i>
                                            {getChangeTypeText(change.change_type)}
                                        </span>
                                    </td>
                                    <td className="currency-cell">
                                        <div className="currency-info">
                                            <i className={`fas ${change.currency_icon || 'fa-money-bill-wave'}`}></i>
                                            <div>
                                                <div className="currency-name">{change.currency_name}</div>
                                                <div className="currency-code">{change.currency_code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="details-cell">
                                        {change.sell_rate && change.buy_rate ? (
                                            <div className="rate-details">
                                                <div className="rate-item sell">
                                                    <span>Sell:</span>
                                                    <strong>{formatNumber(change.sell_rate)}</strong>
                                                </div>
                                                <div className="rate-item buy">
                                                    <span>Buy:</span>
                                                    <strong>{formatNumber(change.buy_rate)}</strong>
                                                </div>
                                                <div className="rate-item spread">
                                                    <span>Spread:</span>
                                                    <strong>{formatNumber(change.buy_rate - change.sell_rate)}</strong>
                                                </div>
                                            </div>
                                        ) : change.change_type === 'delete_currency' ? (
                                            <span className="delete-warning">
                                                <i className="fas fa-exclamation-triangle"></i>
                                                Permanently delete this currency
                                            </span>
                                        ) : (
                                            <span className="no-rate">No rate changes</span>
                                        )}
                                    </td>
                                    <td className="requester-cell">
                                        <div className="requester-info">
                                            <i className="fas fa-user-circle"></i>
                                            <span>{change.requested_by_name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="date-cell">
                                        <div className="date-info">
                                            <i className="fas fa-calendar-alt"></i>
                                            <span>{new Date(change.created_at).toLocaleDateString()}</span>
                                            <small>{new Date(change.created_at).toLocaleTimeString()}</small>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleApprove(change.id)} 
                                                className="action-btn approve-btn"
                                                title="Approve this request"
                                            >
                                                <i className="fas fa-check-circle"></i>
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => openRejectModal(change)} 
                                                className="action-btn reject-btn"
                                                title="Reject this request"
                                            >
                                                <i className="fas fa-times-circle"></i>
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="reject-modal-overlay">
                    <div className="reject-modal">
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-times-circle"></i>
                                Reject Request
                            </h3>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="request-summary">
                                <h4>Request Summary</h4>
                                <div className="summary-details">
                                    <div className="summary-item">
                                        <span>Request Type:</span>
                                        <strong>{getChangeTypeText(selectedRequest.change_type)}</strong>
                                    </div>
                                    <div className="summary-item">
                                        <span>Currency:</span>
                                        <strong>{selectedRequest.currency_name} ({selectedRequest.currency_code})</strong>
                                    </div>
                                    {selectedRequest.sell_rate && selectedRequest.buy_rate && (
                                        <div className="summary-item">
                                            <span>Proposed Rates:</span>
                                            <strong>
                                                Sell: {formatNumber(selectedRequest.sell_rate)} | 
                                                Buy: {formatNumber(selectedRequest.buy_rate)}
                                            </strong>
                                        </div>
                                    )}
                                    <div className="summary-item">
                                        <span>Requested By:</span>
                                        <strong>{selectedRequest.requested_by_name}</strong>
                                    </div>
                                    <div className="summary-item">
                                        <span>Date:</span>
                                        <strong>{new Date(selectedRequest.created_at).toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="reject-reason-section">
                                <label>
                                    <i className="fas fa-comment"></i>
                                    Rejection Reason <span className="required">*</span>
                                </label>
                                <textarea
                                    placeholder="Please provide a reason for rejecting this request..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows="4"
                                ></textarea>
                                <small>This reason will be visible to the requester.</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleReject} className="btn-reject-confirm">
                                <i className="fas fa-times-circle"></i>
                                Confirm Rejection
                            </button>
                            <button onClick={() => setShowRejectModal(false)} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;