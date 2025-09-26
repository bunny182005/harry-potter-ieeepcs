import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NavigationUI from './pages/NavigationUI';
import { onAuthChange, signOutUser } from './services/firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading Application...</div>
      </div>
    );
  }

  // Simplified render logic
  if (user) {
    return <NavigationUI user={user} onLogout={handleLogout} />;
  }

  // If no user, show authentication pages
  switch (currentPage) {
    case 'home':
      return <HomePage navigateTo={navigateTo} />;
    case 'login':
      return <LoginPage navigateTo={navigateTo} />;
    case 'signup':
      return <SignupPage navigateTo={navigateTo} onSignupSuccess={() => navigateTo('login')} />;
    case 'forgot-password':
      return <ForgotPasswordPage navigateTo={navigateTo} />;
    default:
      return <HomePage navigateTo={navigateTo} />;
  }
};

export default App;
