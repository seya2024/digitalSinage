import React, { useState, useEffect } from 'react';
import { currencyService } from '../../services/currencyService';
import { useAuth } from '../../context/AuthContext';
import { isValidCurrencyCode, isValidExchangeRate, isValidSpread } from '../../utils/validators';
import { MESSAGES } from '../../utils/constants';

import './CurrencyManager.css';

// Helper function to safely format numbers
const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '0.0000';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(number) ? '0.0000' : number.toFixed(4);
};

// Helper function to safely parse number from input
const parseNumber = (value) => {
    if (!value || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};

const CurrencyManager = () => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [newCurrency, setNewCurrency] = useState({
        name: '',
        code: '',
        symbol: '',
        icon: 'fa-money-bill-wave',
        sell_rate: '',
        buy_rate: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        loadCurrencies();
    }, []);

    const loadCurrencies = async () => {
        try {
            setLoading(true);
            const response = await currencyService.getAll();
            if (response.success) {
                const formattedCurrencies = (response.data || []).map(currency => ({
                    ...currency,
                    sell_rate: currency.sell_rate ? parseFloat(currency.sell_rate) : null,
                    buy_rate: currency.buy_rate ? parseFloat(currency.buy_rate) : null
                }));
                setCurrencies(formattedCurrencies);
            } else {
                showMessage('error', response.message || 'Failed to load currencies');
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
            showMessage('error', error.response?.data?.message || 'Failed to load currencies');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleAddRequest = async () => {
        if (!newCurrency.name || !newCurrency.code) {
            showMessage('error', 'Please fill currency name and code');
            return;
        }
        
        if (!newCurrency.sell_rate || !newCurrency.buy_rate) {
            showMessage('error', 'Please fill both selling and buying rates');
            return;
        }

        const sellRate = parseNumber(newCurrency.sell_rate);
        const buyRate = parseNumber(newCurrency.buy_rate);
        
        if (sellRate === null || buyRate === null) {
            showMessage('error', 'Please enter valid numeric rates');
            return;
        }

        try {
            const response = await currencyService.requestAdd({
                name: newCurrency.name.trim(),
                code: newCurrency.code.toUpperCase().trim(),
                symbol: newCurrency.symbol || '',
                icon: newCurrency.icon,
                sell_rate: sellRate,
                buy_rate: buyRate
            });
            
            if (response.success) {
                showMessage('success', 'Currency addition request submitted for approval');
                setShowAddForm(false);
                setNewCurrency({
                    name: '',
                    code: '',
                    symbol: '',
                    icon: 'fa-money-bill-wave',
                    sell_rate: '',
                    buy_rate: ''
                });
                loadCurrencies();
            } else {
                showMessage('error', response.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error adding currency:', error);
            showMessage('error', error.response?.data?.message || 'Failed to submit request');
        }
    };

    const handleUpdateRequest = async (currencyId, sellRate, buyRate) => {
        const sell = parseNumber(sellRate);
        const buy = parseNumber(buyRate);
        
        if (sell === null || buy === null) {
            showMessage('error', 'Please enter valid numeric rates');
            return;
        }

        try {
            const response = await currencyService.requestUpdate(currencyId, sell, buy, 'Rate update');
            if (response.success) {
                showMessage('success', 'Rate update request submitted for approval');
                setShowUpdateForm(null);
                loadCurrencies();
            } else {
                showMessage('error', response.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error updating rate:', error);
            showMessage('error', error.response?.data?.message || 'Failed to submit request');
        }
    };

    const handleDeleteRequest = async (currencyId, currencyName) => {
        if (window.confirm(`Are you sure you want to request deletion of "${currencyName}"? This requires approval.`)) {
            try {
                const response = await currencyService.requestDelete(currencyId, 'Delete request');
                if (response.success) {
                    showMessage('success', 'Deletion request submitted for approval');
                    loadCurrencies();
                } else {
                    showMessage('error', response.message || 'Failed to submit request');
                }
            } catch (error) {
                console.error('Error deleting currency:', error);
                showMessage('error', error.response?.data?.message || 'Failed to submit request');
            }
        }
    };

    const handleEditClick = (currency) => {
        setShowUpdateForm(currency.id);
    };

    const handleCancelEdit = () => {
        setShowUpdateForm(null);
    };

    const filteredCurrencies = currencies.filter(currency => {
        const searchLower = searchTerm.toLowerCase();
        return (currency.name?.toLowerCase().includes(searchLower) ||
                currency.code?.toLowerCase().includes(searchLower));
    });

    const iconOptions = [
        { value: 'fa-dollar-sign', label: '$ Dollar', symbol: '$' },
        { value: 'fa-euro-sign', label: '€ Euro', symbol: '€' },
        { value: 'fa-pound-sign', label: '£ Pound', symbol: '£' },
        { value: 'fa-yen-sign', label: '¥ Yen', symbol: '¥' },
        { value: 'fa-rupee-sign', label: '₹ Rupee', symbol: '₹' },
        { value: 'fa-won-sign', label: '₩ Won', symbol: '₩' },
        { value: 'fa-money-bill-wave', label: '💰 Money Bill', symbol: '💰' }
    ];

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading currencies...</p>
            </div>
        );
    }

    return (
        <div className="currency-manager">
            {/* Header */}
            <div className="manager-header">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-coins"></i>
                        Currency Management
                    </h2>
                    <p className="header-description">Manage exchange rates for all supported currencies</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)} 
                    className="btn-add-currency"
                >
                    <i className="fas fa-plus"></i>
                    Add New Currency
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

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by currency name or code..."
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
                    <i className="fas fa-chart-line"></i>
                    <span>{filteredCurrencies.length} of {currencies.length} currencies</span>
                </div>
            </div>

            {/* Add Currency Form */}
            {showAddForm && (
                <div className="add-currency-modal">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>
                                <i className="fas fa-plus-circle"></i>
                                Request New Currency
                            </h3>
                            <button onClick={() => setShowAddForm(false)} className="modal-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-tag"></i>
                                        Currency Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Japanese Yen"
                                        value={newCurrency.name}
                                        onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-code"></i>
                                        Currency Code <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., JPY"
                                        value={newCurrency.code}
                                        onChange={(e) => setNewCurrency({...newCurrency, code: e.target.value.toUpperCase()})}
                                        maxLength="3"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-dollar-sign"></i>
                                        Symbol
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., ¥"
                                        value={newCurrency.symbol}
                                        onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-palette"></i>
                                        Icon
                                    </label>
                                    <select
                                        value={newCurrency.icon}
                                        onChange={(e) => setNewCurrency({...newCurrency, icon: e.target.value})}
                                    >
                                        {iconOptions.map(icon => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-arrow-up"></i>
                                        Selling Rate (ETB) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        placeholder="0.0000"
                                        value={newCurrency.sell_rate}
                                        onChange={(e) => setNewCurrency({...newCurrency, sell_rate: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-arrow-down"></i>
                                        Buying Rate (ETB) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        placeholder="0.0000"
                                        value={newCurrency.buy_rate}
                                        onChange={(e) => setNewCurrency({...newCurrency, buy_rate: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleAddRequest} className="btn-submit">
                                <i className="fas fa-paper-plane"></i>
                                Submit Request
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="btn-cancel">
                                <i className="fas fa-times"></i>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Currencies Table */}
            <div className="table-container">
                {filteredCurrencies.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-search"></i>
                        <h3>No Currencies Found</h3>
                        <p>{searchTerm ? `No results for "${searchTerm}"` : 'No currencies available'}</p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="btn-clear-search">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="currencies-table">
                        <thead>
                            <tr>
                                <th>Currency</th>
                                <th>Code</th>
                                <th>Selling Rate (ETB)</th>
                                <th>Buying Rate (ETB)</th>
                                <th>Spread</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCurrencies.map(currency => (
                                <tr key={currency.id}>
                                    <td className="currency-name-cell">
                                        <div className="currency-icon-wrapper">
                                            <i className={`fas ${currency.icon || 'fa-money-bill-wave'}`}></i>
                                        </div>
                                        <div className="currency-name-info">
                                            <span className="currency-fullname">{currency.name}</span>
                                            {currency.symbol && (
                                                <span className="currency-symbol">{currency.symbol}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="currency-code-cell">
                                        <span className="code-badge">{currency.code}</span>
                                    </td>
                                    <td className="rate-cell">
                                        {showUpdateForm === currency.id ? (
                                            <input
                                                type="number"
                                                step="0.0001"
                                                defaultValue={currency.sell_rate}
                                                className="edit-input-rate"
                                                id={`sell-${currency.id}`}
                                            />
                                        ) : (
                                            <span className="sell-rate-value">{formatNumber(currency.sell_rate)}</span>
                                        )}
                                    </td>
                                    <td className="rate-cell">
                                        {showUpdateForm === currency.id ? (
                                            <input
                                                type="number"
                                                step="0.0001"
                                                defaultValue={currency.buy_rate}
                                                className="edit-input-rate"
                                                id={`buy-${currency.id}`}
                                            />
                                        ) : (
                                            <span className="buy-rate-value">{formatNumber(currency.buy_rate)}</span>
                                        )}
                                    </td>
                                    <td className="spread-cell">
                                        <span className="spread-value">
                                            {currency.sell_rate && currency.buy_rate ? 
                                                formatNumber(currency.buy_rate - currency.sell_rate) : 
                                                'N/A'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {currency.updated_at ? 
                                            new Date(currency.updated_at).toLocaleString() : 
                                            'Never'}
                                    </td>
                                    <td className="actions-cell">
                                        {showUpdateForm === currency.id ? (
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => {
                                                        const sellInput = document.getElementById(`sell-${currency.id}`);
                                                        const buyInput = document.getElementById(`buy-${currency.id}`);
                                                        handleUpdateRequest(
                                                            currency.id,
                                                            sellInput.value,
                                                            buyInput.value
                                                        );
                                                    }}
                                                    className="action-btn save-btn"
                                                    title="Save changes"
                                                >
                                                    <i className="fas fa-check"></i>
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="action-btn cancel-btn"
                                                    title="Cancel editing"
                                                >
                                                    <i className="fas fa-times"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleEditClick(currency)}
                                                    className="action-btn edit-btn"
                                                    title="Edit rates"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRequest(currency.id, currency.name)}
                                                    className="action-btn delete-btn"
                                                    title="Delete currency"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Statistics Footer */}
            {currencies.length > 0 && (
                <div className="stats-footer">
                    <div className="stat-item">
                        <i className="fas fa-coins"></i>
                        <div className="stat-details">
                            <span className="stat-value">{currencies.length}</span>
                            <span className="stat-label">Total Currencies</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <i className="fas fa-chart-line"></i>
                        <div className="stat-details">
                            <span className="stat-value">{filteredCurrencies.length}</span>
                            <span className="stat-label">Showing Results</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <i className="fas fa-sync-alt"></i>
                        <div className="stat-details">
                            <span className="stat-value">{new Date().toLocaleDateString()}</span>
                            <span className="stat-label">Last Updated</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencyManager;