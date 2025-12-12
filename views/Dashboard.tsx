import React, { useMemo } from 'react';
import { Habit, TrackingData, UserSettings, DailyLogData, DailyEntry } from '../types';
import { getDetailedMonthlyStats, getHabitYearlyStats } from '../utils/stats';
import { CHRONOTYPES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Trophy, Flame, AlertTriangle, CheckCircle2, TrendingUp, Zap, Clock, Moon } from 'lucide-react';

interface DashboardProps {
  habits: Habit[];
  data: TrackingData;
  settings?: UserSettings; // Made optional to support legacy props if needed
  logs?: DailyLogData;
}

const Dashboard: React.FC<DashboardProps> = ({ habits, data, settings, logs = {} }) => {
  const currentYear = new Date().getFullYear();
  
  // Advanced Stats Calculation
  const monthlyDetails = useMemo(() => getDetailedMonthlyStats(habits, data, currentYear), [habits, data, currentYear]);
  const habitStats = useMemo(() => habits.map(h => ({ ...h, ...getHabitYearlyStats(h, data, currentYear) })), [habits, data, currentYear]);

  // Key Insights Calculation
  const totalPossible = monthlyDetails.reduce((sum, m) => sum + m.totalPossible, 0);
  const yearlyAvg = monthlyDetails.length > 0 ? Math.round(monthlyDetails.reduce((sum, m) => sum + m.avgConsistency, 0) / monthlyDetails.length) : 0;
  const totalCompletions = monthlyDetails.reduce((sum, m) => sum + m.totalHabitsDone, 0);
  const bestMonth = [...monthlyDetails].sort((a, b) => b.avgConsistency - a.avgConsistency)[0];
  const successRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  // Bio-Insights (OmniLife)
  const chronoData = settings ? CHRONOTYPES[settings.chronotype] : CHRONOTYPES.BEAR;
  
  const sleepDebt = useMemo(() => {
     // Simple calculation: Avg of last 3 logs vs 8h target
     const entries = (Object.values(logs) as DailyEntry[]).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 3);
     if (entries.length === 0) return 0;
     const avgSleep = entries.reduce((acc, curr) => acc + curr.sleepHours, 0) / entries.length;
     return Math.round((8 - avgSleep) * 60); // Minutes
  }, [logs]);

  return (
    <div className="space-y-8">
      
      {/* 0. OmniLife Bio-Insights Deck */}
      {settings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chronotype Card */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="text-amber-400" size={20} />
                            <h3 className="font-bold uppercase tracking-wider text-sm text-indigo-200">Bio-Rhythm Peak</h3>
                        </div>
                        <p className="text-2xl font-bold mb-1">{chronoData.label} Chronotype</p>
                        <p className="opacity-80 text-sm mb-4">{chronoData.description}</p>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                            <Clock size={14} className="text-amber-400" />
                            <span className="font-mono text-sm font-bold">Deep Work Window Active</span>
                        </div>
                    </div>
                    <div className="text-6xl opacity-20 grayscale">{chronoData.icon}</div>
                </div>
            </div>

            {/* Sleep Debt Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Moon size={18} className="text-indigo-500" />
                            Sleep Debt Indicator
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Accumulated over last 3 days</p>
                    </div>
                    <span className={`text-2xl font-bold ${sleepDebt > 60 ? 'text-rose-500' : sleepDebt > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {sleepDebt > 0 ? `-${sleepDebt}m` : 'Balanced'}
                    </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${sleepDebt > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, 100 - (sleepDebt / 1.2)))}%` }} // Visual representation
                    ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                    {sleepDebt > 60 ? "Recovery Nap Recommended" : "Optimal cognitive function likely"}
                </p>
            </div>
        </div>
      )}

      {/* 1. Key Insights Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Yearly Average</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-800">{yearlyAvg}%</span>
                <span className="text-xs text-emerald-500 font-bold mb-1">A-</span>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Completions</p>
            <span className="text-2xl font-bold text-slate-800">{totalCompletions}</span>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Best Month</p>
            <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-slate-800 truncate">{bestMonth?.month.substring(0,3)}</span>
                <span className="text-xs text-emerald-600 font-bold mb-1">{bestMonth?.avgConsistency}%</span>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Success Rate</p>
            <span className="text-2xl font-bold text-indigo-600">{successRate}%</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 shrink-0">
            <TrendingUp size={20} className="text-indigo-600" />
            Monthly Completion Trend
          </h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyDetails}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickFormatter={(val) => val.substring(0, 3)} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Legend />
                <Line type="monotone" dataKey="avgConsistency" name="Completion Rate %" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Top Habits Analysis (Replicating Excel 'TOP HABITS') */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Top Habits Analysis
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-12 text-xs font-bold text-slate-400 uppercase pb-2 border-b border-slate-100">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Habit</div>
                <div className="col-span-2 text-right">Avg</div>
                <div className="col-span-2 text-center">Grade</div>
            </div>
            {habitStats.sort((a, b) => b.yearlyAvg - a.yearlyAvg).map((habit, idx) => (
              <div key={habit.id} className="grid grid-cols-12 items-center hover:bg-slate-50 p-2 rounded transition-colors">
                <div className="col-span-1">
                    <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                    </span>
                </div>
                <div className="col-span-7 font-medium text-slate-700 truncate pr-2 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }}></div>
                     {habit.name}
                </div>
                <div className="col-span-2 text-right font-mono text-sm font-bold text-indigo-600">{habit.yearlyAvg}%</div>
                <div className="col-span-2 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                         habit.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                         habit.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                         'bg-slate-100 text-slate-600'
                    }`}>
                        {habit.grade}
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;