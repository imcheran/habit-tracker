import React, { useState, useMemo } from 'react';
import { DailyEntry, DailyLogData, UserSettings } from '../types';
import { generateOrbitAnalysis } from '../services/geminiService';
import { 
  Calendar, Moon, Activity, Brain, Smile, 
  BookOpen, Save, Sparkles, Utensils, Droplets, Flame, 
  ChevronLeft, ChevronRight, Clock, Battery, Zap
} from 'lucide-react';

interface JournalProps {
  logs: DailyLogData;
  onUpdate: (logs: DailyLogData) => void;
  settings: UserSettings;
}

// Helper for time calculation
const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let startMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;
    if (endMin < startMin) endMin += 24 * 60; 
    const diffMins = endMin - startMin;
    return parseFloat((diffMins / 60).toFixed(1));
};

const Journal: React.FC<JournalProps> = ({ logs, onUpdate, settings }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize entry or load existing
  const entry: DailyEntry = useMemo(() => logs[date] || {
    date,
    wakeTime: '07:00',
    sleepTime: '23:00',
    sleepHours: 8,
    steps: 0,
    exerciseMinutes: 0,
    exerciseType: '',
    waterLiters: 0,
    mealsQuality: 3,
    caffeineServings: 1,
    screenTime: 2,
    mood: 'Neutral',
    moodIntensity: 5,
    stressLevel: 3,
    energyLevel: 5,
    socialScore: 3,
    deepWorkBlocks: 0,
    shallowWorkHours: 0,
    tasksPlanned: '',
    tasksCompleted: '',
    focusScore: 5,
    distractions: '',
    learningMinutes: 0,
    learningNotes: '',
    skillImproved: '',
    highlight: '',
    challenge: '',
    wins: '',
    improvements: '',
    gratitude: '',
    summary: '',
    nutritionLog: '',
    tomorrowPriorities: '',
    firstAction: '',
    obstacles: '',
    healthScore: 0,
    productivityScore: 0,
    mindScore: 0,
    dayScore: 0,
  }, [logs, date]);

  const updateEntry = (field: keyof DailyEntry, value: any) => {
    const updated = { ...entry, [field]: value };
    
    // Auto-calculate scores
    if (['sleepHours', 'steps', 'exerciseMinutes', 'waterLiters', 'mealsQuality'].includes(field)) {
       updated.healthScore = Math.min(100, Math.round(
         (updated.sleepHours / 8 * 30) + 
         (Math.min(updated.steps, 10000) / 10000 * 20) + 
         (Math.min(updated.exerciseMinutes, 60) / 60 * 20) + 
         (Math.min(updated.waterLiters, 3) / 3 * 15) + 
         (updated.mealsQuality / 5 * 15)
       ));
    }
    if (['deepWorkBlocks', 'focusScore', 'tasksCompleted'].includes(field)) {
        updated.productivityScore = Math.min(100, Math.round(
            (Math.min(updated.deepWorkBlocks, 4) / 4 * 40) +
            (updated.focusScore / 10 * 30) + 
            (30) // Baseline
        ));
    }
    if (['moodIntensity', 'stressLevel', 'energyLevel'].includes(field)) {
        // Updated mind score to weigh energy heavily since stress is hidden
        updated.mindScore = Math.min(100, Math.round(
            (updated.moodIntensity * 3) + 
            (updated.energyLevel * 7) // Heavy weighting on energy
        ));
    }
    updated.dayScore = Math.round((updated.healthScore + updated.productivityScore + updated.mindScore) / 3);

    onUpdate({ ...logs, [date]: updated });
  };

  const handleTimeChange = (field: 'sleepTime' | 'wakeTime', value: string) => {
      const sTime = field === 'sleepTime' ? value : entry.sleepTime;
      const wTime = field === 'wakeTime' ? value : entry.wakeTime;
      const duration = calculateDuration(sTime, wTime);

      const updated = { 
          ...entry, 
          [field]: value,
          sleepHours: duration
      };

      // Recalculate Health Score
      updated.healthScore = Math.min(100, Math.round(
         (updated.sleepHours / 8 * 30) + 
         (Math.min(updated.steps, 10000) / 10000 * 20) + 
         (Math.min(updated.exerciseMinutes, 60) / 60 * 20) + 
         (Math.min(updated.waterLiters, 3) / 3 * 15) + 
         (updated.mealsQuality / 5 * 15)
       ));
      
      // Update Day Score
      updated.dayScore = Math.round((updated.healthScore + updated.productivityScore + updated.mindScore) / 3);

      onUpdate({ ...logs, [date]: updated });
  };

  const handleDateChange = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const analysis = await generateOrbitAnalysis(entry, [], []); 
    updateEntry('aiResponse', analysis);
    setLoading(false);
  };

  // Calculate deep work hours based on settings
  const deepWorkTotalHours = ((entry.deepWorkBlocks * settings.deepWorkInterval) / 60).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Enhanced Date Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <BookOpen size={24} />
             </div>
             <div>
                 <h2 className="text-xl font-bold text-slate-800">Daily Journal</h2>
                 <p className="text-xs text-slate-500">Track biometrics, focus, and reflections.</p>
             </div>
        </div>
        
        {/* Central Date Picker */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 shadow-inner">
            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white hover:shadow rounded-md transition-all text-slate-500 hover:text-indigo-600">
                <ChevronLeft size={20} />
            </button>
            
            <div className="relative group px-2 cursor-pointer">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                    <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors select-none">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                {/* Invisible Date Input Overlay */}
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
            </div>

            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white hover:shadow rounded-md transition-all text-slate-500 hover:text-indigo-600">
                <ChevronRight size={20} />
            </button>
        </div>

        <button 
           onClick={handleSave}
           className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${saving ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'}`}
        >
           <Save size={18} />
           {saving ? 'Saved' : 'Save Entry'}
        </button>
      </div>

      {/* Main Grid: 3 Columns for Metrics/AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* COLUMN 1: SLEEP & HEALTH */}
         <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <Moon size={18} className="text-indigo-500" /> Sleep Schedule
                    <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Duration: {entry.sleepHours}h</span>
                </h3>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                <Clock size={12} /> Bedtime
                            </label>
                            <input 
                                type="time" 
                                value={entry.sleepTime} 
                                onChange={(e) => handleTimeChange('sleepTime', e.target.value)} 
                                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none text-lg" 
                            />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                <Clock size={12} /> Wake Up
                            </label>
                            <input 
                                type="time" 
                                value={entry.wakeTime} 
                                onChange={(e) => handleTimeChange('wakeTime', e.target.value)} 
                                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none text-lg" 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Quality & Duration</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="range" min="0" max="12" step="0.5" 
                                value={entry.sleepHours} 
                                onChange={(e) => updateEntry('sleepHours', parseFloat(e.target.value))} 
                                className="flex-1 accent-indigo-500"
                            />
                            <span className="font-bold text-indigo-600 w-12 text-right">{entry.sleepHours}h</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <Activity size={18} className="text-rose-500" /> Vitals & Nutrition
                </h3>
                
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Steps</label>
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                <Flame size={16} className="text-orange-400" />
                                <input type="number" value={entry.steps} onChange={(e) => updateEntry('steps', parseInt(e.target.value))} className="w-full bg-transparent font-bold text-slate-700 focus:outline-none" />
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Water (L)</label>
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                <Droplets size={16} className="text-blue-400" />
                                <input type="number" step="0.5" value={entry.waterLiters} onChange={(e) => updateEntry('waterLiters', parseFloat(e.target.value))} className="w-full bg-transparent font-bold text-slate-700 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                             <Utensils size={14} /> Nutrition Log
                        </label>
                        <textarea 
                           placeholder="Breakfast: Oatmeal, Lunch: Salad..." 
                           value={entry.nutritionLog} 
                           onChange={(e) => updateEntry('nutritionLog', e.target.value)}
                           className="w-full bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                    </div>
                </div>
            </div>
         </div>

         {/* COLUMN 2: PRODUCTIVITY & ENERGY */}
         <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <Brain size={18} className="text-indigo-500" /> Productivity
                    <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Score: {entry.productivityScore}</span>
                </h3>
                
                <div className="space-y-5">
                     <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <p className="text-xs text-indigo-800 font-bold uppercase">Deep Work Blocks</p>
                                 <p className="text-[10px] text-indigo-500 font-medium">{settings.deepWorkInterval} min sessions</p>
                             </div>
                             <span className="text-2xl font-bold text-indigo-900">{deepWorkTotalHours}h</span>
                         </div>
                         <div className="flex items-center gap-4 bg-white/50 p-2 rounded-lg justify-center">
                             <button onClick={() => updateEntry('deepWorkBlocks', Math.max(0, entry.deepWorkBlocks - 1))} className="w-8 h-8 rounded-full bg-white text-indigo-600 border border-indigo-200 font-bold hover:bg-indigo-100 transition shadow-sm">-</button>
                             <span className="text-xl font-bold text-slate-800 w-8 text-center">{entry.deepWorkBlocks}</span>
                             <button onClick={() => updateEntry('deepWorkBlocks', entry.deepWorkBlocks + 1)} className="w-8 h-8 rounded-full bg-white text-indigo-600 border border-indigo-200 font-bold hover:bg-indigo-100 transition shadow-sm">+</button>
                         </div>
                     </div>

                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tasks Completed</label>
                         <textarea 
                            placeholder="- Finished Q3 Report&#10;- Cleared Inbox&#10;- Team Meeting" 
                            value={entry.tasksCompleted} 
                            onChange={(e) => updateEntry('tasksCompleted', e.target.value)}
                            className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:border-indigo-300"
                         />
                     </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <Zap size={18} className="text-amber-500" /> Energy Levels
                </h3>
                
                <div className="space-y-6">
                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Current Energy</label>
                             <span className="text-lg font-bold text-amber-500">{entry.energyLevel}/10</span>
                         </div>
                         <input 
                            type="range" min="1" max="10" 
                            value={entry.energyLevel} 
                            onChange={(e) => updateEntry('energyLevel', parseInt(e.target.value))} 
                            className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                         />
                         <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold uppercase">
                            <span>Drained</span>
                            <span>Charged</span>
                         </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">General Mood</label>
                        <select 
                            value={entry.mood} 
                            onChange={(e) => updateEntry('mood', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-amber-300"
                        >
                             <option value="Neutral">Neutral</option>
                             <option value="Happy">Happy / Content</option>
                             <option value="Focused">Focused / Flow</option>
                             <option value="Energetic">Energetic</option>
                             <option value="Tired">Tired / Drained</option>
                             <option value="Anxious">Anxious</option>
                             <option value="Frustrated">Frustrated</option>
                        </select>
                    </div>
                </div>
            </div>
         </div>

         {/* COLUMN 3: ORBIT AI ANALYSIS */}
         <div className="space-y-6 flex flex-col">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl shadow-lg text-white flex-1 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold flex items-center gap-2 text-indigo-100 text-lg">
                        <Sparkles size={20} className="text-indigo-400" /> Orbit AI
                     </h3>
                     <button 
                        onClick={handleAnalyze} 
                        disabled={loading}
                        className="text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-500/50 px-4 py-2 rounded-full disabled:opacity-50 transition font-bold"
                     >
                        {loading ? 'Processing...' : 'Analyze Day'}
                     </button>
                 </div>
                 
                 <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4 shadow-inner overflow-hidden flex flex-col">
                     {entry.aiResponse ? (
                        <div className="text-sm leading-relaxed text-indigo-50 overflow-y-auto custom-scrollbar pr-2">
                             {entry.aiResponse.split('\n').map((line, i) => (
                                 <p key={i} className={`mb-3 ${line.startsWith('#') ? 'font-bold text-white mt-4 border-b border-white/10 pb-1' : 'opacity-90'}`}>
                                     {line.replace(/[#*]/g, '')}
                                 </p>
                             ))}
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-indigo-300/40 italic p-4">
                            <Sparkles size={32} className="mb-3 opacity-20" />
                            <p>Tap Analyze to detect correlations between your sleep, energy, and productivity.</p>
                        </div>
                     )}
                 </div>
            </div>
         </div>
      </div>

      {/* Row 2: REFLECTION (Full Width) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                <BookOpen size={20} className="text-slate-600" /> Daily Reflection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Left Column */}
                 <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Daily Highlight</label>
                        <input 
                            type="text" 
                            placeholder="The best part of today..." 
                            value={entry.highlight}
                            onChange={(e) => updateEntry('highlight', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gratitude Log</label>
                        <textarea 
                            placeholder="I am grateful for..."
                            value={entry.gratitude}
                            onChange={(e) => updateEntry('gratitude', e.target.value)}
                            className="w-full h-32 p-3 bg-amber-50/30 border border-amber-100 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-100 placeholder-amber-400/50"
                        />
                    </div>
                 </div>
                 {/* Right Column */}
                 <div className="flex flex-col h-full">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Deep Journaling</label>
                    <textarea 
                        placeholder="What went well? What could be better? Unload your thoughts..."
                        value={entry.summary}
                        onChange={(e) => updateEntry('summary', e.target.value)}
                        className="w-full flex-1 min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-300 transition-colors leading-relaxed"
                    />
                 </div>
            </div>
      </div>
    </div>
  );
};

export default Journal;