const { pool } = require('../config/database');
const Currency = require('./Currency');

class PendingChange {
    static async create(changeData, userId) {
        const {
            currency_id,
            currency_name,
            currency_code,
            currency_symbol,
            currency_icon,
            sell_rate,
            buy_rate,
            effective_date,
            change_type
        } = changeData;
        
        const [result] = await pool.execute(
            `INSERT INTO pending_changes 
             (currency_id, currency_name, currency_code, currency_symbol, 
              currency_icon, sell_rate, buy_rate, effective_date, 
              change_type, requested_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [currency_id || null, currency_name, currency_code, currency_symbol,
             currency_icon, sell_rate, buy_rate, effective_date,
             change_type, userId]
        );
        return result.insertId;
    }

    static async getAllPending() {
        const [rows] = await pool.execute(
            `SELECT pc.*, 
                    u.username as requested_by_name,
                    u2.username as approved_by_name
             FROM pending_changes pc
             LEFT JOIN users u ON pc.requested_by = u.id
             LEFT JOIN users u2 ON pc.approved_by = u2.id
             WHERE pc.approval_status = 'pending'
             ORDER BY pc.created_at ASC`
        );
        return rows;
    }

    static async approve(id, approverId) {
        const [change] = await pool.execute(
            'SELECT * FROM pending_changes WHERE id = ?',
            [id]
        );
        
        if (change.length === 0) return false;
        
        const pending = change[0];
        
        if (pending.change_type === 'add_currency') {
            // Create new currency
            const currencyId = await Currency.create({
                name: pending.currency_name,
                code: pending.currency_code,
                symbol: pending.currency_symbol,
                icon: pending.currency_icon,
                country_code: null
            }, approverId);
            
            // Add the rate
            await Currency.addRate(currencyId, pending.sell_rate, pending.buy_rate, approverId);
            
        } else if (pending.change_type === 'update_rate' && pending.currency_id) {
            // Update existing rate
            await Currency.addRate(pending.currency_id, pending.sell_rate, pending.buy_rate, approverId);
            
        } else if (pending.change_type === 'delete_currency' && pending.currency_id) {
            // Soft delete - mark as inactive
            await pool.execute('UPDATE currencies SET is_active = 0 WHERE id = ?', [pending.currency_id]);
            
            // Also log deletion in history
            const currency = await Currency.getById(pending.currency_id);
            if (currency) {
                await pool.execute(
                    `INSERT INTO rate_history 
                     (currency_id, currency_code, currency_name, 
                      old_sell_rate, old_buy_rate, effective_date, action_type, changed_by)
                     VALUES (?, ?, ?, ?, ?, CURDATE(), 'delete', ?)`,
                    [pending.currency_id, currency.code, currency.name, 
                     currency.sell_rate, currency.buy_rate, approverId]
                );
            }
        }
        
        // Update pending status
        const [result] = await pool.execute(
            `UPDATE pending_changes 
             SET approval_status = 'approved', approved_by = ?, updated_at = NOW()
             WHERE id = ?`,
            [approverId, id]
        );
        
        return result.affectedRows;
    }

    static async reject(id, approverId, reason) {
        const [result] = await pool.execute(
            `UPDATE pending_changes 
             SET approval_status = 'rejected', approved_by = ?, 
                 rejection_reason = ?, updated_at = NOW()
             WHERE id = ?`,
            [approverId, reason, id]
        );
        return result.affectedRows;
    }
}

module.exports = PendingChange;