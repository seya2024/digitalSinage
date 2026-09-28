const District = require('../models/District');

const getAllDistricts = async (req, res) => {
    try {
        const districts = await District.getAll();       // ⭐ Must match the model
        res.json({ success: true, data: districts });
    } catch (error) {
        console.error('Get districts error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDistrict = async (req, res) => {
    try {
        const district = await District.getById(req.params.id);
        if (!district) return res.status(404).json({ success: false, message: 'District not found' });
        res.json({ success: true, data: district });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDistrictBranches = async (req, res) => {
    try {
        const branches = await District.getBranches(req.params.id);
        res.json({ success: true, data: branches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createDistrict = async (req, res) => {
    try {
        const id = await District.create(req.body);
        res.json({ success: true, data: { id }, message: 'District created' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateDistrict = async (req, res) => {
    try {
        const result = await District.update(req.params.id, req.body);
        res.json({ success: result > 0, message: result > 0 ? 'Updated' : 'Not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDistrict = async (req, res) => {
    try {
        const result = await District.delete(req.params.id);
        res.json({ success: result > 0, message: result > 0 ? 'Deleted' : 'Not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllDistricts,
    getDistrict,
    getDistrictBranches,
    createDistrict,
    updateDistrict,
    deleteDistrict
};