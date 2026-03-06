
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { MOCK_USERS } from '../services/mockDatabase';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate auth delay
    setTimeout(() => {
      let foundUser: User | undefined;
      
      if (email.includes('driver')) {
        foundUser = MOCK_USERS[0];
      } else if (email.includes('student')) {
        foundUser = MOCK_USERS[1];
      }

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('Invalid credentials. Use "driver@college.com" or "student@college.com"');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">UniTrack</h2>
          <p className="text-slate-500 mt-2">College Bus Real-time Tracking System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g., student@college.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-lg"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Quick Demo Login</p>
          <div className="flex justify-center space-x-4 mt-3">
            <button onClick={() => setEmail('driver@college.com')} className="text-xs bg-slate-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 text-slate-600 transition">Driver Mode</button>
            <button onClick={() => setEmail('student@college.com')} className="text-xs bg-slate-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 text-slate-600 transition">Student Mode</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
