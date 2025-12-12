import React, { useState } from 'react';
import { Zap, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateUsername = (name: string) => {
    // Regex: Lowercase letters and numbers only, no spaces
    const regex = /^[a-z0-9]+$/;
    return regex.test(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateUsername(username)) {
      setError('Username must be lowercase letters/numbers only. No spaces or symbols.');
      return;
    }

    // Load existing users from LocalStorage
    const usersStr = localStorage.getItem('omni_users');
    const users: Record<string, User> = usersStr ? JSON.parse(usersStr) : {};

    if (isLogin) {
      // LOGIN LOGIC
      const user = users[username];
      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError('Invalid username or password.');
      }
    } else {
      // SIGNUP LOGIC
      if (users[username]) {
        setError('Username already exists. Please choose another.');
        return;
      }

      const newUser: User = {
        username,
        password, // Storing simply for this local demo
        createdAt: new Date().toISOString()
      };

      users[username] = newUser;
      localStorage.setItem('omni_users', JSON.stringify(users));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full flex flex-col md:flex-row">
        
        {/* Form Section */}
        <div className="p-8 w-full">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">OmniLife</h1>
          </div>

          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Profile'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isLogin 
              ? 'Enter your credentials to access your bio-digital OS.' 
              : 'Setup your secure identity. No spaces or capitals.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="e.g. johndoe"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">Lowercase, no spaces.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
                <ShieldCheck size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? 'Login System' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium underline"
            >
              {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
