import React from 'react';
import { Habit } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Plus, Trash2 } from 'lucide-react';

interface HabitFormProps {
  habits: Habit[];
  onUpdate: (habits: Habit[]) => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ habits, onUpdate }) => {
  const handleChange = (id: string, field: keyof Habit, value: any) => {
    const updated = habits.map(h => h.id === id ? { ...h, [field]: value } : h);
    onUpdate(updated);
  };

  const addHabit = () => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: 'New Habit',
      category: 'Other',
      goalFrequency: 7,
      targetConsistency: 85,
      color: '#94a3b8'
    };
    onUpdate([...habits, newHabit]);
  };

  const removeHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit? All tracking data for it will remain but it will disappear from lists.')) {
      onUpdate(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Habit Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Days/Wk</th>
                <th className="px-6 py-4">Goal %</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {habits.map((habit, idx) => (
                <tr key={habit.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={habit.name}
                      onChange={(e) => handleChange(habit.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none py-1 font-medium text-slate-900"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={habit.category}
                      onChange={(e) => handleChange(habit.id, 'category', e.target.value)}
                      className="bg-transparent focus:outline-none text-slate-700"
                    >
                      {Object.keys(CATEGORY_COLORS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={habit.goalFrequency}
                      onChange={(e) => handleChange(habit.id, 'goalFrequency', parseInt(e.target.value))}
                      className="w-16 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none py-1"
                    />
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={habit.targetConsistency || 85}
                          onChange={(e) => handleChange(habit.id, 'targetConsistency', parseInt(e.target.value))}
                          className="w-12 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none py-1 text-right"
                        />
                        <span>%</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                      <input 
                          type="color" 
                          value={habit.color}
                          onChange={(e) => handleChange(habit.id, 'color', e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => removeHabit(habit.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Habit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <button 
        onClick={addHabit}
        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
      >
        <Plus size={20} />
        Add New Habit
      </button>
    </div>
  );
};

export default HabitForm;