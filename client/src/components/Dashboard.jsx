import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Wallet, TrendingUp, PiggyBank, Scale, 
  PlusCircle, Calculator, Heart, ShieldCheck, Target, ArrowUpRight, Settings, Database, Trash2, CheckCircle2, Loader2, Eye, X, ArrowUpCircle,
  Briefcase, ArrowUpDown, ArrowUp, ArrowDown, Edit3, Layers, Calendar, ArrowDownRight
} from 'lucide-react';

// Custom Tooltip for Cash Flow Chart
const CustomFlowTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl text-xs space-y-2 min-w-[230px]">
        <div className="font-bold text-white text-sm border-b border-slate-800 pb-1.5 flex justify-between items-center">
          <span>{label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] border ${data.statusColor}`}>
            {data.status}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span>Total Inflow:</span>
            <span>{currency} {data.inflow.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400 pl-2">
            <div>• Salaries: {currency} {data.salaryInflow.toLocaleString()}</div>
            <div>• Projects: +{currency} {data.projectInflow.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="flex justify-between text-rose-400 font-semibold">
            <span>Total Outflow:</span>
            <span>{currency} {data.outflow.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400 pl-2">
            <div>• Needs (50%): {currency} {data.needs.toLocaleString()}</div>
            <div>• Wants (30%): {currency} {data.wants.toLocaleString()}</div>
            {data.savingsSpend > 0 && <div>• Savings Logged: {currency} {data.savingsSpend.toLocaleString()}</div>}
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold">
          <span className="text-slate-300">Net Cash Flow:</span>
          <span className={data.netFlow >= 0 ? 'text-cyan-400' : 'text-rose-400'}>
            {data.netFlow >= 0 ? '+' : ''}{currency} {data.netFlow.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-slate-400 text-[11px]">
          <span>Savings Momentum:</span>
          <span className="text-white font-medium">{data.savingsRate}% of inflow</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  // Page Initial Loading State
  const [loading, setLoading] = useState(true);

  // Customizable Currency Symbol
  const [currency, setCurrency] = useState('Rs.');

  // API & Database Connection Health Check State
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    backend: 'checking',
    database: 'checking',
    message: 'Checking API status...'
  });

  // Toast Notifications
  const [notification, setNotification] = useState('');

  // Customizable Partner Profiles & Incomes
  const [partnerA, setPartnerA] = useState({ name: 'Dulanja', income: 450000, payDate: '25th of every month' });
  const [partnerB, setPartnerB] = useState({ name: 'Diyana', income: 350000, payDate: '28th of every month' });

  // Customizable Actual Expenses (Needs, Wants, Savings)
  const [actualSpend, setActualSpend] = useState({ needs: 320000, wants: 180000, savings: 150000 });

  // Interactive Bill Splitter State
  const [sampleBill, setSampleBill] = useState(100000);

  // Wealth Compound Future Projection Settings
  const [monthlyContribution, setMonthlyContribution] = useState(150000);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [startingSavings, setStartingSavings] = useState(1000000);

  // Editable Savings Goals List
  const [goals, setGoals] = useState([]);

  // Logged Daily Expenses History
  const [expenses, setExpenses] = useState([]);

  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'General', target: 500000, current: 0 });

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedDepositGoal, setSelectedDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState(50000);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 15000,
    paidBy: 'Dulanja',
    category: 'Needs',
    splitType: 'Proportional',
    date: new Date().toISOString().split('T')[0],
    expenseType: 'daily', // 'daily' or 'monthly'
    month: new Date().toISOString().slice(0, 7), // '2026-09'
    partnerMode: 'separate', // 'separate' or 'single'
    partnerAAmount: 20000,
    partnerBAmount: 15000,
  });

  const [selectedExpense, setSelectedExpense] = useState(null); // For View Expense Detail Modal

  // Additional Income Methods & Project Inflows
  const [incomeSources, setIncomeSources] = useState([
    {
      id: 'inc-1',
      title: 'Mobile App Development Client Project',
      amount: 120000,
      receivedBy: 'Dulanja',
      category: 'Project',
      recurrence: 'monthly',
      date: '2026-08-20'
    },
    {
      id: 'inc-2',
      title: 'Brand Identity & UI Kit Design',
      amount: 75000,
      receivedBy: 'Diyana',
      category: 'Freelance',
      recurrence: 'monthly',
      date: '2026-08-18'
    }
  ]);

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [newIncome, setNewIncome] = useState({
    title: '',
    amount: 75000,
    receivedBy: 'Dulanja',
    category: 'Project',
    recurrence: 'monthly',
    date: new Date().toISOString().split('T')[0]
  });

  // Monthly Cash Flow Engine State
  const [startTrackingMonth, setStartTrackingMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [flowSortBy, setFlowSortBy] = useState('date-desc');
  const [flowTimeRange, setFlowTimeRange] = useState('from_start'); // 'from_start', 'this_month', 'all_history'
  const [selectedMonthDetail, setSelectedMonthDetail] = useState(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Helper notification trigger
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Live API Connection & Persistent Data Fetching Effect
  useEffect(() => {
    let attempts = 0;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';

    const verifyAndFetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/health`);
        if (res.ok) {
          const data = await res.json();
          setApiStatus({
            checked: true,
            backend: 'connected',
            database: data.database === 'connected' ? 'connected' : 'disconnected',
            message: data.database === 'connected' ? 'Supabase DB Live' : 'Render Backend Live (DB pending)'
          });

          // Fetch Live Data from Supabase Backend
          try {
            const dashRes = await fetch(`${apiUrl}/dashboard`);
            if (dashRes.ok) {
              const dashData = await dashRes.json();
              if (dashData.success && dashData.data) {
                if (dashData.data.partnerA) setPartnerA(dashData.data.partnerA);
                if (dashData.data.partnerB) setPartnerB(dashData.data.partnerB);
                if (dashData.data.expenses) setExpenses(dashData.data.expenses);
                if (dashData.data.goals) setGoals(dashData.data.goals);
                if (dashData.data.incomeSources && dashData.data.incomeSources.length > 0) {
                  setIncomeSources(dashData.data.incomeSources);
                }
                
                if (dashData.data.settings) {
                  const s = dashData.data.settings;
                  if (s.currency) setCurrency(s.currency);
                  if (s.sampleBill !== undefined && s.sampleBill !== null) setSampleBill(s.sampleBill);
                  if (s.startingSavings !== undefined && s.startingSavings !== null) setStartingSavings(s.startingSavings);
                  if (s.monthlyContribution !== undefined && s.monthlyContribution !== null) setMonthlyContribution(s.monthlyContribution);
                  if (s.annualReturn !== undefined && s.annualReturn !== null) setAnnualReturn(s.annualReturn);
                  if (s.actualSpend) setActualSpend(s.actualSpend);
                }
              }
            }
          } catch (fetchErr) {
            console.log('Using default dashboard state:', fetchErr.message);
          } finally {
            setLoading(false);
          }

        } else {
          setApiStatus({ checked: true, backend: 'disconnected', database: 'disconnected', message: 'Backend Unreachable' });
          setLoading(false);
        }
      } catch (err) {
        if (attempts < 3) {
          attempts++;
          setApiStatus({ checked: false, backend: 'waking', database: 'checking', message: 'Waking Render Server...' });
          setTimeout(verifyAndFetchData, 4000);
        } else {
          setApiStatus({ checked: true, backend: 'disconnected', database: 'disconnected', message: 'Demo Mode (Client Only)' });
          setLoading(false);
        }
      }
    };

    verifyAndFetchData();
  }, []);

  // Sync Salary Changes to Supabase Backend DB
  const handleSaveSalaries = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/dashboard/salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerAName: partnerA.name,
          partnerAIncome: partnerA.income,
          partnerBName: partnerB.name,
          partnerBIncome: partnerB.income
        })
      });
    } catch (err) {
      console.log('Local salary state updated.');
    }
    showToast('Salaries saved to Supabase DB!');
  };

  // Sync Household Settings (Bill Splitter, Wealth Projection, Currency, Actual Spend) to DB
  const handleSaveSettings = async (customSettings = {}) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    const payload = {
      currency,
      sampleBill,
      startingSavings,
      monthlyContribution,
      annualReturn,
      actualSpend,
      ...customSettings
    };
    try {
      await fetch(`${apiUrl}/dashboard/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log('Settings saved locally.');
    }
    showToast('Settings saved to Supabase DB!');
  };

  // Income Methods & Project Inflows CRUD Handlers
  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!newIncome.title || !newIncome.amount) return;
    const amt = Number(newIncome.amount);
    const item = {
      id: Date.now().toString(),
      title: newIncome.title,
      amount: amt,
      receivedBy: newIncome.receivedBy || partnerA.name,
      category: newIncome.category || 'Project',
      recurrence: newIncome.recurrence || 'monthly',
      date: newIncome.date || new Date().toISOString().split('T')[0]
    };

    setIncomeSources(prev => [item, ...prev]);

    // Persist to Supabase Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      const res = await fetch(`${apiUrl}/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.income) {
          setIncomeSources(prev => [data.income, ...prev.filter(i => i.id !== item.id)]);
        }
      }
    } catch (err) {
      console.log('Income added locally.');
    }

    setNewIncome({
      title: '',
      amount: 75000,
      receivedBy: partnerA.name,
      category: 'Project',
      recurrence: 'monthly',
      date: new Date().toISOString().split('T')[0]
    });
    setShowIncomeModal(false);
    showToast('New income method added!');
  };

  const handleUpdateIncome = async (id, updatedFields) => {
    setIncomeSources(prev => prev.map(inc => String(inc.id) === String(id) ? { ...inc, ...updatedFields } : inc));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/income/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.log('Income updated locally.');
    }
    showToast('Income method updated!');
  };

  const handleDeleteIncome = async (id) => {
    setIncomeSources(prev => prev.filter(inc => String(inc.id) !== String(id)));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/income/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('Income deleted locally.');
    }
    showToast('Income method removed!');
  };

  // Calculated Combined Financial Metrics (Salaries + Project Inflows)
  const baseSalaryA = Number(partnerA.income);
  const baseSalaryB = Number(partnerB.income);
  const totalBaseSalaries = baseSalaryA + baseSalaryB;

  const totalProjectIncome = incomeSources.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const partnerAProjectIncome = incomeSources.filter(inc => inc.receivedBy === partnerA.name).reduce((sum, inc) => sum + Number(inc.amount), 0);
  const partnerBProjectIncome = incomeSources.filter(inc => inc.receivedBy === partnerB.name).reduce((sum, inc) => sum + Number(inc.amount), 0);
  const jointProjectIncome = incomeSources.filter(inc => inc.receivedBy === 'Joint').reduce((sum, inc) => sum + Number(inc.amount), 0);

  const totalPartnerAIncome = baseSalaryA + partnerAProjectIncome + (jointProjectIncome / 2);
  const totalPartnerBIncome = baseSalaryB + partnerBProjectIncome + (jointProjectIncome / 2);
  const combinedIncome = totalPartnerAIncome + totalPartnerBIncome;

  const partnerASharePercent = combinedIncome > 0 ? ((totalPartnerAIncome / combinedIncome) * 100).toFixed(1) : 50;
  const partnerBSharePercent = combinedIncome > 0 ? ((totalPartnerBIncome / combinedIncome) * 100).toFixed(1) : 50;

  const baseShareAPercent = totalBaseSalaries > 0 ? ((baseSalaryA / totalBaseSalaries) * 100).toFixed(1) : 50;
  const baseShareBPercent = totalBaseSalaries > 0 ? ((baseSalaryB / totalBaseSalaries) * 100).toFixed(1) : 50;

  // 50/30/20 Rule Target Benchmarks (calculated on full combined income)
  const needsTarget = combinedIncome * 0.50;
  const wantsTarget = combinedIncome * 0.30;
  const savingsTarget = combinedIncome * 0.20;

  const totalExpenses = Number(actualSpend.needs) + Number(actualSpend.wants);
  const remainingCashflow = combinedIncome - totalExpenses;

  // Pie Chart Data (50/30/20 Breakdown)
  const pieData = [
    { name: 'Needs (50%)', value: Number(actualSpend.needs), color: '#3b82f6' },
    { name: 'Wants (30%)', value: Number(actualSpend.wants), color: '#ec4899' },
    { name: 'Savings/Growth (20%)', value: Number(actualSpend.savings), color: '#10b981' },
  ];

  // Compound Growth Projection Calculator (1, 5, 10 Years)
  const generateProjectionData = () => {
    const data = [];
    let cumulative = Number(startingSavings);
    const monthlyRate = Number(annualReturn) / 100 / 12;

    for (let month = 0; month <= 120; month += 12) {
      const year = month / 12;
      data.push({
        year: `Yr ${year}`,
        projectedWorth: Math.round(cumulative)
      });
      for (let m = 0; m < 12; m++) {
        cumulative = (cumulative + Number(monthlyContribution)) * (1 + monthlyRate);
      }
    }
    return data;
  };

  const projectionData = generateProjectionData();

  // Monthly Cash Flow Engine Data Aggregation ("How Everything Flows")
  const getMonthlyFlowData = () => {
    const monthKeysSet = new Set();
    const today = new Date();
    const activeCurrentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Always include current month
    monthKeysSet.add(activeCurrentMonth);

    // Only include other months from expenses if they have actual logged data
    expenses.forEach(exp => {
      if (exp.date) {
        const mKey = exp.date.substring(0, 7);
        if (flowTimeRange === 'all_history' || mKey >= startTrackingMonth) {
          monthKeysSet.add(mKey);
        }
      }
    });

    // Only include other months from income sources if they have actual dated data
    incomeSources.forEach(inc => {
      if (inc.date) {
        const mKey = inc.date.substring(0, 7);
        if (flowTimeRange === 'all_history' || mKey >= startTrackingMonth) {
          monthKeysSet.add(mKey);
        }
      }
    });

    let monthKeys = Array.from(monthKeysSet);
    if (flowTimeRange === 'this_month') {
      monthKeys = [activeCurrentMonth];
    } else if (flowTimeRange !== 'all_history') {
      monthKeys = monthKeys.filter(m => m >= startTrackingMonth);
    }
    monthKeys.sort();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return monthKeys.map(mKey => {
      const [yearStr, monthStr] = mKey.split('-');
      const year = parseInt(yearStr, 10);
      const monthIdx = parseInt(monthStr, 10) - 1;
      const monthLabel = `${monthNames[monthIdx]} ${year}`;

      // Inflow: Base salaries
      const salaryInflow = totalBaseSalaries;

      // Project Inflows: monthly recurring + one-time in this specific month
      const relevantIncomeSources = incomeSources.filter(inc => {
        if (inc.recurrence === 'monthly') return true;
        return inc.date && inc.date.startsWith(mKey);
      });
      const projectInflow = relevantIncomeSources.reduce((sum, inc) => sum + Number(inc.amount), 0);
      const totalInflow = salaryInflow + projectInflow;

      // Outflow: Expenses logged for this month
      const monthExpenses = expenses.filter(exp => exp.date && exp.date.startsWith(mKey));
      const needs = monthExpenses.filter(e => e.category === 'Needs').reduce((sum, e) => sum + Number(e.amount), 0);
      const wants = monthExpenses.filter(e => e.category === 'Wants').reduce((sum, e) => sum + Number(e.amount), 0);
      const savingsSpend = monthExpenses.filter(e => e.category === 'Savings').reduce((sum, e) => sum + Number(e.amount), 0);
      
      const totalOutflow = needs + wants + savingsSpend;
      const netFlow = totalInflow - totalOutflow;
      const savingsRate = totalInflow > 0 ? Math.round((netFlow / totalInflow) * 100) : 0;

      let status = 'Optimal Surplus';
      let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      if (netFlow < 0) {
        status = 'Deficit Warning';
        statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      } else if (savingsRate >= 30) {
        status = 'High Growth (30%+)';
        statusColor = 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      } else if (savingsRate >= 20) {
        status = 'Optimal Surplus (20%)';
        statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      } else if (netFlow > 0) {
        status = 'Positive Flow';
        statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      } else {
        status = 'Break Even';
        statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      }

      return {
        monthKey: mKey,
        monthLabel,
        year,
        monthIdx,
        salaryInflow,
        projectInflow,
        inflow: totalInflow,
        needs,
        wants,
        savingsSpend,
        outflow: totalOutflow,
        netFlow,
        savingsRate,
        status,
        statusColor,
        expensesCount: monthExpenses.length,
        monthExpenses,
        relevantIncomeSources
      };
    });
  };

  const rawMonthlyFlow = getMonthlyFlowData();

  // Clear Past Months Data & Start Fresh from Current Month
  const handleClearPastData = async () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const cutoffDate = `${currentMonth}-01`;

    // 1. Update local state
    setStartTrackingMonth(currentMonth);
    setFlowTimeRange('from_start');

    // Remove any expenses logged before this month
    setExpenses(prev => prev.filter(e => !e.date || e.date >= cutoffDate));

    // Remove any one-time income sources logged before this month
    setIncomeSources(prev => prev.filter(i => i.recurrence === 'monthly' || !i.date || i.date >= cutoffDate));

    // Reset actual spend to 0 for a fresh month
    setActualSpend({ needs: 0, wants: 0, savings: 0 });
    handleSaveSettings({ 
      actualSpend: { needs: 0, wants: 0, savings: 0 }
    });

    // 2. Call backend clean-past-months endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/dashboard/clean-past-months`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMonth: currentMonth })
      });
    } catch (err) {
      console.log('Past data cleared locally.');
    }

    setShowClearConfirmModal(false);
    showToast('Reset complete! Started fresh from this month.');
  };

  // Sort Monthly Flow by flowSortBy
  const sortedMonthlyData = [...rawMonthlyFlow].sort((a, b) => {
    switch (flowSortBy) {
      case 'date-desc':
        return b.monthKey.localeCompare(a.monthKey);
      case 'date-asc':
        return a.monthKey.localeCompare(b.monthKey);
      case 'inflow-desc':
        return b.inflow - a.inflow;
      case 'inflow-asc':
        return a.inflow - b.inflow;
      case 'outflow-desc':
        return b.outflow - a.outflow;
      case 'outflow-asc':
        return a.outflow - b.outflow;
      case 'net-desc':
        return b.netFlow - a.netFlow;
      case 'net-asc':
        return a.netFlow - b.netFlow;
      case 'rate-desc':
        return b.savingsRate - a.savingsRate;
      case 'rate-asc':
        return a.savingsRate - b.savingsRate;
      default:
        return b.monthKey.localeCompare(a.monthKey);
    }
  });

  const avgInflow = sortedMonthlyData.length > 0 ? Math.round(sortedMonthlyData.reduce((s, m) => s + m.inflow, 0) / sortedMonthlyData.length) : 0;
  const avgOutflow = sortedMonthlyData.length > 0 ? Math.round(sortedMonthlyData.reduce((s, m) => s + m.outflow, 0) / sortedMonthlyData.length) : 0;
  const avgNetFlow = sortedMonthlyData.length > 0 ? Math.round(sortedMonthlyData.reduce((s, m) => s + m.netFlow, 0) / sortedMonthlyData.length) : 0;
  const avgSavingsRate = avgInflow > 0 ? Math.round((avgNetFlow / avgInflow) * 100) : 0;

  // Handle Savings Goal Add / Update / Deposit / Delete
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title) return;
    const tempGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      category: newGoal.category,
      current: Number(newGoal.current),
      target: Number(newGoal.target),
      color: 'bg-emerald-500'
    };
    setGoals(prev => [...prev, tempGoal]);
    setNewGoal({ title: '', category: 'General', target: 500000, current: 0 });
    setShowGoalModal(false);

    // Save to Supabase Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      const res = await fetch(`${apiUrl}/dashboard/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempGoal)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.goal) {
          setGoals(prev => prev.map(g => g.id === tempGoal.id ? data.goal : g));
        }
      }
    } catch (err) {
      console.log('Goal saved locally.');
    }
    showToast('Savings goal saved to Supabase!');
  };

  const handleUpdateGoal = async (id, fields) => {
    setGoals(prev => prev.map(g => String(g.id) === String(id) ? { ...g, ...fields } : g));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/dashboard/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
    } catch (err) {
      console.log('Goal updated locally.');
    }
  };

  const handleDepositToGoal = (e) => {
    e.preventDefault();
    if (!selectedDepositGoal || !depositAmount) return;
    const newCurrent = Number(selectedDepositGoal.current) + Number(depositAmount);
    handleUpdateGoal(selectedDepositGoal.id, { current: newCurrent });
    setShowDepositModal(false);
    showToast(`Added ${currency} ${Number(depositAmount).toLocaleString()} to ${selectedDepositGoal.title}!`);
  };

  const handleDeleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => String(g.id) !== String(id)));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/dashboard/goals/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('Goal deleted locally.');
    }
    showToast('Savings goal deleted!');
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    let itemsToAdd = [];

    if (newExpense.expenseType === 'monthly') {
      const selectedMonth = newExpense.month || new Date().toISOString().slice(0, 7);
      const monthDate = `${selectedMonth}-01`;

      if (newExpense.partnerMode === 'separate') {
        const amtA = Number(newExpense.partnerAAmount || 0);
        const amtB = Number(newExpense.partnerBAmount || 0);
        if (amtA <= 0 && amtB <= 0) return;

        if (amtA > 0) {
          itemsToAdd.push({
            id: Date.now().toString() + '-1',
            title: `${newExpense.title} (${partnerA.name}) [Monthly]`,
            amount: amtA,
            paidBy: partnerA.name,
            category: newExpense.category,
            splitType: 'Individual',
            date: monthDate,
            isMonthly: true,
            monthPeriod: selectedMonth
          });
        }

        if (amtB > 0) {
          itemsToAdd.push({
            id: (Date.now() + 1).toString() + '-2',
            title: `${newExpense.title} (${partnerB.name}) [Monthly]`,
            amount: amtB,
            paidBy: partnerB.name,
            category: newExpense.category,
            splitType: 'Individual',
            date: monthDate,
            isMonthly: true,
            monthPeriod: selectedMonth
          });
        }
      } else {
        const amt = Number(newExpense.amount);
        if (amt <= 0) return;
        itemsToAdd.push({
          id: Date.now().toString(),
          title: `${newExpense.title} [Monthly]`,
          amount: amt,
          paidBy: newExpense.paidBy,
          category: newExpense.category,
          splitType: newExpense.splitType || 'Proportional',
          date: monthDate,
          isMonthly: true,
          monthPeriod: selectedMonth
        });
      }
    } else {
      // Daily / Single Transaction
      if (!newExpense.title || !newExpense.amount) return;
      const amt = Number(newExpense.amount);
      if (amt <= 0) return;
      itemsToAdd.push({
        id: Date.now().toString(),
        title: newExpense.title,
        amount: amt,
        paidBy: newExpense.paidBy,
        category: newExpense.category,
        splitType: newExpense.splitType || 'Proportional',
        date: newExpense.date || new Date().toISOString().split('T')[0],
        isMonthly: false
      });
    }

    if (itemsToAdd.length === 0) return;

    // Optimistically update local expenses state
    setExpenses(prev => [...itemsToAdd, ...prev]);

    // Update actual spend
    let updatedSpend = { ...actualSpend };
    itemsToAdd.forEach(item => {
      if (item.category === 'Needs') updatedSpend.needs += item.amount;
      if (item.category === 'Wants') updatedSpend.wants += item.amount;
      if (item.category === 'Savings') updatedSpend.savings += item.amount;
    });
    setActualSpend(updatedSpend);
    handleSaveSettings({ actualSpend: updatedSpend });

    // Persist to Supabase Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      const res = await fetch(`${apiUrl}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.expenses && data.expenses.length > 0) {
          const idsAdded = new Set(itemsToAdd.map(i => i.id));
          setExpenses(prev => [...data.expenses, ...prev.filter(i => !idsAdded.has(i.id))]);
        }
      }
    } catch (err) {
      console.log('Expense added locally.');
    }

    setNewExpense({
      title: '',
      amount: 15000,
      paidBy: partnerA.name,
      category: 'Needs',
      splitType: 'Proportional',
      date: new Date().toISOString().split('T')[0],
      expenseType: 'daily',
      month: new Date().toISOString().slice(0, 7),
      partnerMode: 'separate',
      partnerAAmount: 20000,
      partnerBAmount: 15000,
    });
    setShowExpenseModal(false);
    showToast(itemsToAdd.length > 1 ? 'Separate monthly expenses logged!' : 'Expense logged & saved!');
  };

  const handleDeleteExpense = async (id) => {
    const item = expenses.find(e => String(e.id) === String(id));
    if (item) {
      let updatedSpend = { ...actualSpend };
      if (item.category === 'Needs') updatedSpend.needs = Math.max(0, updatedSpend.needs - item.amount);
      if (item.category === 'Wants') updatedSpend.wants = Math.max(0, updatedSpend.wants - item.amount);
      if (item.category === 'Savings') updatedSpend.savings = Math.max(0, updatedSpend.savings - item.amount);
      setActualSpend(updatedSpend);
      handleSaveSettings({ actualSpend: updatedSpend });
    }

    setExpenses(prev => prev.filter(e => String(e.id) !== String(id)));

    // Delete from Supabase Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      await fetch(`${apiUrl}/expenses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('Expense deleted locally.');
    }

    showToast('Expense deleted!');
  };

  // Full Screen Skeleton Loader to prevent initial hardcoded values flash
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <h2 className="text-xl font-bold text-white tracking-tight">Loading Dulanja & Diyana's Financial Data...</h2>
          <p className="text-slate-400 text-xs">Connecting securely to Supabase PostgreSQL database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" /> {notification}
        </div>
      )}

      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs tracking-wide uppercase">
              <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" /> Couples Financial Harmony
            </span>

            {/* Live Backend & DB Connection Badge */}
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${
              apiStatus.database === 'connected' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : apiStatus.backend === 'connected'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : apiStatus.backend === 'waking'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {apiStatus.backend === 'waking' ? <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> : <Database className="w-3 h-3" />}
              {apiStatus.message}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
            {partnerA.name} & {partnerB.name}'s Wealth Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track combined salary streams, log daily expenses, split shared bills, and build wealth together.
          </p>
        </div>

        {/* Currency & Action Controllers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Settings className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span className="mr-2">Currency:</span>
            <input 
              type="text" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              onBlur={() => handleSaveSettings({ currency })}
              className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-emerald-400 font-bold text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            onClick={() => {
              setEditingIncome(null);
              setNewIncome({
                title: '',
                amount: 75000,
                receivedBy: partnerA.name,
                category: 'Project',
                recurrence: 'monthly',
                date: new Date().toISOString().split('T')[0]
              });
              setShowIncomeModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-700 transition"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" /> Add Income / Project
          </button>

          <button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Add Expense
          </button>

          <button 
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-emerald-900/30 transition"
          >
            <PlusCircle className="w-4 h-4" /> Add Goal
          </button>
        </div>
      </header>

      {/* Top Summary Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Combined Income */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Combined Monthly Income</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {currency} {combinedIncome.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">{partnerASharePercent}% {partnerA.name}</span>
            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-medium">{partnerBSharePercent}% {partnerB.name}</span>
            {totalProjectIncome > 0 && (
              <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-medium">+{currency} {(totalProjectIncome / 1000).toFixed(0)}k projects</span>
            )}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Monthly Expenses</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {currency} {totalExpenses.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Needs ({currency} {Number(actualSpend.needs).toLocaleString()}) + Wants ({currency} {Number(actualSpend.wants).toLocaleString()})
          </div>
        </div>

        {/* Monthly Surplus */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Net Monthly Surplus</span>
            <PiggyBank className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {currency} {remainingCashflow.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <div className="mt-3 text-xs text-emerald-400/80 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Ready for savings & goals
          </div>
        </div>

        {/* Fair Share Split Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Income Proportional Split</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white mt-2">
            {partnerASharePercent}% : {partnerBSharePercent}%
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Includes salaries + {incomeSources.length} project streams
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Analysis ("How Everything Flows") */}
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Monthly Flow Analysis
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              How Everything Flows: Cash Flow & Trends
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualize monthly inflows (salaries + projects) vs outflows (expenses) and track household net savings momentum.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Range Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setFlowTimeRange('from_start')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${flowTimeRange === 'from_start' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                From This Month
              </button>
              <button
                onClick={() => setFlowTimeRange('this_month')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${flowTimeRange === 'this_month' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                This Month Only
              </button>
              <button
                onClick={() => setFlowTimeRange('all_history')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${flowTimeRange === 'all_history' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All History
              </button>
            </div>

            {/* Quick Reset to Current Month Button */}
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
              title="Remove past months test data and start fresh from this month"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clean Past Data
            </button>

            {/* Sorting Method Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 hidden sm:inline">Sort by:</span>
              <select
                value={flowSortBy}
                onChange={(e) => setFlowSortBy(e.target.value)}
                className="bg-transparent text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-slate-900 text-white">Month (Newest First)</option>
                <option value="date-asc" className="bg-slate-900 text-white">Month (Oldest First)</option>
                <option value="net-desc" className="bg-slate-900 text-white">Highest Net Cash Flow (Surplus)</option>
                <option value="net-asc" className="bg-slate-900 text-white">Lowest Net Cash Flow</option>
                <option value="inflow-desc" className="bg-slate-900 text-white">Highest Inflow (Income)</option>
                <option value="inflow-asc" className="bg-slate-900 text-white">Lowest Inflow</option>
                <option value="outflow-desc" className="bg-slate-900 text-white">Highest Outflow (Expenses)</option>
                <option value="outflow-asc" className="bg-slate-900 text-white">Lowest Outflow</option>
                <option value="rate-desc" className="bg-slate-900 text-white">Highest Savings Rate (%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3 Metric Overview Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block font-medium">Average Monthly Inflow</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {currency} {avgInflow.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Includes salaries & active projects</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block font-medium">Average Monthly Outflow</span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {currency} {avgOutflow.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Needs & wants expenditures</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block font-medium">Average Monthly Net Flow</span>
            <div className={`text-xl font-bold mt-1 ${avgNetFlow >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {avgNetFlow >= 0 ? '+' : ''}{currency} {avgNetFlow.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1.5">({avgSavingsRate}% saved)</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Available for goals & compounding</span>
          </div>
        </div>

        {/* The Flow Chart */}
        <div className="h-72 sm:h-80 w-full mb-8 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sortedMonthlyData} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="monthLabel" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} formatter={(val) => `${currency} ${(val / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomFlowTooltip currency={currency} />} />
              <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
              <Bar dataKey="inflow" name="Total Inflow (Income)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="outflow" name="Total Outflow (Expenses)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="netFlow" name="Net Cash Flow" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* The Flow Table Below the Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" /> Monthly Cash Flow Ledger
              </h3>
              <p className="text-xs text-slate-400">Detailed month-by-month cash flow breakdown. Click column headers to toggle sorting.</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Showing {sortedMonthlyData.length} month(s) • Tracking from <strong className="text-emerald-400">{startTrackingMonth}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider select-none">
                  <th 
                    onClick={() => setFlowSortBy(flowSortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                    className="pb-3 px-3 cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Month</span>
                      {flowSortBy === 'date-desc' && <ArrowDown className="w-3 h-3 text-emerald-400" />}
                      {flowSortBy === 'date-asc' && <ArrowUp className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setFlowSortBy(flowSortBy === 'inflow-desc' ? 'inflow-asc' : 'inflow-desc')}
                    className="pb-3 px-3 cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Total Inflow</span>
                      {flowSortBy === 'inflow-desc' && <ArrowDown className="w-3 h-3 text-emerald-400" />}
                      {flowSortBy === 'inflow-asc' && <ArrowUp className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setFlowSortBy(flowSortBy === 'outflow-desc' ? 'outflow-asc' : 'outflow-desc')}
                    className="pb-3 px-3 cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Total Outflow</span>
                      {flowSortBy === 'outflow-desc' && <ArrowDown className="w-3 h-3 text-rose-400" />}
                      {flowSortBy === 'outflow-asc' && <ArrowUp className="w-3 h-3 text-rose-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setFlowSortBy(flowSortBy === 'net-desc' ? 'net-asc' : 'net-desc')}
                    className="pb-3 px-3 cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Net Cash Flow</span>
                      {flowSortBy === 'net-desc' && <ArrowDown className="w-3 h-3 text-cyan-400" />}
                      {flowSortBy === 'net-asc' && <ArrowUp className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setFlowSortBy(flowSortBy === 'rate-desc' ? 'rate-asc' : 'rate-desc')}
                    className="pb-3 px-3 cursor-pointer hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Savings Rate</span>
                      {flowSortBy === 'rate-desc' && <ArrowDown className="w-3 h-3 text-emerald-400" />}
                      {flowSortBy === 'rate-asc' && <ArrowUp className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </th>
                  <th className="pb-3 px-3">Flow Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedMonthlyData.map((row) => (
                  <tr key={row.monthKey} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white text-xs">{row.monthLabel}</div>
                      <span className="text-[10px] text-slate-500">{row.monthKey}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-emerald-400 text-xs">
                        {currency} {row.inflow.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Salaries: {currency} {row.salaryInflow.toLocaleString()} | Projects: +{currency} {row.projectInflow.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-rose-400 text-xs">
                        {currency} {row.outflow.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Needs: {currency} {row.needs.toLocaleString()} | Wants: {currency} {row.wants.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs inline-flex items-center gap-1 ${
                        row.netFlow >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {row.netFlow >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {row.netFlow >= 0 ? '+' : ''}{currency} {row.netFlow.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${row.savingsRate >= 20 ? 'bg-emerald-500' : row.savingsRate > 0 ? 'bg-blue-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.max(0, Math.min(row.savingsRate, 100))}%` }}
                          />
                        </div>
                        <span className="font-semibold text-white text-xs">{row.savingsRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMonthDetail(row)}
                        className="text-slate-400 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Salary & Partner Input Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> Income & Salary Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Edit monthly income for {partnerA.name} and {partnerB.name}.</p>
              </div>

              <button 
                onClick={handleSaveSalaries}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save Salaries
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partner A (Dulanja) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <input 
                    type="text"
                    value={partnerA.name}
                    onChange={(e) => setPartnerA({ ...partnerA, name: e.target.value })}
                    className="bg-transparent border-b border-emerald-500/50 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-400"
                  />
                  <input 
                    type="text"
                    value={partnerA.payDate}
                    onChange={(e) => setPartnerA({ ...partnerA, payDate: e.target.value })}
                    className="bg-transparent text-right text-xs text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">{currency}</span>
                  <input 
                    type="number" 
                    value={partnerA.income}
                    onChange={(e) => setPartnerA({ ...partnerA, income: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Contributes <strong className="text-emerald-400">{partnerASharePercent}%</strong> to household income pool
                </div>
              </div>

              {/* Partner B (Diyana) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <input 
                    type="text"
                    value={partnerB.name}
                    onChange={(e) => setPartnerB({ ...partnerB, name: e.target.value })}
                    className="bg-transparent border-b border-indigo-500/50 text-indigo-400 font-bold text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <input 
                    type="text"
                    value={partnerB.payDate}
                    onChange={(e) => setPartnerB({ ...partnerB, payDate: e.target.value })}
                    className="bg-transparent text-right text-xs text-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">{currency}</span>
                  <input 
                    type="number" 
                    value={partnerB.income}
                    onChange={(e) => setPartnerB({ ...partnerB, income: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Contributes <strong className="text-indigo-400">{partnerBSharePercent}%</strong> to household income pool
                </div>
              </div>
            </div>

            {/* Project Earnings & Extra Income Methods Sub-Section */}
            <div className="pt-5 mt-5 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> Project Earnings & Income Methods
                  </h3>
                  <p className="text-[11px] text-slate-400">Track client projects, freelancing, and secondary revenue streams.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingIncome(null);
                    setNewIncome({
                      title: '',
                      amount: 75000,
                      receivedBy: partnerA.name,
                      category: 'Project',
                      recurrence: 'monthly',
                      date: new Date().toISOString().split('T')[0]
                    });
                    setShowIncomeModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> + Add Income Method
                </button>
              </div>

              {/* Project Income Summary Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                  Base Salaries: <strong className="text-white">{currency} {totalBaseSalaries.toLocaleString()}</strong>
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg">
                  Projects / Extra: <strong className="text-emerald-300">+{currency} {totalProjectIncome.toLocaleString()}</strong> ({incomeSources.length} streams)
                </span>
                <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2.5 py-1 rounded-lg">
                  Total Monthly Inflow: <strong className="text-white">{currency} {combinedIncome.toLocaleString()}</strong>
                </span>
              </div>

              {/* List of Income Streams */}
              <div className="space-y-2.5">
                {incomeSources.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-5 italic bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                    No extra income methods or projects logged yet. Click "+ Add Income Method" to add freelance, client projects, or side income!
                  </div>
                ) : (
                  incomeSources.map((inc) => (
                    <div key={inc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white text-xs">{inc.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            inc.category === 'Project' ? 'bg-blue-500/10 text-blue-400' :
                            inc.category === 'Freelance' ? 'bg-purple-500/10 text-purple-400' :
                            inc.category === 'Side Business' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {inc.category}
                          </span>
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded">
                            {inc.recurrence === 'monthly' ? 'Monthly' : 'One-time'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Earned by: <strong className={inc.receivedBy === partnerA.name ? 'text-emerald-400' : inc.receivedBy === partnerB.name ? 'text-indigo-400' : 'text-teal-400'}>{inc.receivedBy}</strong></span>
                          {inc.date && <span>• Date: {inc.date}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
                          <span className="text-slate-500 font-bold text-xs">{currency}</span>
                          <input
                            type="number"
                            value={inc.amount}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setIncomeSources(prev => prev.map(item => item.id === inc.id ? { ...item, amount: val } : item));
                            }}
                            onBlur={(e) => handleUpdateIncome(inc.id, { amount: Number(e.target.value) })}
                            className="w-24 bg-transparent text-emerald-400 font-bold text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => {
                            setEditingIncome(inc);
                            setNewIncome({
                              title: inc.title,
                              amount: inc.amount,
                              receivedBy: inc.receivedBy,
                              category: inc.category,
                              recurrence: inc.recurrence,
                              date: inc.date || new Date().toISOString().split('T')[0]
                            });
                            setShowIncomeModal(true);
                          }}
                          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                          title="Edit Method"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                          title="Delete Method"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Daily Logged Expenses Feed Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-400" /> Recent Logged Expenses
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Daily expense entries with partner split calculations.</p>
              </div>

              <button 
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              >
                + Log Expense
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Description</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Paid By</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-500 italic">No logged expenses found. Click "+ Log Expense" to add one!</td>
                    </tr>
                  ) : (
                    expenses.map((exp) => {
                      const isMonthly = exp.isMonthly || (typeof exp.title === 'string' && exp.title.includes('[Monthly]'));
                      const displayTitle = typeof exp.title === 'string' ? exp.title.replace(/\s*\[Monthly\]/, '') : exp.title;
                      return (
                        <tr key={exp.id} className="hover:bg-slate-950/40 transition">
                          <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{exp.date}</td>
                          <td className="py-3 px-2 font-semibold text-white">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{displayTitle}</span>
                              {isMonthly && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  Monthly
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              exp.category === 'Needs' ? 'bg-blue-500/10 text-blue-400' :
                              exp.category === 'Wants' ? 'bg-pink-500/10 text-pink-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              exp.paidBy === partnerA.name ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {exp.paidBy}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-bold text-white whitespace-nowrap">
                            {currency} {Number(exp.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedExpense(exp)}
                              className="text-slate-400 hover:text-emerald-400 transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-500 hover:text-rose-400 transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Tracking (50/30/20 Rule) Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Expense Budget Allocation (50/30/20 Rule)
              </h2>
              <button 
                onClick={() => handleSaveSettings({ actualSpend })}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-xl font-medium border border-slate-700 transition"
              >
                Save Spend Settings
              </button>
            </div>
            <p className="text-slate-400 text-xs mb-6">
              Adjust actual logged monthly spending to benchmark against Needs (50%), Wants (30%), and Savings (20%).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(value) => [`${currency} ${Number(value).toLocaleString()}`, 'Logged Spend']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Editable Spend Controls & Progress Bars */}
              <div className="space-y-4">
                {/* Needs */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-400">Needs Target: {currency} {needsTarget.toLocaleString()} (50%)</span>
                  </div>
                  <div className="flex items-center gap-2 my-1">
                    <span className="text-xs text-slate-400">Actual Spent:</span>
                    <input 
                      type="number" 
                      value={actualSpend.needs}
                      onChange={(e) => setActualSpend({ ...actualSpend, needs: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((actualSpend.needs / needsTarget) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Wants */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-pink-400">Wants Target: {currency} {wantsTarget.toLocaleString()} (30%)</span>
                  </div>
                  <div className="flex items-center gap-2 my-1">
                    <span className="text-xs text-slate-400">Actual Spent:</span>
                    <input 
                      type="number" 
                      value={actualSpend.wants}
                      onChange={(e) => setActualSpend({ ...actualSpend, wants: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-pink-500 w-full"
                    />
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.min((actualSpend.wants / wantsTarget) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Savings */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400">Savings Target: {currency} {savingsTarget.toLocaleString()} (20%)</span>
                  </div>
                  <div className="flex items-center gap-2 my-1">
                    <span className="text-xs text-slate-400">Actual Saved:</span>
                    <input 
                      type="number" 
                      value={actualSpend.savings}
                      onChange={(e) => setActualSpend({ ...actualSpend, savings: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 w-full"
                    />
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((actualSpend.savings / savingsTarget) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future Growth Compound Projection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Wealth Projection (1, 5 & 10 Years)
                </h2>
                <p className="text-slate-400 text-xs mt-1">Compound interest growth simulator based on your joint contributions.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSaveSettings({ startingSavings, monthlyContribution, annualReturn })}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Projection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 mb-6">
              <div className="text-xs">
                <span className="text-slate-400 block mb-1">Initial Savings</span>
                <input 
                  type="number" 
                  value={startingSavings} 
                  onChange={(e) => setStartingSavings(Number(e.target.value))}
                  onBlur={() => handleSaveSettings({ startingSavings })}
                  className="w-full bg-slate-900 text-emerald-400 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-slate-700"
                />
              </div>
              <div className="text-xs">
                <span className="text-slate-400 block mb-1">Monthly Contribution</span>
                <input 
                  type="number" 
                  value={monthlyContribution} 
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  onBlur={() => handleSaveSettings({ monthlyContribution })}
                  className="w-full bg-slate-900 text-emerald-400 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-slate-700"
                />
              </div>
              <div className="text-xs">
                <span className="text-slate-400 block mb-1">Return % / yr</span>
                <input 
                  type="number" 
                  value={annualReturn} 
                  onChange={(e) => setAnnualReturn(Number(e.target.value))}
                  onBlur={() => handleSaveSettings({ annualReturn })}
                  className="w-full bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs border border-slate-700"
                />
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" formatter={(val) => `${currency} ${(val / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} formatter={(val) => [`${currency} ${Number(val).toLocaleString()}`, 'Projected Net Worth']} />
                  <Area type="monotone" dataKey="projectedWorth" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Proportional Bill Splitter & Shared Goals */}
        <div className="space-y-8">

          {/* Interactive Proportional Bill Splitter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" /> Proportional Bill Splitter
              </h2>
              <button 
                onClick={() => handleSaveSettings({ sampleBill })}
                className="text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1 rounded-xl font-semibold transition"
              >
                Save Split
              </button>
            </div>

            <p className="text-slate-400 text-xs mb-4">
              Enter any bill to split proportionally based on {partnerA.name} ({partnerASharePercent}%) and {partnerB.name} ({partnerBSharePercent}%).
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <label className="text-xs text-slate-400 font-semibold block mb-1">Enter Shared Bill Amount ({currency})</label>
              <input 
                type="number"
                value={sampleBill}
                onChange={(e) => setSampleBill(Number(e.target.value))}
                onBlur={() => handleSaveSettings({ sampleBill })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl flex justify-between items-center border-l-4 border-emerald-500">
                <div>
                  <span className="text-xs text-slate-400 block">{partnerA.name}'s Fair Share ({partnerASharePercent}%)</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {currency} {((sampleBill * partnerASharePercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Proportional</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl flex justify-between items-center border-l-4 border-indigo-500">
                <div>
                  <span className="text-xs text-slate-400 block">{partnerB.name}'s Fair Share ({partnerBSharePercent}%)</span>
                  <span className="text-lg font-bold text-indigo-400">
                    {currency} {((sampleBill * partnerBSharePercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">Proportional</span>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                (Standard 50/50 equal split: {currency} {(sampleBill / 2).toLocaleString()} each)
              </div>
            </div>
          </div>

          {/* Savings Milestone Trackers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Shared Savings Goals
              </h2>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                + Add Goal
              </button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-4 italic">No savings goals created yet. Click "+ Add Goal" to add your first milestone!</div>
              ) : (
                goals.map((goal) => {
                  const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                  return (
                    <div key={goal.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{goal.title}</h4>
                          <span className="text-xs text-slate-400">{goal.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedDepositGoal(goal);
                              setShowDepositModal(true);
                            }}
                            className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-semibold transition"
                            title="Add Deposit / Extra Savings"
                          >
                            <ArrowUpCircle className="w-3 h-3" /> + Deposit
                          </button>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {percent}%
                          </span>
                          <button 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full bg-slate-800 rounded-full h-2 my-2">
                        <div className={`${goal.color || 'bg-emerald-500'} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 font-medium">Saved:</span>
                          <input 
                            type="number"
                            value={goal.current}
                            onChange={(e) => setGoals(goals.map(g => g.id === goal.id ? { ...g, current: Number(e.target.value) } : g))}
                            onBlur={(e) => handleUpdateGoal(goal.id, { current: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 font-medium">Target:</span>
                          <input 
                            type="number"
                            value={goal.target}
                            onChange={(e) => setGoals(goals.map(g => g.id === goal.id ? { ...g, target: Number(e.target.value) } : g))}
                            onBlur={(e) => handleUpdateGoal(goal.id, { target: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Quick Deposit Modal */}
      {showDepositModal && selectedDepositGoal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Deposit Savings</h3>
            <p className="text-xs text-slate-400 mb-4">Add savings towards <strong className="text-emerald-400">{selectedDepositGoal.title}</strong>.</p>
            
            <form onSubmit={handleDepositToGoal} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Deposit Amount ({currency})</label>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold text-lg focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Saved:</span>
                  <span>{currency} {Number(selectedDepositGoal.current).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>New Balance After Deposit:</span>
                  <span>{currency} {(Number(selectedDepositGoal.current) + Number(depositAmount)).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-medium shadow-md shadow-emerald-900/40"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setSelectedExpense(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {typeof selectedExpense.title === 'string' ? selectedExpense.title.replace(/\s*\[Monthly\]/, '') : selectedExpense.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Expense Details & Partner Split Breakdown</p>

            <div className="space-y-3 text-xs">
              {(selectedExpense.isMonthly || (typeof selectedExpense.title === 'string' && selectedExpense.title.includes('[Monthly]'))) && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Whole Month Cost Allocation</span>
                </div>
              )}
              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <strong className="text-white font-bold text-sm">{currency} {Number(selectedExpense.amount).toLocaleString()}</strong>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <span className="text-slate-400">Paid By:</span>
                <strong className="text-emerald-400 font-bold">{selectedExpense.paidBy}</strong>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <span className="text-slate-400">Rule Category:</span>
                <span className={`px-2 py-0.5 rounded font-medium ${
                  selectedExpense.category === 'Needs' ? 'bg-blue-500/10 text-blue-400' :
                  selectedExpense.category === 'Wants' ? 'bg-pink-500/10 text-pink-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>{selectedExpense.category}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <span className="text-slate-400">Split Method:</span>
                <strong className="text-indigo-400 font-semibold">{selectedExpense.splitType}</strong>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <span className="text-slate-400">Transaction Date:</span>
                <strong className="text-slate-200">{selectedExpense.date}</strong>
              </div>

              {/* Calculated Split Shares */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 mt-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Fair Share Breakdown</div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">{partnerA.name}'s Share ({partnerASharePercent}%):</span>
                  <span className="text-white font-bold">{currency} {((selectedExpense.amount * partnerASharePercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-400 font-semibold">{partnerB.name}'s Share ({partnerBSharePercent}%):</span>
                  <span className="text-white font-bold">{currency} {((selectedExpense.amount * partnerBSharePercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setSelectedExpense(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Expense Modal (Daily or Whole Month Cost) */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Log Expense
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a daily purchase or set a whole-month cost allocation (e.g. separate transport for each partner).
            </p>

            {/* Scope Toggle: Daily vs Whole Month Cost */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setNewExpense({ ...newExpense, expenseType: 'daily' })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  newExpense.expenseType === 'daily'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📅</span>
                <span>Daily Transaction</span>
              </button>
              <button
                type="button"
                onClick={() => setNewExpense({ ...newExpense, expenseType: 'monthly' })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  newExpense.expenseType === 'monthly'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🗓️</span>
                <span>Whole Month Cost</span>
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {newExpense.expenseType === 'monthly' ? 'Monthly Cost Title / Description' : 'Expense Description'}
                </label>
                <input 
                  type="text" 
                  placeholder={newExpense.expenseType === 'monthly' ? "e.g. Monthly Transport / Fuel, Monthly WiFi..." : "e.g. Groceries at Keells, Electricity Bill..."} 
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Form Fields for Whole Month Cost */}
              {newExpense.expenseType === 'monthly' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Select Month</label>
                      <input 
                        type="month" 
                        value={newExpense.month || new Date().toISOString().slice(0, 7)}
                        onChange={(e) => setNewExpense({ ...newExpense, month: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Rule Category</label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Needs">Needs (50%)</option>
                        <option value="Wants">Wants (30%)</option>
                        <option value="Savings">Savings (20%)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Partner Cost Allocation Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewExpense({ ...newExpense, partnerMode: 'separate' })}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                          newExpense.partnerMode === 'separate'
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Separate for Each Partner</span>
                        {newExpense.partnerMode === 'separate' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewExpense({ ...newExpense, partnerMode: 'single' })}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                          newExpense.partnerMode === 'single'
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Single Partner / Shared</span>
                        {newExpense.partnerMode === 'single' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                      </button>
                    </div>
                  </div>

                  {newExpense.partnerMode === 'separate' ? (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-emerald-400 font-semibold block mb-1">
                            {partnerA.name}'s Cost ({currency})
                          </label>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={newExpense.partnerAAmount}
                            onChange={(e) => setNewExpense({ ...newExpense, partnerAAmount: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-indigo-400 font-semibold block mb-1">
                            {partnerB.name}'s Cost ({currency})
                          </label>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={newExpense.partnerBAmount}
                            onChange={(e) => setNewExpense({ ...newExpense, partnerBAmount: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Total Combined Monthly Outflow:</span>
                        <span className="text-white font-bold text-sm">
                          {currency} {(Number(newExpense.partnerAAmount || 0) + Number(newExpense.partnerBAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        💡 Automatically creates 2 distinct monthly expense entries attributed to {partnerA.name} and {partnerB.name}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Monthly Amount ({currency})</label>
                        <input 
                          type="number" 
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Paid By</label>
                        <select
                          value={newExpense.paidBy}
                          onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        >
                          <option value={partnerA.name}>{partnerA.name}</option>
                          <option value={partnerB.name}>{partnerB.name}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Form Fields for Daily Transaction */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Amount ({currency})</label>
                      <input 
                        type="number" 
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Paid By</label>
                      <select
                        value={newExpense.paidBy}
                        onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value={partnerA.name}>{partnerA.name}</option>
                        <option value={partnerB.name}>{partnerB.name}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Rule Category</label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Needs">Needs (50%)</option>
                        <option value="Wants">Wants (30%)</option>
                        <option value="Savings">Savings (20%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Transaction Date</label>
                      <input 
                        type="date" 
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-medium shadow-md shadow-emerald-900/40 transition flex items-center gap-1.5"
                >
                  <span>
                    {newExpense.expenseType === 'monthly' 
                      ? (newExpense.partnerMode === 'separate' ? 'Log Monthly Costs' : 'Log Monthly Expense') 
                      : 'Log Daily Expense'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Shared Financial Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Goal Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. New Car Fund" 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Amount ({currency})</label>
                  <input 
                    type="number" 
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Currently Saved ({currency})</label>
                  <input 
                    type="number" 
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-xl font-medium shadow-md shadow-emerald-900/40"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Income Stream Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                {editingIncome ? 'Edit Income Method / Project' : 'Add Income Method / Project'}
              </h3>
              <button onClick={() => setShowIncomeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Track earnings from client projects, freelancing, or secondary revenue streams.
            </p>

            <form 
              onSubmit={editingIncome ? (e) => {
                e.preventDefault();
                handleUpdateIncome(editingIncome.id, newIncome);
                setShowIncomeModal(false);
              } : handleAddIncome} 
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project / Source Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Development, Brand Identity Kit, Consulting..."
                  value={newIncome.title}
                  onChange={(e) => setNewIncome({ ...newIncome, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Received By</label>
                  <select
                    value={newIncome.receivedBy}
                    onChange={(e) => setNewIncome({ ...newIncome, receivedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value={partnerA.name}>{partnerA.name}</option>
                    <option value={partnerB.name}>{partnerB.name}</option>
                    <option value="Joint">Joint (Shared)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={newIncome.category}
                    onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Project">Client Project</option>
                    <option value="Freelance">Freelance Gig</option>
                    <option value="Side Business">Side Business</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Investment">Investment / Dividend</option>
                    <option value="Bonus">Bonus / Commission</option>
                    <option value="Other">Other Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Recurrence</label>
                  <select
                    value={newIncome.recurrence}
                    onChange={(e) => setNewIncome({ ...newIncome, recurrence: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="monthly">Monthly Recurring</option>
                    <option value="one-time">One-Time Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={newIncome.date}
                  onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-medium shadow-md shadow-emerald-900/40 transition"
                >
                  {editingIncome ? 'Update Income Method' : 'Save Income Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Month Flow Detail Modal */}
      {selectedMonthDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedMonthDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              {selectedMonthDetail.monthLabel} Cash Flow Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">Complete breakdown of money in and money out for this month.</p>

            {/* Month Metrics Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Total Inflow</span>
                <span className="text-sm font-bold text-emerald-400">{currency} {selectedMonthDetail.inflow.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Total Outflow</span>
                <span className="text-sm font-bold text-rose-400">{currency} {selectedMonthDetail.outflow.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Net Surplus</span>
                <span className={`text-sm font-bold ${selectedMonthDetail.netFlow >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {selectedMonthDetail.netFlow >= 0 ? '+' : ''}{currency} {selectedMonthDetail.netFlow.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              {/* Income Streams this Month */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Income Inflow Sources</h4>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <div>
                      <span className="font-semibold text-white">Partner Base Salaries</span>
                      <span className="text-[10px] text-slate-400 block">{partnerA.name} ({currency} {partnerA.income.toLocaleString()}) & {partnerB.name} ({currency} {partnerB.income.toLocaleString()})</span>
                    </div>
                    <strong className="text-emerald-400">{currency} {selectedMonthDetail.salaryInflow.toLocaleString()}</strong>
                  </div>

                  {selectedMonthDetail.relevantIncomeSources && selectedMonthDetail.relevantIncomeSources.map(inc => (
                    <div key={inc.id} className="flex justify-between items-center py-1">
                      <div>
                        <span className="text-slate-200 font-medium">{inc.title}</span>
                        <span className="text-[10px] text-slate-400 block">{inc.category} • Received by {inc.receivedBy} ({inc.recurrence})</span>
                      </div>
                      <strong className="text-emerald-300">+{currency} {Number(inc.amount).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses this Month */}
              <div>
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
                  Expenses Logged ({selectedMonthDetail.monthExpenses?.length || 0})
                </h4>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2 text-xs">
                  {(!selectedMonthDetail.monthExpenses || selectedMonthDetail.monthExpenses.length === 0) ? (
                    <div className="text-slate-500 italic text-center py-2">No individual expenses logged for this month.</div>
                  ) : (
                    selectedMonthDetail.monthExpenses.map(exp => {
                      const isMonthly = exp.isMonthly || (typeof exp.title === 'string' && exp.title.includes('[Monthly]'));
                      const displayTitle = typeof exp.title === 'string' ? exp.title.replace(/\s*\[Monthly\]/, '') : exp.title;
                      return (
                        <div key={exp.id} className="flex justify-between items-center py-1 border-b border-slate-800/40 last:border-0">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-white font-medium">{displayTitle}</span>
                              {isMonthly && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  Monthly
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">{exp.category} • Paid by {exp.paidBy} on {exp.date}</span>
                          </div>
                          <strong className="text-slate-200">{currency} {Number(exp.amount).toLocaleString()}</strong>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800 mt-2">
              <button 
                onClick={() => setSelectedMonthDetail(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl font-medium hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clean Past Months Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Start Fresh from This Month?</h3>
                <p className="text-xs text-slate-400">Set tracking start to {startTrackingMonth}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will set your cash flow tracking to start strictly from <strong className="text-emerald-400">{startTrackingMonth}</strong> and clean any previous month expenses and test entries.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1 mb-5">
              <div>• Removes transactions before {startTrackingMonth}-01</div>
              <div>• Resets 50/30/20 actual spend to 0 for a clean start</div>
              <div>• Keeps your partner salaries & recurring project streams intact</div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearPastData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl font-medium shadow-md shadow-rose-900/40 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
