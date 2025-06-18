import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';

interface User {
  id: number;
  email: string;
}

type AuthState = 'login' | 'register' | 'dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing token on app load
  useEffect(() => {
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      // You could validate the token here with a backend call
      // For now, we'll assume it's valid if it exists
      setToken(existingToken);
      // Try to get user data from token or make an API call
      // For simplicity, we'll extract user info from localStorage
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUser(userData);
          setAuthState('dashboard');
        } catch (error) {
          // Invalid user data, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
    }
  }, []);

  const handleLogin = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setAuthState('dashboard');
  };

  const handleRegister = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setAuthState('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthState('login');
  };

  const switchToRegister = () => setAuthState('register');
  const switchToLogin = () => setAuthState('login');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh' }}>
        {authState === 'login' && (
          <LoginForm 
            onLogin={handleLogin}
            onSwitchToRegister={switchToRegister}
          />
        )}
        
        {authState === 'register' && (
          <RegisterForm 
            onRegister={handleRegister}
            onSwitchToLogin={switchToLogin}
          />
        )}
        
        {authState === 'dashboard' && user && token && (
          <Dashboard 
            user={user}
            token={token}
            onLogout={handleLogout}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
