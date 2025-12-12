import React, { useState, useMemo } from 'react';
import { Habit, TrackingData } from '../types';
import { MONTH_NAMES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Star, AlertCircle } from 'lucide-react';
import { getGrade } from '../utils/stats';

interface MonthlyDashboardProps {
  habits: Habit[];
  data: TrackingData;
}

const MonthlyDashboard: React.FC<MonthlyDashboardProps> = ({ habits, data }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(new Date().getMonth());

  const handlePrev = () => setSelectedMonthIdx(prev => (prev > 0 ? prev - 1 : 11));
  const handleNext = () => setSelectedMonthIdx(prev => (prev < 11 ? prev + 1 : 0));

  const stats = useMemo(() => {
    const daysInMonth = new Date(currentYear, selectedMonthIdx + 1, 0).getDate();
    
    // Calculate stats per habit for this month
    const habitStats = habits.map(habit => {
        let completions = 0;
        for (let d = 1; d <= daysInMonth; d++) {
             const dateStr = `${currentYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
             if (data[dateStr]?.includes(habit.id)) completions++;
        }
        const pct = Math.round((completions / daysInMonth) * 100);
        return {
            name: habit.name,
            completions,
            pct,
            color: habit.color,
            category: habit.category
        };
    });

    const avgConsistency = Math.round(habitStats.reduce((sum, h) => sum + h.pct, 0) / habits.length);
    const bestHabit = [...habitStats].sort((a, b) => b.pct - a.pct)[0];
    const worstHabit = [...habitStats].sort((a, b) => a.pct - b.pct)[0];

    // Daily Trend
    const dailyTrend = [];
    for(let d=1; d<=daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const totalCompleted = data[dateStr]?.length || 0;
        const score = Math.round((totalCompleted / habits.length) * 100);
        dailyTrend.push({ day: d, score });
    }

    return {
        habitStats,
        avgConsistency,
        bestHabit,
        worstHabit,
        dailyTrend
    };
  }, [habits, data, selectedMonthIdx, currentYear]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronLeft /></button>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">{MONTH_NAMES[selectedMonthIdx]} {currentYear}</h2>
            <p className="text-sm text-slate-500 font-medium">Monthly Deep Dive</p>
        </div>
        <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronRight /></button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
            <span className="text-xs font-bold text-slate-500 uppercase mb-2">Month Grade</span>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-indigo-600">{getGrade(stats.avgConsistency)}</span>
                <span className="text-sm font-bold text-slate-400">{stats.avgConsistency}% Avg</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Top Performer</span>
                    <p className="font-bold text-slate-800 text-lg mt-1 truncate">{stats.bestHabit?.name}</p>
                </div>
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Star size={20} />
                </div>
            </div>
            <p className="text-emerald-600 font-bold mt-2 text-sm">{stats.bestHabit?.pct}% Consistency</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Needs Focus</span>
                    <p className="font-bold text-slate-800 text-lg mt-1 truncate">{stats.worstHabit?.name}</p>
                </div>
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <AlertCircle size={20} />
                </div>
            </div>
            <p className="text-red-600 font-bold mt-2 text-sm">{stats.worstHabit?.pct}% Consistency</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase mb-2">Trend</span>
            {stats.dailyTrend[stats.dailyTrend.length-1].score >= stats.dailyTrend[0].score ? (
                 <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp size={24} />
                    <span className="font-bold">Improving</span>
                 </div>
            ) : (
                <div className="flex items-center gap-2 text-orange-500">
                    <TrendingDown size={24} />
                    <span className="font-bold">Declining</span>
                 </div>
            )}
            <p className="text-xs text-slate-400 mt-1">First vs Last Day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 shrink-0">Daily Score Consistency</h3>
            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyTrend}>
                        <XAxis dataKey="day" tick={{fontSize: 10}} interval={2} />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {stats.dailyTrend.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#6366f1' : '#f59e0b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Habit Breakdown Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto custom-scrollbar">
             <h3 className="font-bold text-slate-800 mb-4">Habit Performance Ranking</h3>
             <div className="space-y-3">
                {stats.habitStats.sort((a,b) => b.pct - a.pct).map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 w-4">{i+1}.</span>
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: h.color}}></div>
                            <span className="truncate max-w-[120px]" title={h.name}>{h.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{width: `${h.pct}%`, backgroundColor: h.color}}></div>
                             </div>
                             <span className="font-bold text-slate-600 w-8 text-right">{h.pct}%</span>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDashboard;