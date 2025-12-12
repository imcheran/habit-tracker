import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import MonthlyDashboard from './views/MonthlyDashboard';
import Tracker from './views/Tracker';
import AIAdvisor from './views/AIAdvisor';
import Analytics from './views/Analytics';
import Journal from './views/Journal';
import Settings from './views/Settings';
import Finance from './views/Finance';
import Auth from './views/Auth';
import { ViewState, Habit, TrackingData, DailyLogData, UserSettings, FinanceData, User } from './types';
import { DEFAULT_HABITS } from './constants';
import { Battery, BatteryCharging, Heart, Shield, Menu } from 'lucide-react';

// --- Authenticated App Component ---
// This contains the main logic, but is wrapped to ensure it re-mounts when user changes
interface AuthenticatedAppProps {
    user: User;
    onLogout: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Storage Keys with Username Prefix
  const KEYS = {
      HABITS: `user_${user.username}_habits`,
      DATA: `user_${user.username}_data`,
      LOGS: `user_${user.username}_daily_logs`,
      FINANCE: `user_${user.username}_finance`,
      SETTINGS: `user_${user.username}_settings`,
  };

  // State Initialization with LocalStorage (Scoped to User)
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(KEYS.HABITS);
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [trackingData, setTrackingData] = useState<TrackingData>(() => {
    const saved = localStorage.getItem(KEYS.DATA);
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLogData>(() => {
    const saved = localStorage.getItem(KEYS.LOGS);
    return saved ? JSON.parse(saved) : {};
  });

  const [financeData, setFinanceData] = useState<FinanceData>(() => {
      const saved = localStorage.getItem(KEYS.FINANCE);
      const parsed = saved ? JSON.parse(saved) : {};
      return { 
          expenses: parsed.expenses || [], 
          debts: parsed.debts || [], 
          categories: parsed.categories || ["Food", "Travel", "Rent", "Groceries", "Entertainment"],
          monthlyBudget: parsed.monthlyBudget || 10000,
          walletBalance: parsed.walletBalance || 50000
      };
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { 
        deepWorkInterval: 90,
        mode: 'HERO',
        chronotype: 'BEAR',
        heroStats: { hp: 100, maxHp: 100, xp: 0, level: 1, nextLevelXp: 500 }
    };
  });

  // Persistence Effects (Scoped to User)
  useEffect(() => {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
  }, [habits, KEYS.HABITS]);

  useEffect(() => {
    localStorage.setItem(KEYS.DATA, JSON.stringify(trackingData));
  }, [trackingData, KEYS.DATA]);

  useEffect(() => {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(dailyLogs));
  }, [dailyLogs, KEYS.LOGS]);

  useEffect(() => {
    localStorage.setItem(KEYS.FINANCE, JSON.stringify(financeData));
  }, [financeData, KEYS.FINANCE]);

  useEffect(() => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, KEYS.SETTINGS]);

  // Handler for checking/unchecking a habit with XP Logic
  const toggleHabit = (habitId: string, date: string) => {
    const currentDayData = trackingData[date] || [];
    const isCompleted = currentDayData.includes(habitId);
    const earnedXp = isCompleted ? -15 : 15; 
    
    setTrackingData(prev => {
      const dayList = prev[date] || [];
      let newData;
      if (isCompleted) {
        newData = dayList.filter(id => id !== habitId);
      } else {
        newData = [...dayList, habitId];
      }
      return { ...prev, [date]: newData };
    });

    if (settings.mode === 'HERO') {
        setSettings(prev => {
            let newXp = prev.heroStats.xp + earnedXp;
            let newLevel = prev.heroStats.level;
            let newNext = prev.heroStats.nextLevelXp;

            if (newXp >= newNext) {
                newXp = newXp - newNext;
                newLevel += 1;
                newNext = Math.round(newNext * 1.2);
            }
            if (newXp < 0) newXp = 0;

            return {
                ...prev,
                heroStats: {
                    ...prev.heroStats,
                    xp: newXp,
                    level: newLevel,
                    nextLevelXp: newNext
                }
            };
        });
    }
  };

  const calculateEnergy = () => {
    const today = new Date().toISOString().split('T')[0];
    const log = dailyLogs[today];
    if (!log) return 70;
    const score = Math.min(100, Math.round((log.sleepHours / 8) * 100));
    return score;
  };

