// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

// Authentication Context
const AuthContext = React.createContext(null);

export const useAuth = () => {
  return React.useContext(AuthContext);
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
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
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    setLoading(false);
  }, []);

  // Auth functions
  const login = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Auth context value
  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  // Theme - Same as used in AngaTech components
  const theme = createTheme({
    palette: {
      primary: {
        main: '#4CAF50',
        light: '#e8f5e9',
        dark: '#388E3C',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
    },
  });

  // Custom route to protect dashboard route
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <AuthContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;