const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// GET /api/dashboard - Household Overview & Proportional Split Logic
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { household_id } = req.user;

    const partnerA = { id: 'p1', name: 'Dulanja', netIncome: 450000, payFrequency: 'Monthly', payDay: '25th' };
    const partnerB = { id: 'p2', name: 'Diyana', netIncome: 350000, payFrequency: 'Monthly', payDay: '28th' };

    const totalIncome = partnerA.netIncome + partnerB.netIncome; // Rs. 800,000

    const partnerAShareRatio = totalIncome > 0 ? (partnerA.netIncome / totalIncome) : 0.5;
    const partnerBShareRatio = totalIncome > 0 ? (partnerB.netIncome / totalIncome) : 0.5;

    const benchmarks = {
      needsTarget: totalIncome * 0.50, // Rs. 400,000
      wantsTarget: totalIncome * 0.30, // Rs. 240,000
      savingsTarget: totalIncome * 0.20 // Rs. 160,000
    };

    const actualSpend = {
      needs: 320000,
      wants: 180000,
      savings: 150000
    };

    const totalExpenses = actualSpend.needs + actualSpend.wants;
    const netSavings = totalIncome - totalExpenses;

    const goals = [
      { id: 'g1', title: 'Emergency Fund (6 Months)', targetAmount: 2000000, currentAmount: 1200000, category: 'Emergency' },
      { id: 'g2', title: 'Dream Vacation Trip', targetAmount: 600000, currentAmount: 350000, category: 'Vacation' },
      { id: 'g3', title: 'House Downpayment Fund', targetAmount: 5000000, currentAmount: 2500000, category: 'Milestone' }
    ];

    res.json({
      success: true,
      currency: 'Rs.',
      data: {
        household: { id: household_id || 'demo-household', name: "Dulanja & Diyana's Future Fund" },
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
          actualSpend
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
