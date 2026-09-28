const Branch = require('../models/Branch');

const getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.getAll({
            district_id: req.query.district_id,
            grade: req.query.grade,
            search: req.query.search
        });
        res.json({ success: true, data: branches });
    } catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBranchByCode = async (req, res) => {
    try {
        const branch = await Branch.getByCode(req.params.code);
        if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
        res.json({ success: true, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createBranch = async (req, res) => {
    try {
        const id = await Branch.create(req.body);
        res.json({ success: true, data: { id }, message: 'Branch created' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBranch = async (req, res) => {
    try {
        const result = await Branch.update(req.params.id, req.body);
        res.json({ success: result > 0, message: result > 0 ? 'Updated' : 'Not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBranchMessage = async (req, res) => {
    try {
        const result = await Branch.updateMessage(req.params.id, req.body.message);
        res.json({ success: result > 0, message: result > 0 ? 'Message updated' : 'Not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const result = await Branch.delete(req.params.id);
        res.json({ success: result > 0, message: result > 0 ? 'Deleted' : 'Not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllBranches,
    getBranchByCode,
    createBranch,
    updateBranch,
    updateBranchMessage,
    deleteBranch
};