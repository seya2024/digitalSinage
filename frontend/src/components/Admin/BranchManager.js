import React, { useState, useEffect } from 'react';
import { branchService } from '../../services/branchService';
import { districtService } from '../../services/districtService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import './BranchManager.css';

const GRADES = ['I', 'II', 'III', 'IV', 'V'];

const BranchManager = () => {
    const [branches, setBranches] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, id: null, name: '', title: '', message: '',
        confirmText: '', confirmVariant: '', icon: ''
    });
    const [form, setForm] = useState({
        code: '', name: '', district_id: '', grade: 'V', message: ''
    });

    useEffect(() => {
        loadDistricts();
        loadBranches();
    }, [filterDistrict, filterGrade]);

    const loadDistricts = async () => {
        try {
            const res = await districtService.getAll();
            if (res.success) setDistricts(res.data);
        } catch (err) { console.error(err); }
    };

    const loadBranches = async () => {
        try {
            const filters = {};
            if (filterDistrict) filters.district_id = filterDistrict;
            if (filterGrade) filters.grade = filterGrade;
            const res = await branchService.getAll(filters);
            if (res.success) setBranches(res.data);
        } catch (err) {
            showMessage('error', 'Failed to load branches');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            showMessage('error', 'Code and Name are required');
            return;
        }
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                name: form.name.trim(),
                district_id: form.district_id ? parseInt(form.district_id) : null,
                grade: form.grade,
                message: form.message
            };
            let res;
            if (editing) {
                res = await branchService.update(editing.id, payload);
            } else {
                res = await branchService.create(payload);
            }
            if (res.success) {
                showMessage('success', editing ? 'Branch updated' : 'Branch created');
                setShowForm(false);
                setEditing(null);
                loadBranches();
            } else {
                showMessage('error', res.message || 'Failed');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Failed');
        }
    };

    const handleEdit = (branch) => {
        setEditing(branch);
        setForm({
            code: branch.code,
            name: branch.name,
            district_id: branch.district_id || '',
            grade: branch.grade || 'V',
            message: branch.message || ''
        });
        setShowForm(true);
    };

    const handleUpdateMessage = async () => {
        try {
            const res = await branchService.updateMessage(editingMessage.id, editingMessage.message);
            if (res.success) {
                showMessage('success', 'Message updated');
                setEditingMessage(null);
                loadBranches();
            }
        } catch (err) {
            showMessage('error', 'Failed to update message');
        }
    };

    const handleDeleteClick = (branch) => {
        setConfirmModal({
            isOpen: true, id: branch.id, name: branch.name,
            title: 'Delete Branch',
            message: `Delete branch "${branch.name}" (${branch.code})? This cannot be undone.`,
            confirmText: 'Yes, Delete',
            confirmVariant: 'danger',
            icon: 'trash-alt'
        });
    };

    const handleConfirm = async () => {
        try {
            const res = await branchService.delete(confirmModal.id);
            if (res.success) {
                showMessage('success', 'Branch deleted');
                loadBranches();
            }
        } catch (err) {
            showMessage('error', 'Failed to delete');
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const filtered = branches.filter(b => {
        const term = searchTerm.toLowerCase();
        return b.name.toLowerCase().includes(term) || b.code.toLowerCase().includes(term);
    });

    return (
        <div className="branch-manager">
            <div className="section-header">
                <h2><i className="fas fa-code-branch"></i> Branch Manager</h2>
                <Button
                    variant="primary"
                    icon="plus"
                    onClick={() => {
                        setEditing(null);
                        setForm({ code: '', name: '', district_id: '', grade: 'V', message: '' });
                        setShowForm(true);
                    }}
                >
                    Add Branch
                </Button>
            </div>

            {message.text && (
                <div className={`alert-message ${message.type}`}>
                    <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div className="filters-row">
                <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                    <option value="">All Districts</option>
                    {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                    <option value="">All Grades</option>
                    {GRADES.map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search by code or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Table */}
            <table className="branches-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>District</th>
                        <th>Grade</th>
                        <th>Message</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(b => (
                        <tr key={b.id}>
                            <td className="code-cell">{b.code}</td>
                            <td className="name-cell">{b.name}</td>
                            <td>{b.district_name || '—'}</td>
                            <td><span className={`grade-badge grade-${b.grade}`}>{b.grade}</span></td>
                            <td className="message-cell">
                                {b.message ? b.message.substring(0, 50) + (b.message.length > 50 ? '…' : '') : '—'}
                            </td>
                            <td className="actions-cell">
                                <button className="action-btn message" onClick={() => setEditingMessage({ ...b })} title="Edit Message">
                                    <i className="fas fa-comment"></i>
                                </button>
                                <button className="action-btn edit" onClick={() => handleEdit(b)} title="Edit">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteClick(b)} title="Delete">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add/Edit Branch */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={{ text: editing ? 'Edit Branch' : 'Add Branch', icon: 'code-branch' }}
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
                    <label>Branch Code *</label>
                    <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., JIM001"
                        maxLength="20"
                    />
                    <small>Used in TV URL: ?branch={form.code || 'CODE'}</small>
                </div>
                <div className="form-group">
                    <label>Branch Name *</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., Jimma Main Branch"
                    />
                </div>
                <div className="form-group">
                    <label>District</label>
                    <select
                        value={form.district_id}
                        onChange={(e) => setForm({ ...form, district_id: e.target.value })}
                    >
                        <option value="">— None —</option>
                        {districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Grade</label>
                    <select
                        value={form.grade}
                        onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    >
                        {GRADES.map(g => (
                            <option key={g} value={g}>Grade {g}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Message (shown on TV)</label>
                    <textarea
                        rows="3"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Daily message displayed on this branch's TV"
                    />
                </div>
            </Modal>

            {/* Quick Message Editor */}
            <Modal
                isOpen={!!editingMessage}
                onClose={() => setEditingMessage(null)}
                title={{ text: `Edit Message — ${editingMessage?.name}`, icon: 'comment' }}
                size="md"
                footer={
                    <>
                        <Button variant="success" onClick={handleUpdateMessage} icon="save">Save Message</Button>
                        <Button variant="secondary" onClick={() => setEditingMessage(null)}>Cancel</Button>
                    </>
                }
            >
                {editingMessage && (
                    <div className="form-group">
                        <label>Message displayed on TV for branch {editingMessage.code}</label>
                        <textarea
                            rows="5"
                            value={editingMessage.message || ''}
                            onChange={(e) => setEditingMessage({ ...editingMessage, message: e.target.value })}
                            placeholder="Enter the message for this branch's TV"
                        />
                    </div>
                )}
            </Modal>

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

export default BranchManager;