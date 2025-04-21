// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for authentication on app load
  useEffect(() => {
    // Check if user is stored in localStorage
    const isAuth = localStorage.getItem('isAuthenticated');
    const userStr = localStorage.getItem('user');
    
    if (isAuth === 'true' && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setUserData(user); // For simplicity, we'll use the same data for userData
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
    setUserData(userData);
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserData(null);
  };

  // Auth context value
  const value = {
    currentUser,
    userData,
    login,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;