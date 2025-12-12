import React, { useMemo } from 'react';
import { Habit, TrackingData } from '../types';
import { getHabitYearlyStats } from '../utils/stats';

interface GoalsProps {
  habits: Habit[];
  data: TrackingData;
}

const Goals: React.FC<GoalsProps> = ({ habits, data }) => {
  const goalData = useMemo(() => {
    return habits.map(h => {
      const stats = getHabitYearlyStats(h, data, new Date().getFullYear());
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
  }, [habits, data]);

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default Goals;