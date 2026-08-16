import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { 
  Wallet, TrendingUp, PiggyBank, Scale, Calendar, 
  PlusCircle, Calculator, Heart, ShieldCheck, Target, ArrowUpRight
} from 'lucide-react';

export default function Dashboard() {
  // State for Income Streams
  const [partnerA, setPartnerA] = useState({ name: 'Alex', income: 4500, payDate: '1st & 15th' });
  const [partnerB, setPartnerB] = useState({ name: 'Jordan', income: 3500, payDate: '28th' });

  // State for Proportional Bill Splitter
  const [sampleBill, setSampleBill] = useState(1200);

  // Future Projection Settings
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [annualReturn, setAnnualReturn] = useState(7); // 7% annual return

  // Calculated Combined Totals
  const combinedIncome = Number(partnerA.income) + Number(partnerB.income);
  const partnerASharePercent = combinedIncome > 0 ? ((partnerA.income / combinedIncome) * 100).toFixed(1) : 50;
  const partnerBSharePercent = combinedIncome > 0 ? ((partnerB.income / combinedIncome) * 100).toFixed(1) : 50;

  // 50/30/20 Rule Benchmarks
  const needsTarget = combinedIncome * 0.50;
  const wantsTarget = combinedIncome * 0.30;
  const savingsTarget = combinedIncome * 0.20;

  // Actual Current Expenses (Mock / Editable)
  const actualSpend = { needs: 3800, wants: 1950, savings: 1650 };
  const totalExpenses = actualSpend.needs + actualSpend.wants;
  const remainingCashflow = combinedIncome - totalExpenses;

  // Pie Chart Data (50/30/20 Breakdown)
  const pieData = [
    { name: 'Needs (50%)', value: actualSpend.needs, color: '#3b82f6' },
    { name: 'Wants (30%)', value: actualSpend.wants, color: '#ec4899' },
    { name: 'Savings/Growth (20%)', value: actualSpend.savings, color: '#10b981' },
  ];

  // Goals Data
  const goals = [
    { id: 1, title: 'Emergency Fund (6 Mos)', category: 'Emergency', current: 12500, target: 18000, color: 'bg-emerald-500' },
    { id: 2, title: 'Japan Anniversary Trip', category: 'Vacation', current: 3400, target: 5000, color: 'bg-indigo-500' },
    { id: 3, title: 'House Downpayment', category: 'Milestone', current: 24000, target: 50000, color: 'bg-purple-500' },
  ];

  // Compound Growth Projection Generator (1, 5, 10 Years)
  const generateProjectionData = () => {
    const data = [];
    let cumulative = 39900; // starting current net worth savings
    const monthlyRate = annualReturn / 100 / 12;

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
            Combining incomes, tracking proportional expenses, and building your dream future together.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition">
            <PlusCircle className="w-4 h-4" /> Add Expense
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-emerald-900/30 transition">
            <TrendingUp className="w-4 h-4" /> New Goal
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Stat Card 1: Combined Net Income */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Combined Net Income</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">${combinedIncome.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">{partnerASharePercent}% {partnerA.name}</span>
            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-medium">{partnerBSharePercent}% {partnerB.name}</span>
          </div>
        </div>

        {/* Stat Card 2: Total Monthly Expenses */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Expenses</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">${totalExpenses.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></div>
          <div className="mt-3 text-xs text-slate-400">
            Needs (${actualSpend.needs}) + Wants (${actualSpend.wants})
          </div>
        </div>

        {/* Stat Card 3: Monthly Net Cashflow */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Net Monthly Surplus</span>
            <PiggyBank className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">${remainingCashflow.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></div>
          <div className="mt-3 text-xs text-emerald-400/80 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Ready for savings & goals
          </div>
        </div>

        {/* Stat Card 4: Proportional Split Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Fair Share Split</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white mt-2">
            {partnerASharePercent}% : {partnerBSharePercent}%
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Based on current relative salary inputs
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols wide on desktop): Salary Input & 50/30/20 Rule Visualizer */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Salary Streams Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Income & Salary Management
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">Automatic Ratio Recalculation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partner A */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-400">{partnerA.name}'s Salary</span>
                  <span className="text-xs text-slate-400">Pay Date: {partnerA.payDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">$</span>
                  <input 
                    type="number" 
                    value={partnerA.income}
                    onChange={(e) => setPartnerA({ ...partnerA, income: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Contributes <strong>{partnerASharePercent}%</strong> to household pool
                </div>
              </div>

              {/* Partner B */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-indigo-400">{partnerB.name}'s Salary</span>
                  <span className="text-xs text-slate-400">Pay Date: {partnerB.payDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">$</span>
                  <input 
                    type="number" 
                    value={partnerB.income}
                    onChange={(e) => setPartnerB({ ...partnerB, income: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Contributes <strong>{partnerBSharePercent}%</strong> to household pool
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
              Needs (50%), Wants (30%), Savings & Debt Payoff (20%) aligned with your combined income.
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
                      formatter={(value) => [`$${value}`, 'Logged Spend']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                {/* Needs */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-400">Needs (Target $${needsTarget.toLocaleString()})</span>
                    <span className="text-slate-300">${actualSpend.needs} / ${needsTarget}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min((actualSpend.needs / needsTarget) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Wants */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-pink-400">Wants (Target $${wantsTarget.toLocaleString()})</span>
                    <span className="text-slate-300">${actualSpend.wants} / ${wantsTarget}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${Math.min((actualSpend.wants / wantsTarget) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Savings */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400">Savings/Investments (Target $${savingsTarget.toLocaleString()})</span>
                    <span className="text-slate-300">${actualSpend.savings} / ${savingsTarget}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min((actualSpend.savings / savingsTarget) * 100, 100)}%` }}></div>
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
                <p className="text-slate-400 text-xs mt-1">See how your combined monthly contributions grow over time.</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400 block">Monthly Savings</span>
                  <input 
                    type="number" 
                    value={monthlyContribution} 
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-20 bg-slate-900 text-emerald-400 font-bold px-2 py-1 rounded text-xs border border-slate-700"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">Est. Return %</span>
                  <input 
                    type="number" 
                    value={annualReturn} 
                    onChange={(e) => setAnnualReturn(e.target.value)}
                    className="w-14 bg-slate-900 text-white font-bold px-2 py-1 rounded text-xs border border-slate-700"
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
                  <YAxis stroke="#94a3b8" formatter={(val) => `$${val / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} formatter={(val) => [`$${val.toLocaleString()}`, 'Projected Wealth']} />
                  <Area type="monotone" dataKey="projectedWorth" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Proportional Bill Splitter & Savings Milestone Trackers */}
        <div className="space-y-8">

          {/* Interactive Proportional Bill Splitter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" /> Proportional Bill Splitter
            </h2>
            <p className="text-slate-400 text-xs mb-4">
              Split rent, groceries, or vacations based on income percentage so both partners contribute fairly.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <label className="text-xs text-slate-400 font-semibold block mb-1">Enter Shared Bill Amount ($)</label>
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
                  <span className="text-xs text-slate-400 block">{partnerA.name}'s Share ({partnerASharePercent}%)</span>
                  <span className="text-lg font-bold text-emerald-400">
                    ${((sampleBill * partnerASharePercent) / 100).toFixed(2)}
                  </span>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Income Proportional</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl flex justify-between items-center border-l-4 border-indigo-500">
                <div>
                  <span className="text-xs text-slate-400 block">{partnerB.name}'s Share ({partnerBSharePercent}%)</span>
                  <span className="text-lg font-bold text-indigo-400">
                    ${((sampleBill * partnerBSharePercent) / 100).toFixed(2)}
                  </span>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">Income Proportional</span>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                (Standard 50/50 split would be ${(sampleBill / 2).toFixed(2)} each)
              </div>
            </div>
          </div>

          {/* Savings Milestone Trackers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> Shared Savings Goals
            </h2>

            <div className="space-y-4">
              {goals.map((goal) => {
                const percent = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={goal.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
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

                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>Saved: ${goal.current.toLocaleString()}</span>
                      <span>Target: ${goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
