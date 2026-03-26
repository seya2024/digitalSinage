// backend/controllers/ibdController.js
const { pool } = require('../config/database');

/**
 * Get all currencies with IBD details
 */
const getCurrenciesForIBD = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*,
                u.username as last_updated_by_name,
                (
                    SELECT rate_value 
                    FROM rate_history 
                    WHERE currency_id = c.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) as previous_rate
            FROM currencies c
            LEFT JOIN users u ON c.last_updated_by = u.id
            WHERE c.is_active = true
            ORDER BY c.code
        `;
        
        const [rows] = await pool.execute(query);
        
        res.json({
            success: true,
            currencies: rows
        });
    } catch (error) {
        console.error('Get currencies for IBD error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch currencies'
        });
    }
};

/**
 * Update daily exchange rate
 */
const updateDailyRate = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { currencyId, rate, buyRate, sellRate, notes } = req.body;
        
        if (!currencyId) {
            return res.status(400).json({
                success: false,
                message: 'Currency ID is required'
            });
        }
        
        await connection.beginTransaction();
        
        // Get current currency data
        const [currencyRows] = await connection.execute(
            'SELECT id, code, current_rate, buy_rate, sell_rate FROM currencies WHERE id = ? AND is_active = true',
            [currencyId]
        );
        
        if (currencyRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Currency not found'
            });
        }
        
        const currency = currencyRows[0];
        const updates = [];
        const values = [];
        
        // Prepare update query based on what's provided
        if (rate !== undefined) {
            updates.push('current_rate = ?');
            values.push(rate);
        }
        
        if (buyRate !== undefined) {
            updates.push('buy_rate = ?');
            values.push(buyRate);
        }
        
        if (sellRate !== undefined) {
            updates.push('sell_rate = ?');
            values.push(sellRate);
        }
        
        if (updates.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No rate values provided'
            });
        }
        
        updates.push('last_updated_by = ?');
        updates.push('last_updated_at = NOW()');
        values.push(req.user.id);
        values.push(currencyId);
        
        // Update currency
        await connection.execute(
            `UPDATE currencies SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        // Insert rate history
        const historyQuery = `
            INSERT INTO rate_history 
            (currency_id, rate_value, buy_rate, sell_rate, old_rate, old_buy_rate, old_sell_rate, updated_by, update_type, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'daily_update', ?)
        `;
        
        await connection.execute(historyQuery, [
            currencyId,
            rate !== undefined ? rate : null,
            buyRate !== undefined ? buyRate : null,
            sellRate !== undefined ? sellRate : null,
            currency.current_rate,
            currency.buy_rate,
            currency.sell_rate,
            req.user.id,
            notes || `Daily rate update by ${req.user.username}`
        ]);
        
        // Insert audit log
        const auditQuery = `
            INSERT INTO ibd_audit_log (user_id, action, currency_id, old_data, new_data, details)
            VALUES (?, 'UPDATE_RATE', ?, ?, ?, ?)
        `;
        
        await connection.execute(auditQuery, [
            req.user.id,
            currencyId,
            JSON.stringify({
                rate: currency.current_rate,
                buy_rate: currency.buy_rate,
                sell_rate: currency.sell_rate
            }),
            JSON.stringify({ rate, buyRate, sellRate }),
            JSON.stringify({ notes })
        ]);
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `Exchange rate for ${currency.code} updated successfully`,
            currencyId,
            updatedBy: req.user.username,
            updatedAt: new Date()
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Update rate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update rate'
        });
    } finally {
        connection.release();
    }
};

/**
 * Add new currency
 */
