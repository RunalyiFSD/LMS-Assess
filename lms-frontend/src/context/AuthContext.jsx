import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session data on initial render
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.status === 'success') {
          setUser(response.data.data.user);
        }
      } catch (err) {
        // Safe to ignore on first load (user is unauthenticated)
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    hydrateSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.status === 'success') {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data?.status === 'success') {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear local credentials
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to request password reset');
    }
  };

  const resetPassword = async (token, email, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token || 'default'}`, { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
