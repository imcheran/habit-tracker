import { Habit } from './types';

export const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Morning Workout', category: 'Health', goalFrequency: 5, targetConsistency: 85, color: '#ef4444' },
  { id: '2', name: 'Read 30 Mins', category: 'Learning', goalFrequency: 7, targetConsistency: 90, color: '#f97316' },
  { id: '3', name: 'Deep Work (2h)', category: 'Productivity', goalFrequency: 5, targetConsistency: 80, color: '#f59e0b' },
  { id: '4', name: 'No Sugar', category: 'Health', goalFrequency: 6, targetConsistency: 95, color: '#84cc16' },
  { id: '5', name: 'Meditation', category: 'Mindfulness', goalFrequency: 7, targetConsistency: 100, color: '#10b981' },
  { id: '6', name: 'Track Expenses', category: 'Finance', goalFrequency: 7, targetConsistency: 90, color: '#06b6d4' },
  { id: '7', name: 'Drink 3L Water', category: 'Health', goalFrequency: 7, targetConsistency: 100, color: '#3b82f6' },
  { id: '8', name: 'Sleep by 11PM', category: 'Health', goalFrequency: 7, targetConsistency: 85, color: '#6366f1' },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const CATEGORY_COLORS = {
  Health: 'bg-red-100 text-red-800',
  Productivity: 'bg-blue-100 text-blue-800',
  Mindfulness: 'bg-purple-100 text-purple-800',
  Finance: 'bg-green-100 text-green-800',
  Learning: 'bg-orange-100 text-orange-800',
  Other: 'bg-gray-100 text-gray-800'
};

export const CHRONOTYPES = {
  LION: { label: 'Lion', description: 'Early riser, peak energy 8am-12pm', icon: '🦁' },
  BEAR: { label: 'Bear', description: 'Solar cycle, peak energy 10am-2pm', icon: '🐻' },
  WOLF: { label: 'Wolf', description: 'Night owl, peak energy 5pm-12am', icon: '🐺' },
  DOLPHIN: { label: 'Dolphin', description: 'Light sleeper, erratic energy', icon: '🐬' }
};