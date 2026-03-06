
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginScreen from './screens/LoginScreen';
import DriverScreen from './screens/DriverScreen';
import StudentScreen from './screens/StudentScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('unitrack_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('unitrack_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('unitrack_user');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      {currentUser.role === UserRole.DRIVER ? (
        <DriverScreen user={currentUser} onLogout={handleLogout} />
      ) : (
        <StudentScreen user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;
