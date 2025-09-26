import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { users } from '../auth/credentials';

const AuthWrapper = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check login status on component mount
  useEffect(() => {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (!loginTimestamp) {
      setIsAuthenticated(false);
      return;
    }

    const savedDate = new Date(parseInt(loginTimestamp, 10));
    const currentDate = new Date();

    // Check if the login was on the same day
    if (savedDate.toDateString() === currentDate.toDateString()) {
      setIsAuthenticated(true);
    } else {
      // It's a different day, so log the user out
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loggedInUser');
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Login successful
      localStorage.setItem('loginTimestamp', Date.now().toString());
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      // Login failed
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  return (
    <>
      {/* This div wraps your main app and applies the blur when login is required */}
      <div 
        style={{
          transition: 'filter 0.3s ease-in-out',
          filter: isAuthenticated ? 'none' : 'blur(8px)',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>

      {/* The LoginModal is only rendered when the user is not authenticated */}
      {!isAuthenticated && (
        <LoginModal 
          open={!isAuthenticated} 
          onLogin={handleLogin} 
          error={loginError} 
        />
      )}
    </>
  );
};

export default AuthWrapper;

