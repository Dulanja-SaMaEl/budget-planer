import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Wallet, TrendingUp, PiggyBank, Scale, 
  PlusCircle, Calculator, Heart, ShieldCheck, Target, ArrowUpRight, Settings, Edit2, Database, Trash2, CheckCircle2, Loader2
} from 'lucide-react';

export default function Dashboard() {
  // Customizable Currency Symbol
  const [currency, setCurrency] = useState('Rs.');

  // API & Database Connection Health Check State
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    backend: 'checking',
    database: 'checking',
    message: 'Checking API status...'
  });

  // Salary Saved Notification Banner
  const [salaryNotification, setSalaryNotification] = useState(false);

  // Customizable Partner Profiles & Incomes
  const [partnerA, setPartnerA] = useState({ name: 'Dulanja', income: 450000, payDate: '25th of every month' });
  const [partnerB, setPartnerB] = useState({ name: 'Diyana', income: 350000, payDate: '28th of every month' });

  // Customizable Actual Expenses (Needs, Wants, Savings)
  const [actualSpend, setActualSpend] = useState({ needs: 320000, wants: 180000, savings: 150000 });

  // Interactive Bill Splitter State
  const [sampleBill, setSampleBill] = useState(100000);

  // Wealth Compound Future Projection Settings
  const [monthlyContribution, setMonthlyContribution] = useState(150000);
  const [annualReturn, setAnnualReturn] = useState(10); // 10% expected return rate
  const [startingSavings, setStartingSavings] = useState(1000000);

  // Editable Savings Goals List
  const [goals, setGoals] = useState([
    { id: 1, title: 'Emergency Fund (6 Months)', category: 'Emergency', current: 1200000, target: 2000000, color: 'bg-emerald-500' },
    { id: 2, title: 'Dream Vacation Trip', category: 'Vacation', current: 350000, target: 600000, color: 'bg-indigo-500' },
    { id: 3, title: 'House Downpayment Fund', category: 'Milestone', current: 2500000, target: 5000000, color: 'bg-purple-500' },
  ]);

  // Logged Daily Expenses History
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Keells Supermarket Groceries', amount: 45000, paidBy: 'Dulanja', category: 'Needs', splitType: 'Proportional', date: '2026-08-16' },
    { id: 2, title: 'Fiber Broadband & Electricity', amount: 18000, paidBy: 'Diyana', category: 'Needs', splitType: 'Proportional', date: '2026-08-15' },
    { id: 3, title: 'Weekend Dinner & Drinks', amount: 12500, paidBy: 'Dulanja', category: 'Wants', splitType: '50/50', date: '2026-08-14' }
  ]);

  // Modal / Form state for Add Goal & Add Expense
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'General', target: 500000, current: 0 });

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 15000,
    paidBy: 'Dulanja',
    category: 'Needs',
    splitType: 'Proportional',
    date: new Date().toISOString().split('T')[0]
  });

  // Live API Connection Verification Effect with Retry / Wakeup Handler
  useEffect(() => {
    let attempts = 0;
    const verifyConnection = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://budget-planer-f7ob.onrender.com/api';
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
        } else {
          setApiStatus({ checked: true, backend: 'disconnected', database: 'disconnected', message: 'Backend Unreachable' });
        }
      } catch (err) {
        if (attempts < 3) {
          attempts++;
          setApiStatus({ checked: false, backend: 'waking', database: 'checking', message: 'Waking Render Server...' });
          setTimeout(verifyConnection, 4000);
        } else {
          setApiStatus({ checked: true, backend: 'disconnected', database: 'disconnected', message: 'Demo Mode (Client Only)' });
        }
      }
    };
    verifyConnection();
  }, []);

  // Sync Salary Changes to Backend API
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
    setSalaryNotification(true);
    setTimeout(() => setSalaryNotification(false), 3000);
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

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title) return;
    setGoals([
      ...goals,
      {
        id: Date.now(),
        title: newGoal.title,
        category: newGoal.category,
        current: Number(newGoal.current),
        target: Number(newGoal.target),
        color: 'bg-emerald-500'
      }
    ]);
    setNewGoal({ title: '', category: 'General', target: 500000, current: 0 });
    setShowGoalModal(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    const amt = Number(newExpense.amount);
    const item = {
      id: Date.now(),
      title: newExpense.title,
      amount: amt,
      paidBy: newExpense.paidBy,
      category: newExpense.category,
      splitType: newExpense.splitType,
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };

    setExpenses([item, ...expenses]);

    if (newExpense.category === 'Needs') {
      setActualSpend(prev => ({ ...prev, needs: prev.needs + amt }));
    } else if (newExpense.category === 'Wants') {
      setActualSpend(prev => ({ ...prev, wants: prev.wants + amt }));
    } else if (newExpense.category === 'Savings') {
      setActualSpend(prev => ({ ...prev, savings: prev.savings + amt }));
    }

    setNewExpense({
      title: '',
      amount: 15000,
      paidBy: partnerA.name,
      category: 'Needs',
      splitType: 'Proportional',
      date: new Date().toISOString().split('T')[0]
    });
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id) => {
    const item = expenses.find(e => e.id === id);
    if (item) {
      if (item.category === 'Needs') setActualSpend(prev => ({ ...prev, needs: Math.max(0, prev.needs - item.amount) }));
      if (item.category === 'Wants') setActualSpend(prev => ({ ...prev, wants: Math.max(0, prev.wants - item.amount) }));
      if (item.category === 'Savings') setActualSpend(prev => ({ ...prev, savings: Math.max(0, prev.savings - item.amount) }));
    }
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
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

            {salaryNotification && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Salaries saved & split percentages updated!
              </div>
            )}

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
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expenses.map((exp) => (
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
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Tracking (50/30/20 Rule) Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Expense Budget Allocation (50/30/20 Rule)
            </h2>
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

              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400 block">Initial Savings</span>
                  <input 
                    type="number" 
                    value={startingSavings} 
                    onChange={(e) => setStartingSavings(Number(e.target.value))}
                    className="w-full bg-slate-900 text-emerald-400 font-bold px-2 py-1 rounded text-xs border border-slate-700"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">Monthly Contribution</span>
                  <input 
                    type="number" 
                    value={monthlyContribution} 
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full bg-slate-900 text-emerald-400 font-bold px-2 py-1 rounded text-xs border border-slate-700"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">Return % / yr</span>
                  <input 
                    type="number" 
                    value={annualReturn} 
                    onChange={(e) => setAnnualReturn(Number(e.target.value))}
                    className="w-full bg-slate-900 text-white font-bold px-2 py-1 rounded text-xs border border-slate-700"
                  />
                </div>
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
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" /> Proportional Bill Splitter
            </h2>
            <p className="text-slate-400 text-xs mb-4">
              Enter any bill to split proportionally based on {partnerA.name} ({partnerASharePercent}%) and {partnerB.name} ({partnerBSharePercent}%).
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <label className="text-xs text-slate-400 font-semibold block mb-1">Enter Shared Bill Amount ({currency})</label>
              <input 
                type="number"
                value={sampleBill}
                onChange={(e) => setSampleBill(Number(e.target.value))}
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
              {goals.map((goal) => {
                const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                return (
                  <div key={goal.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white text-sm">{goal.title}</h4>
                        <span className="text-xs text-slate-400">{goal.category}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 my-2">
                      <div className={`${goal.color} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <span>Saved:</span>
                        <input 
                          type="number"
                          value={goal.current}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGoals(goals.map(g => g.id === goal.id ? { ...g, current: val } : g));
                          }}
                          className="w-24 bg-slate-900 border border-slate-700 text-white rounded px-1.5 py-0.5 text-xs font-bold"
                        />
                      </div>
                      <span>Target: {currency} {goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

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
