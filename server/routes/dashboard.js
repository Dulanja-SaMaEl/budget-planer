const express = require('express');
const router = express.Router();

const DEMO_HOUSEHOLD_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

// GET /api/dashboard - Fetch Complete Household Financial Data & Settings from Supabase
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    
    let partnerA = { name: 'Dulanja', income: 450000, payDate: '25th of every month' };
    let partnerB = { name: 'Diyana', income: 350000, payDate: '28th of every month' };
    let settings = {
      currency: 'Rs.',
      sampleBill: 100000,
      startingSavings: 1000000,
      monthlyContribution: 150000,
      annualReturn: 10,
      actualSpend: { needs: 320000, wants: 180000, savings: 150000 }
    };
    let expenses = [];
    let goals = [];
    let incomeSources = [
      { id: 'inc-1', title: 'Mobile App Development Client Project', amount: 120000, receivedBy: 'Dulanja', category: 'Project', recurrence: 'monthly', date: '2026-08-20' },
      { id: 'inc-2', title: 'Brand Identity & UI Kit Design', amount: 75000, receivedBy: 'Diyana', category: 'Freelance', recurrence: 'monthly', date: '2026-08-18' }
    ];

    if (pool && process.env.DATABASE_URL) {
      try {
        // Fetch household settings
        const settingsRes = await pool.query(
          'SELECT currency, sample_bill_amount, starting_savings, monthly_contribution, annual_return, needs_actual, wants_actual, savings_actual FROM household_settings WHERE household_id = $1',
          [DEMO_HOUSEHOLD_ID]
        );
        if (settingsRes.rows.length > 0) {
          const s = settingsRes.rows[0];
          settings = {
            currency: s.currency || 'Rs.',
            sampleBill: s.sample_bill_amount !== null ? Number(s.sample_bill_amount) : 100000,
            startingSavings: s.starting_savings !== null ? Number(s.starting_savings) : 1000000,
            monthlyContribution: s.monthly_contribution !== null ? Number(s.monthly_contribution) : 150000,
            annualReturn: s.annual_return !== null ? Number(s.annual_return) : 10,
            actualSpend: {
              needs: Number(s.needs_actual),
              wants: Number(s.wants_actual),
              savings: Number(s.savings_actual)
            }
          };
        }

        // Fetch partner profiles & salaries
        const usersRes = await pool.query(
          'SELECT name, monthly_net_income, pay_day FROM users WHERE household_id = $1 OR LOWER(name) IN (\'dulanja\', \'diyana\')',
          [DEMO_HOUSEHOLD_ID]
        );

        if (usersRes.rows.length > 0) {
          const userA = usersRes.rows.find(u => u.name.toLowerCase() === 'dulanja');
          const userB = usersRes.rows.find(u => u.name.toLowerCase() === 'diyana');
          if (userA) partnerA = { name: userA.name, income: Number(userA.monthly_net_income), payDate: `${userA.pay_day || '25th'} of every month` };
          if (userB) partnerB = { name: userB.name, income: Number(userB.monthly_net_income), payDate: `${userB.pay_day || '28th'} of every month` };
        }

        // Fetch transactions
        const transRes = await pool.query(
          'SELECT id, title, amount, paid_by_name as "paidBy", category, split_type as "splitType", to_char(transaction_date, \'YYYY-MM-DD\') as date FROM transactions WHERE household_id = $1 ORDER BY created_at DESC LIMIT 50',
          [DEMO_HOUSEHOLD_ID]
        );
        expenses = transRes.rows.map(row => ({ ...row, amount: Number(row.amount) }));

        // Fetch goals
        const goalsRes = await pool.query(
          'SELECT id, title, category, target_amount as target, current_amount as current FROM savings_goals WHERE household_id = $1 ORDER BY created_at ASC',
          [DEMO_HOUSEHOLD_ID]
        );
        goals = goalsRes.rows.map((row, idx) => ({
          ...row,
          target: Number(row.target),
          current: Number(row.current),
          color: idx % 3 === 0 ? 'bg-emerald-500' : idx % 3 === 1 ? 'bg-indigo-500' : 'bg-purple-500'
        }));

        // Fetch income sources
        try {
          const incomeRes = await pool.query(
            `SELECT id, title, amount, received_by_name as "receivedBy", category, recurrence, to_char(income_date, 'YYYY-MM-DD') as date 
             FROM income_sources 
             WHERE household_id = $1 
             ORDER BY created_at DESC`,
            [DEMO_HOUSEHOLD_ID]
          );
          if (incomeRes.rows.length > 0) {
            incomeSources = incomeRes.rows.map(row => ({ ...row, amount: Number(row.amount) }));
          }
        } catch (incErr) {
          console.error('Income sources table fallback:', incErr.message);
        }

      } catch (dbErr) {
        console.error('Database query fallback:', dbErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        partnerA,
        partnerB,
        settings,
        expenses,
        goals,
        incomeSources
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
      message: 'Salaries updated in DB successfully'
    });
  } catch (err) {
    console.error('Error saving salary to DB:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dashboard/settings - Save Splitter, Projection & Currency Settings to Supabase DB
router.post('/settings', async (req, res) => {
  try {
    const { currency, sampleBill, startingSavings, monthlyContribution, annualReturn, actualSpend } = req.body;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      const upsertQuery = `
        INSERT INTO household_settings (household_id, currency, sample_bill_amount, starting_savings, monthly_contribution, annual_return, needs_actual, wants_actual, savings_actual)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (household_id) DO UPDATE SET
          currency = EXCLUDED.currency,
          sample_bill_amount = EXCLUDED.sample_bill_amount,
          starting_savings = EXCLUDED.starting_savings,
          monthly_contribution = EXCLUDED.monthly_contribution,
          annual_return = EXCLUDED.annual_return,
          needs_actual = EXCLUDED.needs_actual,
          wants_actual = EXCLUDED.wants_actual,
          savings_actual = EXCLUDED.savings_actual;
      `;
      await pool.query(upsertQuery, [
        DEMO_HOUSEHOLD_ID,
        currency || 'Rs.',
        sampleBill !== undefined && sampleBill !== null ? sampleBill : 100000,
        startingSavings !== undefined && startingSavings !== null ? startingSavings : 1000000,
        monthlyContribution !== undefined && monthlyContribution !== null ? monthlyContribution : 150000,
        annualReturn !== undefined && annualReturn !== null ? annualReturn : 10,
        actualSpend ? actualSpend.needs : 320000,
        actualSpend ? actualSpend.wants : 180000,
        actualSpend ? actualSpend.savings : 150000
      ]);
    }

    res.json({ success: true, message: 'Settings saved to DB' });
  } catch (err) {
    console.error('Error saving settings to DB:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dashboard/goals - Add New Savings Goal to Supabase DB
router.post('/goals', async (req, res) => {
  try {
    const { title, category, target, current } = req.body;
    const pool = req.app.get('dbPool');
    let insertedGoal = {
      id: Date.now().toString(),
      title,
      category: category || 'General',
      target: Number(target),
      current: Number(current || 0),
      color: 'bg-emerald-500'
    };

    if (pool && process.env.DATABASE_URL) {
      const result = await pool.query(
        'INSERT INTO savings_goals (household_id, title, category, target_amount, current_amount) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, category, target_amount as target, current_amount as current',
        [DEMO_HOUSEHOLD_ID, title, category || 'General', target, current || 0]
      );
      if (result.rows.length > 0) {
        insertedGoal = {
          ...result.rows[0],
          target: Number(result.rows[0].target),
          current: Number(result.rows[0].current),
          color: 'bg-emerald-500'
        };
      }
    }

    res.status(201).json({ success: true, goal: insertedGoal });
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/dashboard/goals/:id - Update Saved Amount of a Goal in Supabase DB
router.put('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { current, target } = req.body;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      if (current !== undefined) {
        await pool.query('UPDATE savings_goals SET current_amount = $1 WHERE id::text = $2 OR id = $2', [current, id]);
      }
      if (target !== undefined) {
        await pool.query('UPDATE savings_goals SET target_amount = $1 WHERE id::text = $2 OR id = $2', [target, id]);
      }
    }

    res.json({ success: true, message: 'Goal updated' });
  } catch (err) {
    console.error('Error updating goal:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/dashboard/goals/:id - Delete Savings Goal from Supabase DB
router.delete('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      await pool.query('DELETE FROM savings_goals WHERE id::text = $1', [String(id)]);
    }

    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    console.error('Error deleting goal:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dashboard/clean-past-months - Remove all records before startMonth and start fresh
router.post('/clean-past-months', async (req, res) => {
  try {
    const { startMonth } = req.body;
    const today = new Date();
    const activeStartMonth = startMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const cutoffDate = `${activeStartMonth}-01`;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      // 1. Delete transactions before start month
      await pool.query(
        'DELETE FROM transactions WHERE household_id = $1 AND transaction_date < $2',
        [DEMO_HOUSEHOLD_ID, cutoffDate]
      );

      // 2. Delete one-time income sources before start month
      await pool.query(
        'DELETE FROM income_sources WHERE household_id = $1 AND income_date < $2 AND recurrence = \'one-time\'',
        [DEMO_HOUSEHOLD_ID, cutoffDate]
      );

      // 3. Reset 50/30/20 actual spend in settings to 0 for a clean slate
      await pool.query(
        'UPDATE household_settings SET needs_actual = 0, wants_actual = 0, savings_actual = 0 WHERE household_id = $1',
        [DEMO_HOUSEHOLD_ID]
      );
    }

    res.json({ 
      success: true, 
      message: `Past data before ${cutoffDate} removed successfully. Tracking starts fresh from ${activeStartMonth}!` 
    });
  } catch (err) {
    console.error('Error cleaning past months:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
