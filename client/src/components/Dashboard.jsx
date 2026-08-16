import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Wallet, TrendingUp, PiggyBank, Scale, 
  PlusCircle, Calculator, Heart, ShieldCheck, Target, ArrowUpRight, Settings, Database, Trash2, CheckCircle2, Loader2, Eye, X, ArrowUpCircle
} from 'lucide-react';

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
    date: new Date().toISOString().split('T')[0]
  });

  const [selectedExpense, setSelectedExpense] = useState(null); // For View Expense Detail Modal

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

  // Calculated Combined Financial Metrics
  const combinedIncome = Number(partnerA.income) + Number(partnerB.income);
  const partnerASharePercent = combinedIncome > 0 ? ((partnerA.income / combinedIncome) * 100).toFixed(1) : 50;
  const partnerBSharePercent = combinedIncome > 0 ? ((partnerB.income / combinedIncome) * 100).toFixed(1) : 50;

  // 50/30/20 Rule Target Benchmarks
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
    if (!newExpense.title || !newExpense.amount) return;

    const amt = Number(newExpense.amount);
    const item = {
      id: Date.now().toString(),
      title: newExpense.title,
      amount: amt,
      paidBy: newExpense.paidBy,
      category: newExpense.category,
      splitType: newExpense.splitType,
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };

    setExpenses(prev => [item, ...prev]);

    let updatedSpend = { ...actualSpend };
    if (newExpense.category === 'Needs') updatedSpend.needs += amt;
    if (newExpense.category === 'Wants') updatedSpend.wants += amt;
    if (newExpense.category === 'Savings') updatedSpend.savings += amt;
    setActualSpend(updatedSpend);

    // Persist to Supabase Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
    try {
      const res = await fetch(`${apiUrl}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.expense) {
          setExpenses(prev => [data.expense, ...prev.filter(i => i.id !== item.id)]);
        }
      }
    } catch (err) {
      console.log('Expense added locally.');
    }

    handleSaveSettings({ actualSpend: updatedSpend });

    setNewExpense({
      title: '',
      amount: 15000,
      paidBy: partnerA.name,
      category: 'Needs',
      splitType: 'Proportional',
      date: new Date().toISOString().split('T')[0]
    });
    setShowExpenseModal(false);
    showToast('Expense logged & saved!');
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
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">{partnerASharePercent}% {partnerA.name}</span>
            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-medium">{partnerBSharePercent}% {partnerB.name}</span>
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
            Relative income distribution
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
                + Log Daily Expense
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
                      <td colSpan="6" className="py-6 text-center text-slate-500 italic">No logged expenses found. Click "+ Log Daily Expense" to add one!</td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{exp.date}</td>
                        <td className="py-3 px-2 font-semibold text-white">{exp.title}</td>
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
                    ))
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

            <h3 className="text-xl font-bold text-white mb-1">{selectedExpense.title}</h3>
            <p className="text-xs text-slate-400 mb-4">Expense Details & Partner Split Breakdown</p>

            <div className="space-y-3 text-xs">
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

      {/* Add New Daily Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Log Daily Expense</h3>
            <p className="text-xs text-slate-400 mb-4">Log spending by {partnerA.name} or {partnerB.name} to update total balances.</p>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Expense Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Groceries at Keells, Electricity Bill..." 
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

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
                  <label className="text-xs text-slate-400 block mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-medium shadow-md shadow-emerald-900/40"
                >
                  Log Expense
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
    </div>
  );
}
