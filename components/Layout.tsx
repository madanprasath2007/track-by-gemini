
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onLogout, userName }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm font-medium opacity-90">Hi, {userName}</span>
            <button 
              onClick={onLogout}
              className="bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold py-1.5 px-4 rounded-md transition duration-150 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;
