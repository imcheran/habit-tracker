import React, { useMemo } from 'react';
import { Habit, TrackingData } from '../types';
import { getHabitYearlyStats } from '../utils/stats';

interface AnalyticsProps {
  habits: Habit[];
  data: TrackingData;
}

const Analytics: React.FC<AnalyticsProps> = ({ habits, data }) => {
  const currentYear = new Date().getFullYear();

  // 1. Goal Data Calculation
  const goalData = useMemo(() => {
    return habits.map(h => {
      const stats = getHabitYearlyStats(h, data, currentYear);
      // Use custom target consistency or default to 85 if not set (legacy support)
      const goalPct = h.targetConsistency || 85; 
      const currentPct = stats.yearlyAvg;
      const progress = goalPct > 0 ? (currentPct / goalPct) * 100 : 0;
      const gap = goalPct - currentPct;

      return {
        ...h,
        goalPct,
        currentPct,
        progress: Math.min(progress, 100),
        gap
      };
    });
  }, [habits, data, currentYear]);

  // 2. Deep Dive Data Calculation
  const analyticsData = useMemo(() => {
    return habits.map(h => ({
      ...h,
      stats: getHabitYearlyStats(h, data, currentYear)
    }));
  }, [habits, data, currentYear]);

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: GOAL SETTING & TRACKING (Manifestation) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wide">Goal Setting & Tracking</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-yellow-50 border-b border-yellow-100">
                <th className="p-4 text-xs font-bold text-yellow-900 uppercase">Habit</th>
                <th className="p-4 text-xs font-bold text-yellow-900 uppercase text-center">Goal %</th>
                <th className="p-4 text-xs font-bold text-yellow-900 uppercase text-center">Current %</th>
                <th className="p-4 text-xs font-bold text-yellow-900 uppercase w-1/3">Progress</th>
                <th className="p-4 text-xs font-bold text-yellow-900 uppercase text-center">Gap %</th>
              </tr>
            </thead>
            <tbody>
              {goalData.map((item, idx) => (
                <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </td>
                  <td className="p-4 text-center text-slate-700 font-mono">{item.goalPct}%</td>
                  <td className="p-4 text-center font-bold text-slate-800 font-mono">{item.currentPct}%</td>
                  <td className="p-4 align-middle">
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden relative shadow-inner">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                                item.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
                            {Math.round(item.progress)}%
                        </span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-slate-600 font-mono">
                    {item.gap > 0 ? (
                        <span className="text-red-500 font-bold">-{item.gap}%</span>
                    ) : (
                        <span className="text-emerald-500 font-bold">+{Math.abs(item.gap)}%</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: INDIVIDUAL HABIT DEEP-DIVE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wide">Individual Habit Deep-Dive Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-50 border-b border-indigo-100">
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase">Habit</th>
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase text-center">Yearly Avg %</th>
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase text-center">Best Month</th>
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase text-center">Total Days</th>
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase text-center">Grade</th>
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-bold text-indigo-900 uppercase">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((item, idx) => (
                <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </td>
                  <td className="p-4 text-center text-slate-700 font-mono">{item.stats.yearlyAvg}%</td>
                  <td className="p-4 text-center text-slate-700">{item.stats.bestMonth}</td>
                  <td className="p-4 text-center text-slate-700">{item.stats.totalCompletions}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      item.stats.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                      item.stats.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                      item.stats.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.stats.grade}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        item.stats.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' : 
                        item.stats.status === 'At Risk' ? 'bg-orange-50 text-orange-600' : 
                        'bg-red-50 text-red-600'
                     }`}>
                        {item.stats.status}
                     </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 italic">{item.stats.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;