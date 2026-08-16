const express = require('express');
const router = express.Router();

const DEMO_HOUSEHOLD_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

// GET /api/dashboard - Fetch Household Financial Data from Supabase / DB
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    
    let partnerA = { name: 'Dulanja', income: 450000, payDate: '25th of every month' };
    let partnerB = { name: 'Diyana', income: 350000, payDate: '28th of every month' };
    let expenses = [];
    let goals = [];

    if (pool && process.env.DATABASE_URL) {
      try {
        // Fetch users from DB
        const usersRes = await pool.query(
          'SELECT name, monthly_net_income, pay_day FROM users WHERE household_id = $1 OR name IN (\'Dulanja\', \'Diyana\')',
          [DEMO_HOUSEHOLD_ID]
        );

        if (usersRes.rows.length > 0) {
          const userA = usersRes.rows.find(u => u.name.toLowerCase() === 'dulanja');
          const userB = usersRes.rows.find(u => u.name.toLowerCase() === 'diyana');
          if (userA) partnerA = { name: userA.name, income: Number(userA.monthly_net_income), payDate: `${userA.pay_day || '25th'} of every month` };
          if (userB) partnerB = { name: userB.name, income: Number(userB.monthly_net_income), payDate: `${userB.pay_day || '28th'} of every month` };
        }

        // Fetch transactions from DB
        const transRes = await pool.query(
          'SELECT id, title, amount, paid_by_name as "paidBy", category, split_type as "splitType", to_char(transaction_date, \'YYYY-MM-DD\') as date FROM transactions ORDER BY created_at DESC LIMIT 50'
        );
        if (transRes.rows.length > 0) {
          expenses = transRes.rows.map(row => ({ ...row, amount: Number(row.amount) }));
        }

        // Fetch goals from DB
        const goalsRes = await pool.query(
          'SELECT id, title, category, target_amount as target, current_amount as current FROM savings_goals ORDER BY created_at ASC'
        );
        if (goalsRes.rows.length > 0) {
          goals = goalsRes.rows.map((row, idx) => ({
            ...row,
            target: Number(row.target),
            current: Number(row.current),
            color: idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-indigo-500' : 'bg-purple-500'
          }));
        }

      } catch (dbErr) {
        console.error('Database query fallback to default state:', dbErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        partnerA,
        partnerB,
        expenses,
        goals
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard overview' });
  }
});

// POST /api/dashboard/salary - Save Salaries to Supabase DB
router.post('/salary', async (req, res) => {
  try {
    const { partnerAIncome, partnerBIncome, partnerAName, partnerBName } = req.body;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      await pool.query(
        'UPDATE users SET monthly_net_income = $1 WHERE LOWER(name) = LOWER($2)',
        [partnerAIncome, partnerAName || 'Dulanja']
      );
      await pool.query(
        'UPDATE users SET monthly_net_income = $1 WHERE LOWER(name) = LOWER($2)',
        [partnerBIncome, partnerBName || 'Diyana']
      );
    }

    res.json({
      success: true,
      message: 'Salaries updated in DB successfully',
      data: {
        partnerA: { name: partnerAName || 'Dulanja', income: Number(partnerAIncome) },
        partnerB: { name: partnerBName || 'Diyana', income: Number(partnerBIncome) }
      }
    });
  } catch (err) {
    console.error('Error saving salary to DB:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
