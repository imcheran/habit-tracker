import React from 'react';
import HabitForm from '../components/HabitForm';
import { Habit, UserSettings, Chronotype, AppMode } from '../types';
import { CHRONOTYPES } from '../constants';
import { Clock, Sliders, Zap, Moon, Swords, Ghost } from 'lucide-react';

interface SettingsProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ habits, onUpdateHabits, settings, onUpdateSettings }) => {
  
  const updateMode = (mode: AppMode) => {
    onUpdateSettings({ ...settings, mode });
  };

  const updateChronotype = (chronotype: Chronotype) => {
    onUpdateSettings({ ...settings, chronotype });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* OmniLife Core Identity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap size={24} className="text-amber-400" />
            OmniLife Core System
          </h2>
          <p className="text-indigo-200 text-sm">Configure your biological and digital profile.</p>
        </div>
        
        <div className="p-8 space-y-8">
            {/* Mode Selection */}
            <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 block">Interface Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => updateMode('ZEN')}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${settings.mode === 'ZEN' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold ${settings.mode === 'ZEN' ? 'text-emerald-700' : 'text-slate-700'}`}>ZEN Mode</span>
                            <Ghost size={20} className={settings.mode === 'ZEN' ? 'text-emerald-500' : 'text-slate-300'} />
                        </div>
                        <p className="text-xs text-slate-500">Minimalist interface. Focus on mindfulness, reflection, and steady progress. No gamification elements.</p>
                    </button>

                    <button 
                        onClick={() => updateMode('HERO')}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${settings.mode === 'HERO' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold ${settings.mode === 'HERO' ? 'text-indigo-700' : 'text-slate-700'}`}>HERO Mode</span>
                            <Swords size={20} className={settings.mode === 'HERO' ? 'text-indigo-500' : 'text-slate-300'} />
                        </div>
                        <p className="text-xs text-slate-500">Gamified experience. Earn XP, level up, and track HP based on habit consistency. High intensity.</p>
                    </button>
                </div>
            </div>

            {/* Chronotype Selection */}
            <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 block flex items-center gap-2">
                    <Clock size={16} /> Bio-Rhythm Chronotype
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.keys(CHRONOTYPES) as Chronotype[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => updateChronotype(type)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${settings.chronotype === type ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className="text-2xl mb-2">{CHRONOTYPES[type].icon}</div>
                            <div className="font-bold text-sm text-slate-700">{CHRONOTYPES[type].label}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{CHRONOTYPES[type].description.split(',')[0]}</div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Deep Work Interval */}
            <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 block flex items-center gap-2">
                    <Moon size={16} /> Deep Work Configuration
                </label>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                             <span className="font-bold text-slate-700 block">Focus Block Duration</span>
                             <span className="text-xs text-slate-500">Length of one deep work session in minutes.</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="15" 
                                max="120" 
                                step="15" 
                                value={settings.deepWorkInterval}
                                onChange={(e) => onUpdateSettings({...settings, deepWorkInterval: parseInt(e.target.value)})}
                                className="w-48 accent-indigo-600"
                            />
                            <span className="font-mono font-bold text-indigo-600 w-16 text-right">{settings.deepWorkInterval}m</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Habit Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Sliders size={20} className="text-slate-500" />
            Habit Protocols
          </h2>
          <p className="text-slate-500 text-sm">Define the behaviors you want to install.</p>
        </div>
        <div className="p-6">
             <HabitForm habits={habits} onUpdate={onUpdateHabits} />
        </div>
      </div>
    </div>
  );
};

export default Settings;