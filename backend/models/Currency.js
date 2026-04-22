const { pool } = require('../config/database');

class Currency {
    static async getAll(withRates = true) {
        let query = `
            SELECT c.*, 
                   er.sell_rate, er.buy_rate, er.effective_date,
                   er.id as rate_id
            FROM currencies c
            LEFT JOIN exchange_rates er ON c.id = er.currency_id 
                AND er.effective_date = (
                    SELECT MAX(effective_date) 
                    FROM exchange_rates 
                    WHERE currency_id = c.id AND status = 'active'
                )
            WHERE c.is_active = TRUE
            ORDER BY c.display_order ASC, c.name ASC
        `;
        
        const [rows] = await pool.execute(query);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute(
            `SELECT c.*, 
                    er.sell_rate, er.buy_rate, er.effective_date,
                    er.id as rate_id
             FROM currencies c
             LEFT JOIN exchange_rates er ON c.id = er.currency_id 
                 AND er.effective_date = (
                     SELECT MAX(effective_date) 
                     FROM exchange_rates 
                     WHERE currency_id = c.id AND status = 'active'
                 )
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async create(currencyData, userId) {
        const { name, code, symbol, icon, display_order, country_code } = currencyData;
        const [result] = await pool.execute(
            `INSERT INTO currencies (name, code, symbol, icon, display_order, country_code, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, code.toUpperCase(), symbol, icon, display_order || 0, country_code || null, userId]
        );
        return result.insertId;
    }

    static async addRate(currencyId, sellRate, buyRate, userId) {
        const effectiveDate = new Date().toISOString().split('T')[0];
        
        // Get currency info for history
        const currency = await this.getById(currencyId);
        
        // Check if rate exists for today
        const [existing] = await pool.execute(
            'SELECT id, sell_rate, buy_rate FROM exchange_rates WHERE currency_id = ? AND effective_date = ?',
            [currencyId, effectiveDate]
        );
        
        let rateId;
        
        if (existing.length > 0) {
            // Get old rates for history
            const oldSellRate = existing[0].sell_rate;
            const oldBuyRate = existing[0].buy_rate;
            
            // Update existing rate
            await pool.execute(
                `UPDATE exchange_rates 
                 SET sell_rate = ?, buy_rate = ?, updated_by = ?, updated_at = NOW()
                 WHERE id = ?`,
                [sellRate, buyRate, userId, existing[0].id]
            );
            
            rateId = existing[0].id;
            
            // Insert into history with old and new values
            await pool.execute(
                `INSERT INTO rate_history 
                 (currency_id, currency_code, currency_name, 
                  old_sell_rate, new_sell_rate, old_buy_rate, new_buy_rate, 
                  effective_date, action_type, changed_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'update', ?)`,
                [currencyId, currency.code, currency.name, 
                 oldSellRate, sellRate, oldBuyRate, buyRate, 
                 effectiveDate, userId]
            );
        } else {
            // Insert new rate
            const [result] = await pool.execute(
                `INSERT INTO exchange_rates 
                 (currency_id, sell_rate, buy_rate, effective_date, created_by, updated_by)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [currencyId, sellRate, buyRate, effectiveDate, userId, userId]
            );
            rateId = result.insertId;
            
            // Insert into history for new rate
            await pool.execute(
                `INSERT INTO rate_history 
                 (currency_id, currency_code, currency_name, 
                  new_sell_rate, new_buy_rate, 
                  effective_date, action_type, changed_by)
                 VALUES (?, ?, ?, ?, ?, ?, 'create', ?)`,
                [currencyId, currency.code, currency.name, 
                 sellRate, buyRate, effectiveDate, userId]
            );
        }
        
        return rateId;
    }

    static async update(id, currencyData, userId) {
        const { name, code, symbol, icon, display_order, is_active, country_code } = currencyData;
        
        const [result] = await pool.execute(
            `UPDATE currencies 
             SET name = ?, code = ?, symbol = ?, icon = ?, 
                 display_order = ?, is_active = ?, country_code = ?
             WHERE id = ?`,
            [name, code.toUpperCase(), symbol, icon, display_order, is_active, country_code, id]
        );
        
        return result.affectedRows;
    }

    static async delete(id, userId) {
        // Get currency info before deletion
        const currency = await this.getById(id);
        
        // Get current rates
        const [rates] = await pool.execute(
            'SELECT sell_rate, buy_rate, effective_date FROM exchange_rates WHERE currency_id = ? AND status = "active"',
            [id]
        );
        
        // Soft delete - mark inactive
        const [result] = await pool.execute('UPDATE currencies SET is_active = 0 WHERE id = ?', [id]);
        
        // Log deletion in history
        if (rates.length > 0) {
            await pool.execute(
                `INSERT INTO rate_history 
                 (currency_id, currency_code, currency_name, 
                  old_sell_rate, old_buy_rate, effective_date, action_type, changed_by)
                 VALUES (?, ?, ?, ?, ?, ?, 'delete', ?)`,
                [id, currency.code, currency.name, rates[0].sell_rate, rates[0].buy_rate, rates[0].effective_date, userId]
            );
        }
        
        return result.affectedRows;
    }

    static async getRateHistory(currencyId = null, limit = 100) {
        let query = `
            SELECT rh.*, u.username as changed_by_name
            FROM rate_history rh
            LEFT JOIN users u ON rh.changed_by = u.id
        `;
        
        const params = [];
        if (currencyId) {
            query += ' WHERE rh.currency_id = ?';
            params.push(currencyId);
        }
        
        query += ' ORDER BY rh.created_at DESC LIMIT ?';
        params.push(limit);
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getHistoricalRates(currencyId, days = 30) {
        const [rows] = await pool.execute(
            `SELECT er.*, u.username as updated_by_name
             FROM exchange_rates er
             LEFT JOIN users u ON er.updated_by = u.id
             WHERE er.currency_id = ? 
               AND er.effective_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             ORDER BY er.effective_date DESC`,
            [currencyId, days]
        );
        return rows;
    }
}

module.exports = Currency;