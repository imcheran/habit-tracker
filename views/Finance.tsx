import React, { useState, useMemo } from 'react';
import { FinanceData, Expense, Debt } from '../types';
import { 
    Plus, Trash2, Wallet, TrendingUp, HandCoins, Settings, DollarSign, 
    Calendar, ArrowUpRight, ArrowDownRight, Activity, PieChart as PieIcon, 
    BarChart3, AlertCircle, Target, Banknote
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, Line
} from 'recharts';

interface FinanceProps {
  data: FinanceData;
  onUpdate: (data: FinanceData) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Finance: React.FC<FinanceProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTION' | 'DASHBOARD' | 'FUNDS' | 'SETTINGS'>('TRANSACTION');
  
  // Transaction State
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(data.categories[0] || 'Food');
  const [txNote, setTxNote] = useState('');

  // Fund/Debt State
  const [debtType, setDebtType] = useState<'Borrowed' | 'Lent'>('Borrowed');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtAmount, setDebtAmount] = useState('');

  // Settings State
  const [newCat, setNewCat] = useState('');
  const [newBudget, setNewBudget] = useState(data.monthlyBudget?.toString() || '');
  const [newBalance, setNewBalance] = useState(data.walletBalance?.toString() || '');

  // Analytics State
  const [dateRange, setDateRange] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30' | 'THIS_YEAR' | 'CUSTOM'>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // --- Handlers ---

  const addExpense = () => {
    if (!txAmount) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: txDate,
      category: txCategory,
      amount: parseFloat(txAmount),
      note: txNote
    };
    onUpdate({ ...data, expenses: [...data.expenses, newExpense] });
    setTxAmount('');
    setTxNote('');
    alert('Expense Saved!');
  };

  const addDebt = () => {
    if (!debtPerson || !debtAmount) return;
    const newDebt: Debt = {
      id: Date.now().toString(),
      type: debtType,
      person: debtPerson,
      amount: parseFloat(debtAmount),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    onUpdate({ ...data, debts: [...data.debts, newDebt] });
    setDebtPerson('');
    setDebtAmount('');
  };

  const toggleDebtStatus = (id: string) => {
    const updatedDebts = data.debts.map(d => 
        d.id === id ? { ...d, status: d.status === 'Pending' ? 'Settled' as const : 'Pending' as const } : d
    );
    onUpdate({ ...data, debts: updatedDebts });
  };

  const addCategory = () => {
    if (newCat && !data.categories.includes(newCat)) {
      onUpdate({ ...data, categories: [...data.categories, newCat] });
      setNewCat('');
    }
  };

  const deleteCategory = (cat: string) => {
    if (confirm(`Delete category ${cat}?`)) {
        onUpdate({ ...data, categories: data.categories.filter(c => c !== cat) });
    }
  };
  
  const saveFinancialSettings = () => {
      onUpdate({
          ...data,
          monthlyBudget: parseFloat(newBudget) || 0,
          walletBalance: parseFloat(newBalance) || 0
      });
      alert('Financial Settings Saved');
  };

  // --- Analytics Calculations ---

  const analyticsData = useMemo(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    // Determine Date Range
    switch (dateRange) {
        case 'THIS_MONTH':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            prevEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'LAST_MONTH':
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            prevStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);
            prevEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);
            break;
        case 'LAST_30':
            start.setDate(today.getDate() - 30);
            prevStart.setDate(today.getDate() - 60);
            prevEnd.setDate(today.getDate() - 30);
            break;
        case 'THIS_YEAR':
            start = new Date(today.getFullYear(), 0, 1);
            prevStart = new Date(today.getFullYear() - 1, 0, 1);
            prevEnd = new Date(today.getFullYear() - 1, 11, 31);
            break;
        case 'CUSTOM':
            if (customStart && customEnd) {
                start = new Date(customStart);
                end = new Date(customEnd);
                // Simple approx for previous period (same duration)
                const diffTime = Math.abs(end.getTime() - start.getTime());
                prevEnd = new Date(start.getTime() - 86400000);
                prevStart = new Date(prevEnd.getTime() - diffTime);
            }
            break;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const prevStartStr = prevStart.toISOString().split('T')[0];
    const prevEndStr = prevEnd.toISOString().split('T')[0];

    // Filter Data
    const currentPeriodExpenses = data.expenses.filter(e => e.date >= startStr && e.date <= endStr);
    const prevPeriodExpenses = data.expenses.filter(e => e.date >= prevStartStr && e.date <= prevEndStr);

    // 1. Smart Metrics
    const totalSpend = currentPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevSpend = prevPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const deltaPercent = prevSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : 0;
    
    // Burn Rate (Avg Daily)
    const msInDay = 1000 * 3600 * 24;
    const daysPassedInPeriod = Math.max(1, Math.floor((Math.min(today.getTime(), end.getTime()) - start.getTime()) / msInDay) + 1);
    const dailyAverage = totalSpend / daysPassedInPeriod;

    // Projected Spend (Only if THIS_MONTH)
    let projectedSpend = 0;
    if (dateRange === 'THIS_MONTH') {
        const daysInCurrentMonth = end.getDate(); // Last day of month
        projectedSpend = dailyAverage * daysInCurrentMonth;
    }

    // 2. Spending Trend (Cumulative)
    const trendMap: Record<string, number> = {};
    currentPeriodExpenses.forEach(e => {
        trendMap[e.date] = (trendMap[e.date] || 0) + e.amount;
    });
    
    let cumulative = 0;
    const trendData = Object.entries(trendMap)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([date, amount]) => {
            cumulative += amount;
            return { date, daily: amount, cumulative };
        });

    // 3. Category Breakdown
    const catMap: Record<string, number> = {};
    currentPeriodExpenses.forEach(e => catMap[e.category] = (catMap[e.category] || 0) + e.amount);
    const categoryData = Object.entries(catMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);

    // 4. Day of Week Analysis
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap = new Array(7).fill(0);
    currentPeriodExpenses.forEach(e => {
        const [y, m, d] = e.date.split('-').map(Number);
        const localDayIdx = new Date(y, m-1, d).getDay();
        dayMap[localDayIdx] += e.amount;
    });
    const dayOfWeekData = dayNames.map((name, i) => ({ day: name, amount: dayMap[i] }));

    // 5. Top Spenders
    const topTransactions = [...currentPeriodExpenses].sort((a,b) => b.amount - a.amount).slice(0, 5);
    
    // Budget Calculations
    const monthlyBudget = data.monthlyBudget || 0;
    const remainingBudget = monthlyBudget - totalSpend;
    const budgetProgress = monthlyBudget > 0 ? (totalSpend / monthlyBudget) * 100 : 0;

    return {
        totalSpend,
        prevSpend,
        deltaPercent,
        dailyAverage,
        projectedSpend,
        trendData,
        categoryData,
        dayOfWeekData,
        topTransactions,
        monthlyBudget,
        remainingBudget,
        budgetProgress,
        isEmpty: currentPeriodExpenses.length === 0
    };

  }, [data.expenses, dateRange, customStart, customEnd, data.monthlyBudget]);

  const fundSummary = useMemo(() => {
      const pending = data.debts.filter(d => d.status === 'Pending');
      const iBorrowed = pending.filter(d => d.type === 'Borrowed').reduce((sum, d) => sum + d.amount, 0);
      const iLent = pending.filter(d => d.type === 'Lent').reduce((sum, d) => sum + d.amount, 0);
      return { iBorrowed, iLent };
  }, [data.debts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="text-indigo-600" /> Finance Manager
            </h2>
            <p className="text-slate-500 text-sm">Track expenses, manage funds, and analyze budget.</p>
         </div>
         <div className="flex bg-slate-100 p-1 rounded-lg">
             {[
                 { id: 'TRANSACTION', icon: Plus, label: 'Add Entry' },
                 { id: 'DASHBOARD', icon: TrendingUp, label: 'Analytics' },
                 { id: 'FUNDS', icon: HandCoins, label: 'Funds' },
                 { id: 'SETTINGS', icon: Settings, label: 'Settings' }
             ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                 >
                     <tab.icon size={16} />
                     <span className="hidden md:inline">{tab.label}</span>
                 </button>
             ))}
         </div>
      </div>

      {/* Content Area */}
      
      {/* 1. TRANSACTION TAB */}
      {activeTab === 'TRANSACTION' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <DollarSign className="text-emerald-500" /> Log Daily Spending
              </h3>
              <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                          <input 
                            type="date" 
                            value={txDate} 
                            onChange={(e) => setTxDate(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={txAmount} 
                            onChange={(e) => setTxAmount(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono font-bold text-lg" 
                          />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                          <select 
                             value={txCategory} 
                             onChange={(e) => setTxCategory(e.target.value)}
                             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                          >
                             {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note (Optional)</label>
                          <input 
                             type="text" 
                             placeholder="Lunch, Uber, etc."
                             value={txNote} 
                             onChange={(e) => setTxNote(e.target.value)}
                             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                          />
                      </div>
                  </div>
                  <button 
                    onClick={addExpense}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                      <Plus size={20} /> Save Expense
                  </button>
              </div>
          </div>
      )}

      {/* 2. DASHBOARD & ANALYTICS TAB */}
      {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
              {/* Analytics Filter Bar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4 justify-between">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <BarChart3 size={20} className="text-indigo-600" />
                      Financial Analytics
                  </h3>
                  <div className="flex items-center gap-2">
                      <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none"
                      >
                          <option value="THIS_MONTH">This Month</option>
                          <option value="LAST_MONTH">Last Month</option>
                          <option value="LAST_30">Last 30 Days</option>
                          <option value="THIS_YEAR">This Year</option>
                          <option value="CUSTOM">Custom Range</option>
                      </select>
                      {dateRange === 'CUSTOM' && (
                          <div className="flex gap-2">
                              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="p-2 border rounded-lg text-sm" />
                              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="p-2 border rounded-lg text-sm" />
                          </div>
                      )}
                  </div>
              </div>

              {analyticsData.isEmpty && dateRange !== 'THIS_MONTH' ? (
                  <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
                      <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-bold">No financial data found</p>
                      <p className="text-sm">Try selecting a different date range or add some transactions.</p>
                  </div>
              ) : (
                  <>
                    {/* Top Row: Budget & Balance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Total Balance Card */}
                         <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-6 opacity-10">
                                <Banknote size={64} />
                            </div>
                            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Total Amount I Have</p>
                            <p className="text-4xl font-bold">₹{data.walletBalance ? data.walletBalance.toLocaleString() : '0'}</p>
                            <p className="text-xs text-slate-400 mt-2">Current Wallet/Bank Balance</p>
                         </div>

                        {/* Budget Status Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Budget</p>
                                <span className="text-xs font-bold text-slate-400">₹{analyticsData.monthlyBudget.toLocaleString()} Goal</span>
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-slate-800">₹{analyticsData.totalSpend.toLocaleString()}</span>
                                <span className="text-xs text-slate-500 mb-1">Spent</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${analyticsData.budgetProgress > 100 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                                    style={{ width: `${Math.min(analyticsData.budgetProgress, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-bold">
                                <span className={analyticsData.remainingBudget < 0 ? 'text-red-500' : 'text-emerald-600'}>
                                    {analyticsData.remainingBudget < 0 ? 'Over Budget' : 'Remaining'}
                                </span>
                                <span className={analyticsData.remainingBudget < 0 ? 'text-red-500' : 'text-emerald-600'}>
                                    {analyticsData.remainingBudget < 0 ? '-' : ''}₹{Math.abs(analyticsData.remainingBudget).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metric Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spending Change</p>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${analyticsData.deltaPercent > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {analyticsData.deltaPercent > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {Math.abs(analyticsData.deltaPercent).toFixed(1)}%
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">₹{analyticsData.totalSpend.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-1">vs previous period</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Burn Rate</p>
                                <Activity size={18} className="text-orange-500" />
                            </div>
                            <p className="text-2xl font-bold text-slate-800">₹{analyticsData.dailyAverage.toFixed(0)}</p>
                            <p className="text-xs text-slate-400 mt-1">Avg daily spend</p>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-xl shadow-inner border border-indigo-100">
                             <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Projected Spend</p>
                                <TrendingUp size={18} className="text-indigo-400" />
                            </div>
                            {dateRange === 'THIS_MONTH' ? (
                                <>
                                    <p className="text-2xl font-bold text-indigo-900">₹{analyticsData.projectedSpend.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                                    <p className="text-xs text-indigo-500 mt-1">Forecast for month end</p>
                                </>
                            ) : (
                                <p className="text-sm text-indigo-400 italic mt-2">Projection available for "This Month"</p>
                            )}
                        </div>
                    </div>

                    {/* Deep-Dive Visualizations */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Trend Chart */}
                        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
                             <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-600" /> Spending Trend & Accumulation
                             </h4>
                             <ResponsiveContainer width="100%" height="100%">
                                 <ComposedChart data={analyticsData.trendData}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                     <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} />
                                     <YAxis yAxisId="left" orientation="left" stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                                     <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                                     <RechartsTooltip 
                                        formatter={(value: any) => [`₹${value}`, '']}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                     />
                                     <Legend />
                                     <Bar yAxisId="left" dataKey="daily" name="Daily Spend" fill="#6366f1" barSize={20} radius={[4,4,0,0]} />
                                     <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                 </ComposedChart>
                             </ResponsiveContainer>
                        </div>

                        {/* Category Donut */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
                             <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <PieIcon size={18} className="text-emerald-500" /> Breakdown
                             </h4>
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={analyticsData.categoryData} 
                                        cx="50%" cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={80} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {analyticsData.categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: any) => [`₹${value}`, 'Amount']} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                </PieChart>
                             </ResponsiveContainer>
                        </div>

                        {/* Day of Week Analysis */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
                             <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Calendar size={18} className="text-purple-500" /> Day-of-Week Habits
                             </h4>
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={analyticsData.dayOfWeekData}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                     <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                     <YAxis hide />
                                     <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value: any) => [`₹${value}`, 'Spent']} />
                                     <Bar dataKey="amount" fill="#8b5cf6" radius={[4,4,0,0]} barSize={40}>
                                        {analyticsData.dayOfWeekData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.amount > (analyticsData.totalSpend / 7) ? '#8b5cf6' : '#c4b5fd'} />
                                        ))}
                                     </Bar>
                                 </BarChart>
                             </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Spenders Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-rose-500" /> Largest Transactions
                             </h4>
                             <div className="space-y-3">
                                 {analyticsData.topTransactions.map((t, idx) => (
                                     <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                         <div className="flex items-center gap-3">
                                             <span className="font-bold text-slate-400 text-xs">#{idx+1}</span>
                                             <div>
                                                 <p className="font-bold text-slate-700 text-sm">{t.note || t.category}</p>
                                                 <p className="text-xs text-slate-400">{t.date}</p>
                                             </div>
                                         </div>
                                         <span className="font-mono font-bold text-slate-800">₹{t.amount.toLocaleString()}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <h4 className="font-bold text-slate-800 mb-4">Top Spending Categories</h4>
                             <div className="space-y-4">
                                 {analyticsData.categoryData.slice(0, 3).map((cat, idx) => (
                                     <div key={cat.name} className="relative pt-1">
                                         <div className="flex mb-2 items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                 <span className={`w-3 h-3 rounded-full`} style={{backgroundColor: COLORS[idx]}}></span>
                                                 <span className="text-xs font-semibold inline-block uppercase text-slate-600">
                                                     {cat.name}
                                                 </span>
                                             </div>
                                             <div className="text-right">
                                                 <span className="text-xs font-semibold inline-block text-indigo-600">
                                                     {Math.round((cat.value / analyticsData.totalSpend) * 100)}%
                                                 </span>
                                             </div>
                                         </div>
                                         <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                                             <div style={{ width: `${(cat.value / analyticsData.totalSpend) * 100}%`, backgroundColor: COLORS[idx] }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"></div>
                                         </div>
                                         <p className="text-right text-sm font-bold -mt-3 text-slate-700">₹{cat.value.toLocaleString()}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                  </>
              )}
          </div>
      )}

      {/* 3. FUNDS (formerly Debt) TAB */}
      {activeTab === 'FUNDS' && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Add Fund Form */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-4">Add Fund Record</h3>
                      <div className="space-y-4">
                          <div className="flex bg-slate-100 p-1 rounded-lg">
                              <button 
                                onClick={() => setDebtType('Borrowed')}
                                className={`flex-1 py-2 rounded-md font-bold text-sm ${debtType === 'Borrowed' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
                              >
                                  I Borrowed
                              </button>
                              <button 
                                onClick={() => setDebtType('Lent')}
                                className={`flex-1 py-2 rounded-md font-bold text-sm ${debtType === 'Lent' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                              >
                                  I Lent
                              </button>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Person Name" 
                            value={debtPerson}
                            onChange={(e) => setDebtPerson(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                          />
                          <input 
                            type="number" 
                            placeholder="Amount (₹)" 
                            value={debtAmount}
                            onChange={(e) => setDebtAmount(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                          />
                          <button 
                            onClick={addDebt}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                          >
                              Add Record
                          </button>
                      </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-4">
                      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                          <p className="text-xs font-bold text-slate-500 uppercase">Total I Owe</p>
                          <p className="text-3xl font-bold text-red-600">₹{fundSummary.iBorrowed.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                          <p className="text-xs font-bold text-slate-500 uppercase">Total Owed To Me</p>
                          <p className="text-3xl font-bold text-emerald-600">₹{fundSummary.iLent.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
                          <p className="text-xs font-bold text-slate-400 uppercase">Net Position</p>
                          <p className="text-3xl font-bold">₹{(fundSummary.iLent - fundSummary.iBorrowed).toLocaleString()}</p>
                      </div>
                  </div>
              </div>

              {/* Debt List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                   <div className="p-4 border-b border-slate-100 font-bold text-slate-700">Active Fund Records</div>
                   <div className="divide-y divide-slate-100">
                       {data.debts.filter(d => d.status === 'Pending').map(d => (
                           <div key={d.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                               <div className="flex items-center gap-4">
                                   <div className={`p-2 rounded-lg ${d.type === 'Borrowed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                       {d.type === 'Borrowed' ? <TrendingUp className="rotate-180" size={20} /> : <TrendingUp size={20} />}
                                   </div>
                                   <div>
                                       <p className="font-bold text-slate-800">{d.person}</p>
                                       <p className="text-xs text-slate-500">{d.type} • {d.date}</p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-6">
                                   <span className="font-mono font-bold text-lg">₹{d.amount.toLocaleString()}</span>
                                   <button 
                                     onClick={() => toggleDebtStatus(d.id)}
                                     className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded uppercase"
                                   >
                                       Mark Settled
                                   </button>
                               </div>
                           </div>
                       ))}
                       {data.debts.filter(d => d.status === 'Pending').length === 0 && (
                           <div className="p-8 text-center text-slate-400">No active records.</div>
                       )}
                   </div>
              </div>
          </div>
      )}

      {/* 4. SETTINGS TAB */}
      {activeTab === 'SETTINGS' && (
          <div className="space-y-6">
              
              {/* Financial Goals Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Target size={18} className="text-indigo-600" /> Financial Goals & Balance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monthly Budget Goal (₹)</label>
                          <input 
                            type="number" 
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            placeholder="e.g. 20000"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono font-bold" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Total Balance (₹)</label>
                          <input 
                            type="number" 
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            placeholder="e.g. 50000"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono font-bold" 
                          />
                      </div>
                  </div>
                  <button 
                    onClick={saveFinancialSettings}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm"
                  >
                      Save Financial Profile
                  </button>
              </div>

              {/* Category Management */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Manage Categories</h3>
                  <div className="flex gap-2 mb-6">
                      <input 
                        type="text" 
                        placeholder="New Category Name"
                        value={newCat} 
                        onChange={(e) => setNewCat(e.target.value)}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                      />
                      <button 
                        onClick={addCategory}
                        className="px-6 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                      >
                          Add
                      </button>
                  </div>
                  <div className="space-y-2">
                      {data.categories.map(cat => (
                          <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="font-medium text-slate-700">{cat}</span>
                              <button onClick={() => deleteCategory(cat)} className="text-slate-400 hover:text-red-500">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Finance;