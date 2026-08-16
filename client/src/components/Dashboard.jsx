import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Wallet, TrendingUp, PiggyBank, Scale, 
  PlusCircle, Calculator, Heart, ShieldCheck, Target, ArrowUpRight, Settings, Edit2
} from 'lucide-react';

export default function Dashboard() {
  // Customizable Currency Symbol
  const [currency, setCurrency] = useState('Rs.');

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

  // Modal / Form state for adding new goal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'General', target: 500000, current: 0 });

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm tracking-wide uppercase">
            <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" /> Couples Financial Harmony
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
            {partnerA.name} & {partnerB.name}'s Wealth Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track combined salary streams, split shared bills fairly, and build long-term wealth together.
          </p>
        </div>

        {/* Currency & Settings Controller */}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Income & Salary Management
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                <Edit2 className="w-3 h-3" /> Live Recalculation
              </span>
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
