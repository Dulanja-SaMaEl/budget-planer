const express = require('express');
const router = express.Router();

const DEMO_HOUSEHOLD_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

// GET /api/expenses - List Recent Daily Expenses
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    if (pool && process.env.DATABASE_URL) {
      const result = await pool.query(
        'SELECT id, title, amount, paid_by_name as "paidBy", category, split_type as "splitType", to_char(transaction_date, \'YYYY-MM-DD\') as date FROM transactions ORDER BY created_at DESC LIMIT 50'
      );
      return res.json({ success: true, data: result.rows.map(r => ({ ...r, amount: Number(r.amount) })) });
    }
    
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/expenses - Log New Daily Expense into Supabase
router.post('/', async (req, res) => {
  try {
    const { title, amount, paidBy, category, splitType, date } = req.body;
    const pool = req.app.get('dbPool');
    let insertedExpense = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      paidBy,
      category,
      splitType: splitType || 'Proportional',
      date: date || new Date().toISOString().split('T')[0]
    };

    if (pool && process.env.DATABASE_URL) {
      const query = `
        INSERT INTO transactions (household_id, paid_by_name, category, title, amount, split_type, transaction_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, amount, paid_by_name as "paidBy", category, split_type as "splitType", to_char(transaction_date, 'YYYY-MM-DD') as date
      `;
      const result = await pool.query(query, [
        DEMO_HOUSEHOLD_ID,
        paidBy || 'Dulanja',
        category || 'Needs',
        title,
        amount,
        splitType || 'Proportional',
        date || new Date().toISOString().split('T')[0]
      ]);
      if (result.rows.length > 0) {
        insertedExpense = { ...result.rows[0], amount: Number(result.rows[0].amount) };
      }
    }

    res.status(201).json({ success: true, message: 'Expense logged successfully', expense: insertedExpense });
  } catch (err) {
    console.error('Error logging expense to DB:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/expenses/:id - Delete Expense from Supabase
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      await pool.query('DELETE FROM transactions WHERE id = $1 OR id::text = $2', [id, id]);
    }

    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
