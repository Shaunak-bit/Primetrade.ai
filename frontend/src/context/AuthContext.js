'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setUnauthorizedCallback, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Clear session data and redirect to login
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    clearToken();
    setUser(null);
    setTokenState(null);
    router.push('/');
  }, [router]);

  // Load persisted session on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);        // ← restore into axios interceptor
          setTokenState(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse cached user data:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);

    // Register callback for global 401 interceptor
    setUnauthorizedCallback(() => {
      logout();
    });
  }, [logout]);

  // Handle registration request
  const register = async (email, password, role = 'user') => {
    try {
      const response = await api.post('/auth/register', { email, password, role });
      const { token: responseToken, user: responseUser } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', responseToken);
        localStorage.setItem('user', JSON.stringify(responseUser));
      }

      setToken(responseToken);          // ← set into axios interceptor
      setTokenState(responseToken);
      setUser(responseUser);
      return { success: true, user: responseUser };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      const errsList = error.response?.data?.errors || null;
      throw { message: errMsg, errors: errsList };
    }
  };

  // Handle login request
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: responseToken, user: responseUser } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', responseToken);
        localStorage.setItem('user', JSON.stringify(responseUser));
      }

      setToken(responseToken);          // ← set into axios interceptor
      setTokenState(responseToken);
      setUser(responseUser);
      return { success: true, user: responseUser };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please try again.';
      const errsList = error.response?.data?.errors || null;
      throw { message: errMsg, errors: errsList };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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