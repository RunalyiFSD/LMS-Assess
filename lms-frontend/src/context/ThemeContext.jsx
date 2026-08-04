import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();

  // Initialize from localStorage, default to light
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // Apply/remove .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync from user settings on login
  useEffect(() => {
    if (user?.settings?.theme && (user.settings.theme === 'dark' || user.settings.theme === 'light')) {
      if (user.settings.theme !== theme) {
        setThemeState(user.settings.theme);
      }
    }
  }, [user]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    if (user) {
      api.put('/users/profile', {
        settings: { ...(user.settings || {}), theme: next },
      }).catch(() => {});
    }
  };

  const setTheme = (t) => {
    if (t === 'dark' || t === 'light') {
      setThemeState(t);
      if (user) {
        api.put('/users/profile', {
          settings: { ...(user.settings || {}), theme: t },
        }).catch(() => {});
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;
