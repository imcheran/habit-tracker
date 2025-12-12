
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, CalendarDays, BarChart2, Settings, Sparkles, Target, BookOpen, PieChart, Zap, Wallet, X } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Omni Dashboard', icon: LayoutDashboard },
    { id: ViewState.MONTHLY_DASHBOARD, label: 'Monthly Analysis', icon: PieChart },
    { id: ViewState.TRACKER, label: 'Tracker Grid', icon: CalendarDays },
    { id: ViewState.JOURNAL, label: 'Daily Journal', icon: BookOpen },
    { id: ViewState.FINANCE, label: 'Finance Manager', icon: Wallet },
    { id: ViewState.ANALYTICS, label: 'Habit Analytics', icon: BarChart2 },
    { id: ViewState.AI_COACH, label: 'Super-Brain AI', icon: Sparkles },
    { id: ViewState.SETTINGS, label: 'Setup', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap size={18} className="text-white fill-white" />
                </div>
                OmniLife
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest pl-10">Bio-Digital OS</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                    setView(item.id);
                    setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3 text-sm">
            <p className="text-slate-400 mb-1">System Status</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400 text-xs font-bold">Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
