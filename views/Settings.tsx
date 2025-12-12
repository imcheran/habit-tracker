import React from 'react';
import HabitForm from '../components/HabitForm';
import { Habit, UserSettings, Chronotype, AppMode } from '../types';
import { CHRONOTYPES } from '../constants';
import { Clock, Sliders, Shield, Zap, Moon, Swords, Ghost } from 'lucide-react';

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
                        className={`p-6 rounded-xl border-2 text-left transition-all ${settings.mode === 'ZEN' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${settings.mode === 'ZEN' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <Ghost size={24} />
                            </div>
                            <span className="font-bold text-lg text-slate-800">Zen Mode</span>
                        </div>
                        <p className="text-sm text-slate-600">The Quantified Stoic. Minimalist data visualization, habit strength rings, and distraction-free journaling.</p>
                    </button>

                    <button 
                        onClick={() => updateMode('HERO')}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${settings.mode === 'HERO' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${settings.mode === 'HERO' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <Swords size={24} />
                            </div>
                            <span className="font-bold text-lg text-slate-800">Hero Mode</span>
                        </div>
                        <p className="text-sm text-slate-600">The Heroic Seeker. RPG gamification, HP/XP tracking, boss battles, and level-ups for habit consistency.</p>
                    </button>
                </div>
            </div>

            {/* Chronotype Selection */}
            <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 block">Biological Chronotype</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(CHRONOTYPES).map(([key, data]) => (
                        <button
                            key={key}
                            onClick={() => updateChronotype(key as Chronotype)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${settings.chronotype === key ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className="text-3xl mb-2">{data.icon}</div>
                            <div className="font-bold text-slate-800">{data.label}</div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-1">{data.description}</div>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Moon size={12} />
                    Used by the Super-Brain to calculate your Energy Peak Windows.
                </p>
            </div>
        </div>
      </div>

      {/* Productivity Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sliders size={20} className="text-indigo-600" />
            System Preferences
          </h2>
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Clock size={16} />
              Deep Work Session Duration
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={settings.deepWorkInterval}
                onChange={(e) => onUpdateSettings({...settings, deepWorkInterval: parseInt(e.target.value) || 0})}
                className="w-24 p-2 border border-slate-300 rounded-lg text-lg font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-slate-500 font-medium">minutes per block</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habit Configuration */}
      <div className="space-y-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Habit Configuration</h2>
            <p className="text-slate-500">Customize your habits, colors, and goals.</p>
         </div>
         <HabitForm habits={habits} onUpdate={onUpdateHabits} />
      </div>
    </div>
  );
};

export default Settings;