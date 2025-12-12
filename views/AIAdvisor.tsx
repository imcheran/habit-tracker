import React, { useState, useMemo } from 'react';
import { Habit, TrackingData, DailyLogData, DailyEntry } from '../types';
import { calculateHabitStats } from '../utils/stats';
import { generateProductivityInsights, generateTrendAnalysis } from '../services/geminiService';
import { Bot, RefreshCw, Quote, AlertOctagon, Lightbulb, Microscope } from 'lucide-react';

interface AIAdvisorProps {
  habits: Habit[];
  data: TrackingData;
  dailyLogs: DailyLogData;
}

type Mode = 'HABIT_COACH' | 'DEEP_ANALYSIS';

const AIAdvisor: React.FC<AIAdvisorProps> = ({ habits, data, dailyLogs }) => {
  const [mode, setMode] = useState<Mode>('HABIT_COACH');
  const [insight, setInsight] = useState<string | null>(null);
  const [trendInsight, setTrendInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Trend Analysis State
  const [rangeType, setRangeType] = useState<'MONTH' | 'YEAR' | 'CUSTOM'>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Habit Coach Logic
  const stats = useMemo(() => {
    const s: any = {};
    habits.forEach(h => {
      s[h.id] = calculateHabitStats(h, data);
    });
    return s;
  }, [habits, data]);

  const handleGenerateCoach = async () => {
    setLoading(true);
    const result = await generateProductivityInsights(habits, data, stats);
    setInsight(result);
    setLoading(false);
  };

  // 2. Trend Analysis Logic
  const handleGenerateTrends = async () => {
     setLoading(true);
     let logsToAnalyze: DailyEntry[] = [];
     const currentYear = new Date().getFullYear();
     let label = '';
     
     const allLogs = Object.values(dailyLogs) as DailyEntry[];

     if (rangeType === 'MONTH') {
        label = `Month of ${new Date(currentYear, selectedMonth).toLocaleString('default', { month: 'long' })}`;
        logsToAnalyze = allLogs.filter(log => {
             const d = new Date(log.date);
             return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
        });
     } else if (rangeType === 'YEAR') {
        label = `Year ${currentYear}`;
        logsToAnalyze = allLogs.filter(log => new Date(log.date).getFullYear() === currentYear);
     } else if (rangeType === 'CUSTOM' && customStart && customEnd) {
        label = `${customStart} to ${customEnd}`;
        logsToAnalyze = allLogs.filter(log => {
            return log.date >= customStart && log.date <= customEnd;
        });
     }

     if (logsToAnalyze.length === 0) {
         setTrendInsight("No daily logs found for this period. Start logging in the Daily Journal to enable Deep Analysis.");
         setLoading(false);
         return;
     }

     const result = await generateTrendAnalysis(logsToAnalyze, habits, label);
     setTrendInsight(result);
     setLoading(false);
  };

  const renderCoachContent = (text: string) => {
    const sections = text.split(/\d\.\s\*\*(.*?)\*\*/).filter(Boolean);
    if (sections.length < 2) return <p className="whitespace-pre-line text-slate-700">{text}</p>;

    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
             <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                <Lightbulb size={18} /> Observation
             </h3>
             <p className="text-indigo-800 text-sm leading-relaxed">
                {text.match(/Observation.*?:?\n(.*?)(?=\n\d|$)/s)?.[1]?.trim() || "Analyzing data..."}
             </p>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
             <h3 className="font-bold text-orange-900 flex items-center gap-2 mb-2">
                <AlertOctagon size={18} /> Focus Area
             </h3>
             <p className="text-orange-800 text-sm leading-relaxed">
                {text.match(/Analysis.*?:?\n(.*?)(?=\n\d|$)/s)?.[1]?.trim() || "Identifying bottlenecks..."}
             </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl relative overflow-hidden">
             <Quote className="absolute -right-4 -bottom-4 text-emerald-200 w-32 h-32 opacity-20" />
             <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                <Bot size={18} /> Motivation
             </h3>
             <p className="text-emerald-800 font-medium text-lg italic leading-relaxed">
                "{text.match(/Motivation.*?:?\n(.*?)(?=$)/s)?.[1]?.trim().replace(/"/g, '') || "Keep going!"}"
             </p>
        </div>
      </div>
    );
  };

  const renderTrendContent = (text: string) => {
      return (
          <div className="prose prose-indigo max-w-none">
             {text.split('\n').map((line, i) => (
                 <p key={i} className={`mb-2 ${line.startsWith('#') ? 'font-bold text-lg text-indigo-900 mt-4 border-b border-indigo-100 pb-1' : 'text-slate-700'}`}>
                     {line.replace(/[#*]/g, '')}
                 </p>
             ))}
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with Tabs */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <SparklesIcon />
            Orbit AI Intelligence
        </h2>
        <div className="flex justify-center gap-4 bg-white p-1 rounded-full shadow-sm inline-flex border border-slate-200">
            <button 
                onClick={() => setMode('HABIT_COACH')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${mode === 'HABIT_COACH' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Habit Coach
            </button>
            <button 
                onClick={() => setMode('DEEP_ANALYSIS')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${mode === 'DEEP_ANALYSIS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Deep Correlations
            </button>
        </div>
      </div>

      {mode === 'HABIT_COACH' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 min-h-[300px] flex flex-col justify-center relative animate-fade-in">
             {!insight && !loading && (
                <div className="text-center">
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Generate a quick productivity audit based on your habit consistency and streaks.</p>
                    <button onClick={handleGenerateCoach} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2 mx-auto">
                        <Bot size={18} /> Audit My Habits
                    </button>
                </div>
             )}
             {loading && <LoadingSpinner />}
             {insight && !loading && (
                <div className="animate-fade-in">
                    {renderCoachContent(insight)}
                    <div className="mt-8 text-center">
                        <button onClick={handleGenerateCoach} className="text-sm text-slate-400 hover:text-indigo-600 flex items-center gap-1 mx-auto">
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                </div>
             )}
          </div>
      )}

      {mode === 'DEEP_ANALYSIS' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 min-h-[300px] flex flex-col relative animate-fade-in">
             
             {/* Controls */}
             <div className="flex flex-wrap items-center justify-center gap-4 mb-8 pb-8 border-b border-slate-100">
                 <select 
                    value={rangeType} 
                    onChange={(e) => setRangeType(e.target.value as any)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
                 >
                     <option value="MONTH">Specific Month</option>
                     <option value="YEAR">Whole Year</option>
                     <option value="CUSTOM">Custom Dates</option>
                 </select>

                 {rangeType === 'MONTH' && (
                     <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                     >
                        {Array.from({length: 12}).map((_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                     </select>
                 )}

                 {rangeType === 'CUSTOM' && (
                     <div className="flex gap-2">
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="p-2 bg-slate-50 border rounded-lg" />
                        <span className="self-center text-slate-400">to</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="p-2 bg-slate-50 border rounded-lg" />
                     </div>
                 )}

                 <button 
                    onClick={handleGenerateTrends}
                    disabled={loading || (rangeType === 'CUSTOM' && (!customStart || !customEnd))}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
                 >
                    <Microscope size={18} /> Analyze Correlations
                 </button>
             </div>

             {/* Output */}
             {loading && <LoadingSpinner label="Orbit is analyzing sleep schedules and performance..." />}
             {!loading && !trendInsight && (
                 <div className="text-center py-10 text-slate-400">
                     <Microscope size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Select a date range to find hidden correlations between<br/>your sleep start/end times and productivity.</p>
                 </div>
             )}
             {trendInsight && !loading && (
                 <div className="animate-fade-in bg-slate-50 p-6 rounded-xl border border-slate-200">
                     {renderTrendContent(trendInsight)}
                 </div>
             )}
          </div>
      )}
    </div>
  );
};

const LoadingSpinner = ({ label = "Crunching the numbers..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4 py-12">
    <RefreshCw className="animate-spin text-indigo-600" size={32} />
    <p className="text-slate-500 animate-pulse">{label}</p>
  </div>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

export default AIAdvisor;