const Currency = require('../models/Currency');
const PendingChange = require('../models/PendingChange');

const getCurrencies = async (req, res) => {
    try {
        const currencies = await Currency.getAll(true);
        res.json({ success: true, data: currencies });
    } catch (error) {
        console.error('Get currencies error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getCurrency = async (req, res) => {
    try {
        const currency = await Currency.getById(req.params.id);
        if (!currency) {
            return res.status(404).json({ success: false, message: 'Currency not found' });
        }
        
        const history = await Currency.getRateHistory(req.params.id, 30);
        
        res.json({ 
            success: true, 
            data: { ...currency, history } 
        });
    } catch (error) {
        console.error('Get currency error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const requestAddCurrency = async (req, res) => {
    try {
        const { name, code, symbol, icon, sell_rate, buy_rate } = req.body;
        
        const changeId = await PendingChange.create({
            currency_name: name,
            currency_code: code.toUpperCase(),
            currency_symbol: symbol,
            currency_icon: icon || 'fa-money-bill-wave',
            sell_rate: sell_rate,
            buy_rate: buy_rate,
            effective_date: new Date(),
            change_type: 'add_currency'
        }, req.user.id);
        
        res.json({
            success: true,
            message: 'Currency addition request submitted for approval',
            data: { requestId: changeId }
        });
    } catch (error) {
        console.error('Request add currency error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const requestUpdateRate = async (req, res) => {
    try {
        const { currency_id, sell_rate, buy_rate } = req.body;
        
        const currency = await Currency.getById(currency_id);
        if (!currency) {
            return res.status(404).json({ success: false, message: 'Currency not found' });
        }
        
        const changeId = await PendingChange.create({
            currency_id: currency_id,
            currency_name: currency.name,
            currency_code: currency.code,
            currency_symbol: currency.symbol,
            currency_icon: currency.icon,
            sell_rate: sell_rate,
            buy_rate: buy_rate,
            effective_date: new Date(),
            change_type: 'update_rate'
        }, req.user.id);
        
        res.json({
            success: true,
            message: 'Rate update request submitted for approval',
            data: { requestId: changeId }
        });
    } catch (error) {
        console.error('Request update rate error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const requestDeleteCurrency = async (req, res) => {
    try {
        const { currency_id } = req.body;
        
        const currency = await Currency.getById(currency_id);
        if (!currency) {
            return res.status(404).json({ success: false, message: 'Currency not found' });
        }
        
        const changeId = await PendingChange.create({
            currency_id: currency_id,
            currency_name: currency.name,
            currency_code: currency.code,
            change_type: 'delete_currency'
        }, req.user.id);
        
        res.json({
            success: true,
            message: 'Currency deletion request submitted for approval',
            data: { requestId: changeId }
        });
    } catch (error) {
        console.error('Request delete currency error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getPendingChanges = async (req, res) => {
    try {
        const pending = await PendingChange.getAllPending();
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('Get pending changes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const approveChange = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PendingChange.approve(id, req.user.id);
        
        if (result) {
            res.json({ success: true, message: 'Change approved successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Change not found' });
        }
    } catch (error) {
        console.error('Approve change error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const rejectChange = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const result = await PendingChange.reject(id, req.user.id, reason);
        
        if (result) {
            res.json({ success: true, message: 'Change rejected' });
        } else {
            res.status(404).json({ success: false, message: 'Change not found' });
        }
    } catch (error) {
        console.error('Reject change error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getRateHistory = async (req, res) => {
    try {
        const currencyId = req.params.currencyId;
        const history = await Currency.getRateHistory(currencyId, 100);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Get rate history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getCurrencies,
    getCurrency,
    requestAddCurrency,
    requestUpdateRate,
    requestDeleteCurrency,
    getPendingChanges,
    approveChange,
    rejectChange,
    getRateHistory
};