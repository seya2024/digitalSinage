import React, { useState, useEffect } from 'react';
import { currencyService } from '../../services/currencyService';
import { MESSAGES, CHANGE_TYPES, CHANGE_TYPE_LABELS } from '../../utils/constants';
import { formatNumber, formatDate, getRelativeTime } from '../../utils/formatters';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import './PendingApprovals.css';

const PendingApprovals = () => {
    const [pendingChanges, setPendingChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [approveRequestId, setApproveRequestId] = useState(null);
    const [approveRequestName, setApproveRequestName] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleApproveClick = (changeId, currencyName) => {
        setApproveRequestId(changeId);
        setApproveRequestName(currencyName);
        setShowConfirmModal(true);
    };

    const handleApprove = async () => {
        try {
            const response = await currencyService.approveChange(approveRequestId);
            if (response.success) {
                showMessage('success', 'Change approved successfully');
                loadPendingChanges();
            } else {
                showMessage('error', response.message || 'Failed to approve change');
            }
        } catch (error) {
            console.error('Error approving change:', error);
            showMessage('error', error.response?.data?.message || 'Failed to approve change');
        } finally {
            setShowConfirmModal(false);
            setApproveRequestId(null);
            setApproveRequestName('');
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
            case CHANGE_TYPES.ADD_CURRENCY: return 'fa-plus-circle';
            case CHANGE_TYPES.UPDATE_RATE: return 'fa-edit';
            case CHANGE_TYPES.DELETE_CURRENCY: return 'fa-trash-alt';
            default: return 'fa-clock';
        }
    };

    const getChangeTypeClass = (type) => {
        switch(type) {
            case CHANGE_TYPES.ADD_CURRENCY: return 'badge-add';
            case CHANGE_TYPES.UPDATE_RATE: return 'badge-update';
            case CHANGE_TYPES.DELETE_CURRENCY: return 'badge-delete';
            default: return 'badge-pending';
        }
    };

    const getChangeTypeText = (type) => {
        return CHANGE_TYPE_LABELS[type] || 'Pending Request';
    };

    // Filter requests
    const filteredRequests = pendingChanges.filter(request => {
        if (filterType !== 'all' && request.change_type !== filterType) return false;
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return request.currency_name?.toLowerCase().includes(searchLower) ||
                   request.currency_code?.toLowerCase().includes(searchLower) ||
                   request.requested_by_name?.toLowerCase().includes(searchLower);
        }
        return true;
    });

    const getStatusCount = (type) => {
        if (type === 'all') return pendingChanges.length;
        return pendingChanges.filter(r => r.change_type === type).length;
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
        <div className="pending-approvals-table">
            {/* Header */}
            <div className="pending-header-table">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-clock"></i>
                        Pending Approvals
                    </h2>
                    <p className="header-description">Review and manage pending currency change requests</p>
                </div>
                <div className="header-right">
                    <button onClick={loadPendingChanges} className="refresh-btn" title="Refresh">
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <Alert
                    type={message.type}
                    message={message.text}
                    dismissible
                    onClose={() => setMessage({ type: '', text: '' })}
                />
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs-table">
                <button 
                    className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    <i className="fas fa-list"></i>
                    All ({getStatusCount('all')})
                </button>
                <button 
                    className={`filter-tab ${filterType === CHANGE_TYPES.ADD_CURRENCY ? 'active' : ''}`}
                    onClick={() => setFilterType(CHANGE_TYPES.ADD_CURRENCY)}
                >
                    <i className="fas fa-plus-circle"></i>
                    Add ({getStatusCount(CHANGE_TYPES.ADD_CURRENCY)})
                </button>
                <button 
                    className={`filter-tab ${filterType === CHANGE_TYPES.UPDATE_RATE ? 'active' : ''}`}
                    onClick={() => setFilterType(CHANGE_TYPES.UPDATE_RATE)}
                >
                    <i className="fas fa-edit"></i>
                    Update ({getStatusCount(CHANGE_TYPES.UPDATE_RATE)})
                </button>
                <button 
                    className={`filter-tab ${filterType === CHANGE_TYPES.DELETE_CURRENCY ? 'active' : ''}`}
                    onClick={() => setFilterType(CHANGE_TYPES.DELETE_CURRENCY)}
                >
                    <i className="fas fa-trash-alt"></i>
                    Delete ({getStatusCount(CHANGE_TYPES.DELETE_CURRENCY)})
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar-table">
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by currency name, code, or requester..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="clear-search">
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {filteredRequests.length === 0 && (
                <div className="empty-state-table">
                    <i className="fas fa-check-circle"></i>
                    <h3>No Pending Approvals</h3>
                    <p>All currency change requests have been processed.</p>
                    {filterType !== 'all' && (
                        <button onClick={() => setFilterType('all')} className="clear-filter-btn">
                            <i className="fas fa-arrow-left"></i> Show all requests
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            {filteredRequests.length > 0 && (
                <div className="table-container">
                    <table className="pending-approval-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Currency</th>
                                <th>Proposed Rates</th>
                                <th>Requested By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(change => (
                                <tr key={change.id}>
                                    <td className="id-cell">#{change.id}</td>
                                    <td>
                                        <span className={`request-badge ${getChangeTypeClass(change.change_type)}`}>
                                            <i className={`fas ${getChangeTypeIcon(change.change_type)}`}></i>
                                            {getChangeTypeText(change.change_type)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="currency-cell">
                                            <div className="currency-icon">
                                                <i className={`fas ${change.currency_icon || 'fa-money-bill-wave'}`}></i>
                                            </div>
                                            <div>
                                                <div className="currency-name">{change.currency_name}</div>
                                                <div className="currency-code">{change.currency_code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {change.sell_rate && change.buy_rate ? (
                                            <div className="rates-cell">
                                                <div className="sell-rate-row">
                                                    <i className="fas fa-arrow-up sell-icon"></i>
                                                    <span className="sell-value">{formatNumber(change.sell_rate)}</span>
                                                </div>
                                                <div className="buy-rate-row">
                                                    <i className="fas fa-arrow-down buy-icon"></i>
                                                    <span className="buy-value">{formatNumber(change.buy_rate)}</span>
                                                </div>
                                                <div className="spread-row">
                                                    <span>Spread: {formatNumber(change.buy_rate - change.sell_rate)}</span>
                                                </div>
                                            </div>
                                        ) : change.change_type === CHANGE_TYPES.DELETE_CURRENCY ? (
                                            <span className="delete-warning">
                                                <i className="fas fa-exclamation-triangle"></i> Permanent Deletion
                                            </span>
                                        ) : (
                                            <span className="no-rate">No rate changes</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="requester-cell">
                                            <i className="fas fa-user-circle"></i>
                                            <span>{change.requested_by_name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <i className="fas fa-calendar-alt"></i>
                                            <span>{formatDate(change.created_at, 'date')}</span>
                                            <small>{formatDate(change.created_at, 'time')}</small>
                                            <div className="relative-time">{getRelativeTime(change.created_at)}</div>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleApproveClick(change.id, change.currency_name)} 
                                                className="btn-approve"
                                                title="Approve this request"
                                            >
                                                <i className="fas fa-check-circle"></i>
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => openRejectModal(change)} 
                                                className="btn-reject"
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

            {/* Confirm Approve Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setApproveRequestId(null);
                    setApproveRequestName('');
                }}
                onConfirm={handleApprove}
                title="Approve Request"
                message={`Are you sure you want to approve this request for "${approveRequestName}"? This action cannot be undone.`}
                confirmText="Yes, Approve"
                cancelText="Cancel"
                confirmVariant="success"
                icon="check-circle"
            />

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title={{ text: 'Reject Request', icon: 'times-circle' }}
                size="md"
                footer={
                    <>
                        <button onClick={handleReject} className="btn-reject-confirm">
                            <i className="fas fa-times-circle"></i>
                            Confirm Rejection
                        </button>
                        <button onClick={() => setShowRejectModal(false)} className="btn-cancel">
                            Cancel
                        </button>
                    </>
                }
            >
                {selectedRequest && (
                    <div className="reject-modal-content">
                        <div className="request-summary">
                            <div className="summary-row">
                                <span className="summary-label">Request Type:</span>
                                <span className={`request-badge ${getChangeTypeClass(selectedRequest.change_type)}`}>
                                    {getChangeTypeText(selectedRequest.change_type)}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Currency:</span>
                                <span className="summary-value">
                                    {selectedRequest.currency_name} ({selectedRequest.currency_code})
                                </span>
                            </div>
                            {selectedRequest.sell_rate && selectedRequest.buy_rate && (
                                <div className="summary-row">
                                    <span className="summary-label">Proposed Rates:</span>
                                    <span className="summary-value">
                                        <span className="sell-rate-mini">Sell: {formatNumber(selectedRequest.sell_rate)}</span>
                                        <span className="buy-rate-mini">Buy: {formatNumber(selectedRequest.buy_rate)}</span>
                                    </span>
                                </div>
                            )}
                            <div className="summary-row">
                                <span className="summary-label">Requested By:</span>
                                <span className="summary-value">{selectedRequest.requested_by_name}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Date:</span>
                                <span className="summary-value">{formatDate(selectedRequest.created_at, 'datetime')}</span>
                            </div>
                        </div>
                        <div className="reject-reason">
                            <label>Rejection Reason <span className="required">*</span></label>
                            <textarea
                                placeholder="Please provide a reason for rejecting this request..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows="4"
                            ></textarea>
                            <small>This reason will be visible to the requester.</small>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PendingApprovals;