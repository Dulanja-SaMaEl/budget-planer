const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// GET /api/expenses - List Recent Daily Expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { household_id } = req.user;
    /*
    const pool = req.app.get('dbPool');
    const result = await pool.query('SELECT * FROM transactions WHERE household_id = $1 ORDER BY transaction_date DESC LIMIT 50', [household_id]);
    return res.json({ success: true, expenses: result.rows });
    */

    const sampleExpenses = [
      { id: '1', title: 'Keells Supermarket Groceries', amount: 45000, paidBy: 'Dulanja', category: 'Needs', splitType: 'Proportional', date: '2026-08-16' },
      { id: '2', title: 'Fiber Broadband & Electricity', amount: 18000, paidBy: 'Diyana', category: 'Needs', splitType: 'Proportional', date: '2026-08-15' },
      { id: '3', title: 'Weekend Dinner & Drinks', amount: 12500, paidBy: 'Dulanja', category: 'Wants', splitType: '50/50', date: '2026-08-14' }
    ];

    res.json({ success: true, data: sampleExpenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/expenses - Log New Daily Expense
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, amount, paidBy, category, splitType, date } = req.body;
    
    // In production, execute PostgreSQL INSERT query:
    /*
    const pool = req.app.get('dbPool');
    const query = `
      INSERT INTO transactions (household_id, title, amount, split_type, transaction_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(query, [req.user.household_id, title, amount, splitType, date || new Date()]);
    */

    const newExpense = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      paidBy,
      category,
      splitType: splitType || 'Proportional',
      date: date || new Date().toISOString().split('T')[0]
    };

    res.status(201).json({ success: true, message: 'Expense logged successfully', expense: newExpense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
