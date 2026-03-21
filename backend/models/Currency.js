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
        const { name, code, symbol, icon, display_order } = currencyData;
        const [result] = await pool.execute(
            `INSERT INTO currencies (name, code, symbol, icon, display_order, created_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, code.toUpperCase(), symbol, icon, display_order || 0, userId]
        );
        return result.insertId;
    }

    static async addRate(currencyId, sellRate, buyRate, userId) {
        const effectiveDate = new Date().toISOString().split('T')[0];
        
        const [existing] = await pool.execute(
            'SELECT id FROM exchange_rates WHERE currency_id = ? AND effective_date = ?',
            [currencyId, effectiveDate]
        );
        
        let rateId;
        if (existing.length > 0) {
            await pool.execute(
                `UPDATE exchange_rates 
                 SET sell_rate = ?, buy_rate = ?, updated_by = ?, updated_at = NOW()
                 WHERE id = ?`,
                [sellRate, buyRate, userId, existing[0].id]
            );
            rateId = existing[0].id;
        } else {
            const [result] = await pool.execute(
                `INSERT INTO exchange_rates 
                 (currency_id, sell_rate, buy_rate, effective_date, created_by, updated_by)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [currencyId, sellRate, buyRate, effectiveDate, userId, userId]
            );
            rateId = result.insertId;
        }
        
        const currency = await this.getById(currencyId);
        
        await pool.execute(
            `INSERT INTO rate_history 
             (currency_id, currency_code, currency_name, sell_rate, buy_rate, 
              effective_date, action_type, changed_by)
             VALUES (?, ?, ?, ?, ?, ?, 'update', ?)`,
            [currencyId, currency.code, currency.name, sellRate, buyRate, effectiveDate, userId]
        );
        
        return rateId;
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
}

module.exports = Currency;