  const energyLevel = calculateEnergy();

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard habits={habits} data={trackingData} settings={settings} logs={dailyLogs} />;
      case ViewState.MONTHLY_DASHBOARD:
        return <MonthlyDashboard habits={habits} data={trackingData} />;
      case ViewState.TRACKER:
        return <Tracker habits={habits} data={trackingData} onToggle={toggleHabit} />;
      case ViewState.ANALYTICS:
        return <Analytics habits={habits} data={trackingData} />;
      case ViewState.FINANCE:
        return <Finance data={financeData} onUpdate={setFinanceData} />;
      case ViewState.JOURNAL:
        return <Journal logs={dailyLogs} onUpdate={setDailyLogs} settings={settings} />;
      case ViewState.SETTINGS:
        return (
          <Settings 
             habits={habits} 
             onUpdateHabits={setHabits} 
             settings={settings}
             onUpdateSettings={setSettings}
          />
        );
      case ViewState.AI_COACH:
        return <AIAdvisor habits={habits} data={trackingData} dailyLogs={dailyLogs} />;
      default:
        return <Dashboard habits={habits} data={trackingData} settings={settings} logs={dailyLogs} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        username={user.username}
        onLogout={onLogout}
      />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {/* OmniLife HUD Header */}
        <header className="px-4 md:px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center justify-between w-full md:w-auto">
                 <div className="flex items-center gap-3">
                     {/* Mobile Hamburger */}
                     <button 
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                     >
                        <Menu size={24} />
                     </button>

                     <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight truncate">
                        {currentView.toLowerCase().replace('_', ' ')}
                     </h2>
                     {settings.mode === 'HERO' && (
                         <span className="hidden sm:inline px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wider whitespace-nowrap">Hero Mode</span>
                     )}
                 </div>
                 
                 {/* Mobile: Small Logo on right if needed, or empty */}
                 <div className="md:hidden w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-slate-100">
                    OM
                 </div>
             </div>

             <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto hide-scrollbar">
                 {/* Energy Battery */}
                 <div className="flex items-center gap-2 shrink-0" title="Daily Energy Capacity based on Sleep">
                     <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Energy</p>
                         <p className={`text-sm font-bold ${energyLevel > 80 ? 'text-emerald-500' : energyLevel > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{energyLevel}%</p>
                     </div>
                     {energyLevel > 80 ? <BatteryCharging size={24} className="text-emerald-500" /> : <Battery size={24} className={energyLevel < 40 ? "text-rose-500" : "text-amber-500"} />}
                 </div>

                 {/* Hero Stats HUD */}
                 {settings.mode === 'HERO' && (
                     <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 shrink-0">
                         {/* HP */}
                         <div className="flex items-center gap-2">
                             <Heart size={18} className="text-rose-500 fill-rose-500" />
                             <div className="w-16 md:w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-rose-500" style={{ width: `${(settings.heroStats.hp / settings.heroStats.maxHp) * 100}%` }}></div>
                             </div>
                         </div>
                         {/* XP */}
                         <div className="flex items-center gap-2">
                             <div className="relative">
                                 <Shield size={20} className="text-indigo-600" />
                                 <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-900 text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                                     {settings.heroStats.level}
                                 </span>
                             </div>
                             <div className="flex flex-col w-16 md:w-24">
                                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                     <div className="h-full bg-amber-400" style={{ width: `${(settings.heroStats.xp / settings.heroStats.nextLevelXp) * 100}%` }}></div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 <div className="hidden md:flex w-10 h-10 bg-slate-900 rounded-full items-center justify-center text-white font-bold shadow-lg border-2 border-slate-100 shrink-0">
                    OM
                 </div>
             </div>
        </header>

        <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// --- Main App Wrapper (Auth Handling) ---
const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('omni_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        localStorage.setItem('omni_current_user', JSON.stringify(loggedInUser));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('omni_current_user');
    };

    if (!user) {
        return <Auth onLogin={handleLogin} />;
    }

    // Keying by username forces a complete remount of AuthenticatedApp when user changes
    return <AuthenticatedApp key={user.username} user={user} onLogout={handleLogout} />;
};

export default App;