const addCurrency = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { code, name, symbol, current_rate, buy_rate, sell_rate } = req.body;
        
        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: 'Currency code and name are required'
            });
        }
        
        await connection.beginTransaction();
        
        // Check if currency exists
        const [existing] = await connection.execute(
            'SELECT id FROM currencies WHERE code = ?',
            [code.toUpperCase()]
        );
        
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'Currency already exists'
            });
        }
        
        // Insert new currency
        const [result] = await connection.execute(
            `INSERT INTO currencies (code, name, symbol, current_rate, buy_rate, sell_rate, is_active, created_at)
             VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
            [code.toUpperCase(), name, symbol || null, current_rate || null, buy_rate || null, sell_rate || null]
        );
        
        // Insert audit log
        await connection.execute(
            `INSERT INTO ibd_audit_log (user_id, action, currency_id, new_data)
             VALUES (?, 'ADD_CURRENCY', ?, ?)`,
            [req.user.id, result.insertId, JSON.stringify({ code, name, symbol, current_rate, buy_rate, sell_rate })]
        );
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: `Currency ${code} added successfully`,
            currencyId: result.insertId
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Add currency error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add currency'
        });
    } finally {
        connection.release();
    }
};

/**
 * Bulk update rates
 */
const bulkUpdateRates = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { updates } = req.body;
        
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }
        
        await connection.beginTransaction();
        
        let successCount = 0;
        let failedUpdates = [];
        
        for (const update of updates) {
            try {
                const { currencyId, rate, buyRate, sellRate, notes } = update;
                
                // Get current currency
                const [currencyRows] = await connection.execute(
                    'SELECT id, code, current_rate, buy_rate, sell_rate FROM currencies WHERE id = ? AND is_active = true',
                    [currencyId]
                );
                
                if (currencyRows.length === 0) {
                    failedUpdates.push({ currencyId, error: 'Currency not found' });
                    continue;
                }
                
                const currency = currencyRows[0];
                const updateFields = [];
                const updateValues = [];
                
                if (rate !== undefined) {
                    updateFields.push('current_rate = ?');
                    updateValues.push(rate);
                }
                
                if (buyRate !== undefined) {
                    updateFields.push('buy_rate = ?');
                    updateValues.push(buyRate);
                }
                
                if (sellRate !== undefined) {
                    updateFields.push('sell_rate = ?');
                    updateValues.push(sellRate);
                }
                
                if (updateFields.length === 0) {
                    failedUpdates.push({ currencyId, error: 'No rate values provided' });
                    continue;
                }
                
                updateFields.push('last_updated_by = ?');
                updateFields.push('last_updated_at = NOW()');
                updateValues.push(req.user.id);
                updateValues.push(currencyId);
                
                await connection.execute(
                    `UPDATE currencies SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateValues
                );
                
                await connection.execute(
                    `INSERT INTO rate_history (currency_id, rate_value, buy_rate, sell_rate, old_rate, old_buy_rate, old_sell_rate, updated_by, update_type, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'bulk_update', ?)`,
                    [
                        currencyId,
                        rate !== undefined ? rate : null,
                        buyRate !== undefined ? buyRate : null,
                        sellRate !== undefined ? sellRate : null,
                        currency.current_rate,
                        currency.buy_rate,
                        currency.sell_rate,
                        req.user.id,
                        notes || `Bulk update by ${req.user.username}`
                    ]
                );
                
                successCount++;
            } catch (updateError) {
                failedUpdates.push({ currencyId: update.currencyId, error: updateError.message });
            }
        }
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `Bulk update completed: ${successCount} currencies updated`,
            successCount,
            failedCount: failedUpdates.length,
            failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Bulk update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk update'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get rate history
 */
const getRateHistory = async (req, res) => {
    try {
        const { currencyId } = req.params;
        const { days = 30, limit = 100 } = req.query;
        
        const [rows] = await pool.execute(
            `SELECT 
                rh.*,
                u.username as updated_by_name
             FROM rate_history rh
             LEFT JOIN users u ON rh.updated_by = u.id
             WHERE rh.currency_id = ?
                 AND rh.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             ORDER BY rh.created_at DESC
             LIMIT ?`,
            [currencyId, days, limit]
        );
        
        res.json({
            success: true,
            history: rows,
            total: rows.length
        });
        
    } catch (error) {
        console.error('Get rate history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rate history'
        });
    }
};

/**
 * Get daily report
 */
const getDailyReport = async (req, res) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        // Get updates for the date
        const [updates] = await pool.execute(
            `SELECT 
                rh.*,
                c.code,
                c.name,
                u.username as updated_by_name
             FROM rate_history rh
             JOIN currencies c ON rh.currency_id = c.id
             LEFT JOIN users u ON rh.updated_by = u.id
             WHERE DATE(rh.created_at) = ?
             ORDER BY rh.created_at DESC`,
            [date]
        );
        
        // Get summary
        const [summary] = await pool.execute(
            `SELECT 
                COUNT(DISTINCT currency_id) as total_currencies_updated,
                COUNT(*) as total_updates,
                COUNT(DISTINCT updated_by) as total_updaters
             FROM rate_history
             WHERE DATE(created_at) = ?`,
            [date]
        );
        
        res.json({
            success: true,
            date,
            summary: summary[0] || { total_currencies_updated: 0, total_updates: 0, total_updaters: 0 },
            updates
        });
        
    } catch (error) {
        console.error('Get daily report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch daily report'
        });
    }
};

module.exports = {
    getCurrenciesForIBD,
    updateDailyRate,
    bulkUpdateRates,
    addCurrency,
    getRateHistory,
    getDailyReport
};