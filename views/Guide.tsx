import React from 'react';
import { Book, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

const Guide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Book className="text-indigo-300" />
          Documentation
        </h1>
        <p className="text-indigo-200 text-lg">Understanding the Auto-Update Technology & Dynamic Logic</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Zap className="text-amber-500" />
           The Core Technology: Dynamic State Management
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Just like the <code>INDIRECT()</code> function in the Excel version, this application uses a centralized state architecture. 
          When you update a habit name, category, or goal in the <strong>Setup</strong> tab, it instantly propagates to:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <li className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> All 12 Monthly Tracker Sheets
            </li>
            <li className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> The Dashboard & Charts
            </li>
            <li className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Analytics & Goal Views
            </li>
            <li className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Historical Data (Past & Future)
            </li>
        </ul>

        <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" />
                Corrected Streak Formulas
            </h3>
            <p className="text-slate-600 text-sm mb-4">
                This version implements the corrected logic for streak calculations:
            </p>
            <div className="space-y-3">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <p className="font-bold text-emerald-900 text-xs uppercase mb-1">Current Streak</p>
                    <p className="text-emerald-800 text-sm">
                        Calculates consecutive days ending today. If today is not checked yet, it checks yesterday. The streak is global across all months.
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="font-bold text-blue-900 text-xs uppercase mb-1">Best Streak</p>
                    <p className="text-blue-800 text-sm">
                        Scans your entire history to find the longest chain of consecutive completions ever recorded.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
         <h3 className="font-bold text-slate-800 mb-2">Quick Start Guide</h3>
         <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
            <li>Go to <strong>Setup</strong> to define your 16 habits.</li>
            <li>Use the <strong>Tracker Grid</strong> to log daily progress (click to toggle).</li>
            <li>Check the <strong>Dashboard</strong> for your "Detailed Monthly Analysis".</li>
            <li>Use <strong>Reflections</strong> to write monthly notes.</li>
         </ol>
      </div>
    </div>
  );
};

export default Guide;