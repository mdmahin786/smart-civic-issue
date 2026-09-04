import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cw_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          connectSocket(token);
        } catch (err) {
          console.error('Auth initialization failed', err);
          localStorage.removeItem('cw_token');
        }
      }
      setLoading(false);
    };

    initAuth();
    return () => disconnectSocket();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('cw_token', token);
      setUser(user);
      connectSocket(token);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cw_token');
    setUser(null);
    disconnectSocket();
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      setUser(res.data);
      toast.success('Profile updated');
      return true;
    } catch (err) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
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
