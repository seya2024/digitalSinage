import React, { useState, useEffect } from 'react';
import { districtService } from '../../services/districtService';
import { branchService } from '../../services/branchService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import './DistrictManager.css';

const DistrictManager = () => {
    const [districts, setDistricts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [branches, setBranches] = useState([]);
    const [newDistrict, setNewDistrict] = useState({
        name: '',
        location_type: 'upcountry',
        contact: ''
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, type: '', id: null, name: '', title: '', message: '',
        confirmText: '', confirmVariant: '', icon: ''
    });

    useEffect(() => { loadDistricts(); }, [filter]);

    const loadDistricts = async () => {
        try {
            const res = await districtService.getAll();
            if (res.success) setDistricts(res.data);
        } catch (err) {
            showMessage('error', 'Failed to load districts');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleSave = async () => {
        if (!newDistrict.name.trim()) {
            showMessage('error', 'District name is required');
            return;
        }
        try {
            let res;
            if (editing) {
                res = await districtService.update(editing.id, newDistrict);
            } else {
                res = await districtService.create(newDistrict);
            }
            if (res.success) {
                showMessage('success', editing ? 'District updated' : 'District created');
                setShowForm(false);
                setEditing(null);
                setNewDistrict({ name: '', location_type: 'upcountry', contact: '' });
                loadDistricts();
            } else {
                showMessage('error', res.message || 'Failed');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Failed');
        }
    };

    const handleEdit = (district) => {
        setEditing(district);
        setNewDistrict({
            name: district.name,
            location_type: district.location_type,
            contact: district.contact || ''
        });
        setShowForm(true);
    };

    const handleDeleteClick = (district) => {
        setConfirmModal({
            isOpen: true, type: 'delete', id: district.id, name: district.name,
            title: 'Delete District',
            message: `Delete "${district.name}"? Branches will be unlinked.`,
            confirmText: 'Yes, Delete',
            confirmVariant: 'danger',
            icon: 'trash-alt'
        });
    };

    const handleConfirm = async () => {
        try {
            const res = await districtService.delete(confirmModal.id);
            if (res.success) {
                showMessage('success', 'District deleted');
                loadDistricts();
            } else {
                showMessage('error', res.message || 'Failed');
            }
        } catch (err) {
            showMessage('error', 'Failed to delete');
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const viewBranches = async (district) => {
        try {
            const res = await branchService.getAll({ district_id: district.id });
            if (res.success) {
                setBranches(res.data);
                setSelectedDistrict(district);
            }
        } catch (err) {
            showMessage('error', 'Failed to load branches');
        }
    };

    const filtered = districts.filter(d => {
        if (filter !== 'all' && d.location_type !== filter) return false;
        const term = searchTerm.toLowerCase();
        return d.name.toLowerCase().includes(term);
    });

    return (
        <div className="district-manager">
            <div className="section-header">
                <h2><i className="fas fa-building"></i> District Manager</h2>
                <Button
                    variant="primary"
                    icon="plus"
                    onClick={() => {
                        setEditing(null);
                        setNewDistrict({ name: '', location_type: 'upcountry', contact: '' });
                        setShowForm(true);
                    }}
                >
                    Add District
                </Button>
            </div>

            {message.text && (
                <div className={`alert-message ${message.type}`}>
                    <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    {message.text}
                </div>
            )}

            <div className="filter-tabs">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                    All ({districts.length})
                </button>
                <button className={filter === 'city' ? 'active' : ''} onClick={() => setFilter('city')}>
                    <i className="fas fa-city"></i> City
                </button>
                <button className={filter === 'upcountry' ? 'active' : ''} onClick={() => setFilter('upcountry')}>
                    <i className="fas fa-mountain"></i> Upcountry
                </button>
            </div>

            <input
                type="text"
                placeholder="Search districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            <table className="districts-table">
                <thead>
                    <tr>
                        <th>District Name</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Branches</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(d => (
                        <tr key={d.id}>
                            <td className="name-cell">{d.name}</td>
                            <td>
                                <span className={`location-badge ${d.location_type}`}>
                                    <i className={`fas fa-${d.location_type === 'city' ? 'city' : 'mountain'}`}></i>
                                    {d.location_type === 'city' ? 'City' : 'Upcountry'}
                                </span>
                            </td>
                            <td>{d.contact || '—'}</td>
                            <td className="branch-count">{d.branch_count || 0}</td>
                            <td className="actions-cell">
                                <button className="action-btn view" onClick={() => viewBranches(d)} title="View Branches">
                                    <i className="fas fa-eye"></i>
                                </button>
                                <button className="action-btn edit" onClick={() => handleEdit(d)} title="Edit">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteClick(d)} title="Delete">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add/Edit District Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={{ text: editing ? 'Edit District' : 'Add District', icon: 'building' }}
                size="md"
                footer={
                    <>
                        <Button variant="success" onClick={handleSave} icon="save">
                            {editing ? 'Save' : 'Create'}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                    </>
                }
            >
                <div className="form-group">
                    <label>District Name *</label>
                    <input
                        type="text"
                        value={newDistrict.name}
                        onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })}
                        placeholder="e.g., Jimma District"
                    />
                </div>
                <div className="form-group">
                    <label>Location Type</label>
                    <select
                        value={newDistrict.location_type}
                        onChange={(e) => setNewDistrict({ ...newDistrict, location_type: e.target.value })}
                    >
                        <option value="city">City</option>
                        <option value="upcountry">Upcountry</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Contact</label>
                    <input
                        type="text"
                        value={newDistrict.contact}
                        onChange={(e) => setNewDistrict({ ...newDistrict, contact: e.target.value })}
                        placeholder="+251911000000"
                    />
                </div>
            </Modal>

            {/* View Branches Modal */}
            <Modal
                isOpen={!!selectedDistrict}
                onClose={() => setSelectedDistrict(null)}
                title={{ text: `Branches in ${selectedDistrict?.name}`, icon: 'code-branch' }}
                size="lg"
            >
                <table className="branches-mini-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map(b => (
                            <tr key={b.id}>
                                <td>{b.code}</td>
                                <td>{b.name}</td>
                                <td><span className={`grade-badge grade-${b.grade}`}>{b.grade}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirm}
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

export default DistrictManager;