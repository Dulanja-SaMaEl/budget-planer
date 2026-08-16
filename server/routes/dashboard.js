const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// GET /api/dashboard - Household Financial Overview & 50/30/20 Calculations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { household_id } = req.user;

    // Mock/DB structure fallback for production deployment
    // In production, execute PostgreSQL queries via pool
    /*
    const pool = req.app.get('dbPool');
    const partnersResult = await pool.query('SELECT id, name, monthly_net_income, pay_frequency FROM users WHERE household_id = $1', [household_id]);
    const expensesResult = await pool.query('SELECT t.*, c.type FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.household_id = $1', [household_id]);
    const goalsResult = await pool.query('SELECT * FROM savings_goals WHERE household_id = $1', [household_id]);
    */

    // Demo Data / Database Response Structure
    const partnerA = { id: 'p1', name: 'Alex', netIncome: 4500, payFrequency: 'Bi-Weekly', payDay: '1st & 15th' };
    const partnerB = { id: 'p2', name: 'Jordan', netIncome: 3500, payFrequency: 'Monthly', payDay: '28th' };

    const totalIncome = partnerA.netIncome + partnerB.netIncome; // $8,000

    // Proportional Split Ratio
    const partnerAShareRatio = totalIncome > 0 ? (partnerA.netIncome / totalIncome) : 0.5;
    const partnerBShareRatio = totalIncome > 0 ? (partnerB.netIncome / totalIncome) : 0.5;

    // 50/30/20 Rule Benchmarks
    const benchmarks = {
      needsTarget: totalIncome * 0.50, // $4,000
      wantsTarget: totalIncome * 0.30, // $2,400
      savingsTarget: totalIncome * 0.20 // $1,600
    };

    // Actual Logged Expenses
    const actualSpend = {
      needs: 3800,
      wants: 1950,
      savings: 1650
    };

    const totalExpenses = actualSpend.needs + actualSpend.wants; // $5,750
    const netSavings = totalIncome - totalExpenses; // $2,250

    // Savings Goals Progress
    const goals = [
      { id: 'g1', title: 'Emergency Fund', targetAmount: 15000, currentAmount: 11200, category: 'emergency', monthlyContribution: 800 },
      { id: 'g2', title: 'Japan Vacation', targetAmount: 5000, currentAmount: 3400, category: 'vacation', monthlyContribution: 450 },
      { id: 'g3', title: 'House Downpayment', targetAmount: 40000, currentAmount: 18500, category: 'house', monthlyContribution: 1000 }
    ];

    res.json({
      success: true,
      data: {
        household: { id: household_id || 'demo-household', name: "Alex & Jordan's Future Fund" },
        income: {
          partnerA,
          partnerB,
          combinedTotal: totalIncome,
          proportionalSplit: {
            partnerAPercent: Math.round(partnerAShareRatio * 100),
            partnerBPercent: Math.round(partnerBShareRatio * 100)
          }
        },
        budgetRule503020: {
          benchmarks,
          actualSpend,
          status: {
            needsRemaining: benchmarks.needsTarget - actualSpend.needs,
            wantsRemaining: benchmarks.wantsTarget - actualSpend.wants,
            savingsSurplus: actualSpend.savings - benchmarks.savingsTarget
          }
        },
        overview: {
          totalIncome,
          totalExpenses,
          totalSavingsLogged: actualSpend.savings,
          remainingUnallocated: netSavings - actualSpend.savings
        },
        goals
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard overview' });
  }
});

module.exports = router;
