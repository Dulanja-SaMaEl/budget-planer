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
            sampleBill: Number(s.sample_bill_amount),
            startingSavings: Number(s.starting_savings),
            monthlyContribution: Number(s.monthly_contribution),
            annualReturn: Number(s.annual_return),
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
        if (transRes.rows.length > 0) {
          expenses = transRes.rows.map(row => ({ ...row, amount: Number(row.amount) }));
        }

        // Fetch goals
        const goalsRes = await pool.query(
          'SELECT id, title, category, target_amount as target, current_amount as current FROM savings_goals WHERE household_id = $1 ORDER BY created_at ASC',
          [DEMO_HOUSEHOLD_ID]
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
        sampleBill || 100000,
        startingSavings || 1000000,
        monthlyContribution || 150000,
        annualReturn || 10,
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

module.exports = router;
