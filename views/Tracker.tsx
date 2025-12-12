import React, { useState } from 'react';
import { Habit, TrackingData } from '../types';
import { MONTH_NAMES } from '../constants';
import { calculateHabitStats } from '../utils/stats';
import { ChevronLeft, ChevronRight, Check, Flame, Trophy } from 'lucide-react';

interface TrackerProps {
  habits: Habit[];
  data: TrackingData;
  onToggle: (habitId: string, date: string) => void;
}

const Tracker: React.FC<TrackerProps> = ({ habits, data, onToggle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to get formatted date string
  const getDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Calculate daily score
  const getDailyScore = (day: number) => {
    const dateStr = getDateStr(day);
    const completedCount = data[dateStr]?.length || 0;
    return Math.round((completedCount / habits.length) * 100);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {MONTH_NAMES[month]} <span className="text-slate-400 font-normal">{year}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* The Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-200 p-3 min-w-[200px] text-left text-xs font-bold text-slate-500 uppercase tracking-wider shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                Habit Name
              </th>
              {daysArray.map(day => {
                 const date = new Date(year, month, day);
                 const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                 const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                 
                 return (
                  <th key={day} className={`min-w-[36px] w-[36px] p-1 text-center border-b border-slate-200 text-xs ${isWeekend ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-700'}`}>
                    <div className="font-bold">{day}</div>
                    <div className="opacity-50 font-normal">{dayName}</div>
                  </th>
                );
              })}
              <th className="min-w-[60px] p-2 text-center border-b border-l border-slate-200 bg-green-50 text-xs font-bold text-green-700">Cons. %</th>
              <th className="min-w-[70px] p-2 text-center border-b border-l border-slate-200 bg-amber-50 text-xs font-bold text-amber-700">Streak</th>
              <th className="min-w-[70px] p-2 text-center border-b border-l border-slate-200 bg-orange-50 text-xs font-bold text-orange-700">Best</th>
              <th className="min-w-[80px] p-2 text-center border-b border-l border-slate-200 bg-purple-50 text-xs font-bold text-purple-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
               // Calculate monthly % for this habit
               let habitMonthCount = 0;
               daysArray.forEach(d => {
                   if (data[getDateStr(d)]?.includes(habit.id)) habitMonthCount++;
               });
               const habitMonthPct = Math.round((habitMonthCount / daysInMonth) * 100);
               
               // Get Global Stats for Streak/Best/Status
               const stats = calculateHabitStats(habit, data, year);

               return (
                <tr key={habit.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-b border-slate-200 p-3 text-sm font-medium text-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }}></span>
                      {habit.name}
                    </div>
                  </td>
                  {daysArray.map(day => {
                    const dateStr = getDateStr(day);
                    const isCompleted = data[dateStr]?.includes(habit.id);
                    const date = new Date(year, month, day);
                    const isToday = new Date().toDateString() === date.toDateString();
                    
                    return (
                      <td 
                        key={`${habit.id}-${day}`} 
                        onClick={() => onToggle(habit.id, dateStr)}
                        className={`border-b border-slate-100 text-center cursor-pointer transition-all duration-200 relative
                          ${isToday ? 'bg-indigo-50' : ''}
                          hover:bg-indigo-50
                        `}
                      >
                        <div className={`
                          w-6 h-6 mx-auto rounded flex items-center justify-center transition-all duration-300
                          ${isCompleted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                        `}
                        style={{ backgroundColor: isCompleted ? habit.color : 'transparent' }}
                        >
                          <Check size={14} className="text-white" strokeWidth={4} />
                        </div>
                      </td>
                    );
                  })}
                  <td className="border-b border-l border-slate-200 text-center text-xs font-bold text-green-700 bg-green-50/50">
                    {habitMonthPct}%
                  </td>
                  <td className="border-b border-l border-slate-200 text-center text-xs font-bold text-amber-700 bg-amber-50/50">
                    <div className="flex items-center justify-center gap-1">
                      {stats.currentStreak > 0 && (
                        <Flame 
                          size={14} 
                          className={`${stats.currentStreak > 3 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-amber-400 fill-amber-400'}`} 
                        />
                      )}
                      {stats.currentStreak}
                    </div>
                  </td>
                  <td className="border-b border-l border-slate-200 text-center text-xs font-bold text-orange-700 bg-orange-50/50">
                    <div className="flex items-center justify-center gap-1">
                       <Trophy size={14} className="text-orange-400 fill-orange-400 opacity-50" />
                       {stats.bestStreak}
                    </div>
                  </td>
                  <td className="border-b border-l border-slate-200 text-center text-[10px] font-bold text-purple-700 bg-purple-50/50 uppercase tracking-tight">
                    {stats.status}
                  </td>
                </tr>
              );
            })}
            {/* Daily Score Row */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <td className="sticky left-0 z-10 bg-slate-100 border-r border-slate-300 p-3 text-xs uppercase tracking-wider text-slate-500 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                Daily Score
              </td>
              {daysArray.map(day => {
                 const score = getDailyScore(day);
                 let colorClass = 'text-slate-400';
                 if (score >= 80) colorClass = 'text-emerald-600';
                 else if (score >= 50) colorClass = 'text-indigo-600';
                 else if (score > 0) colorClass = 'text-orange-500';

                 return (
                  <td key={`score-${day}`} className={`text-center text-[10px] border-r border-slate-200 py-2 ${colorClass}`}>
                    {score > 0 ? `${score}%` : '-'}
                  </td>
                );
              })}
              <td colSpan={4} className="bg-slate-100"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tracker;