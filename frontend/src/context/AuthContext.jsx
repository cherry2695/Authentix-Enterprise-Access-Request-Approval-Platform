import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { MOCK_USERS } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('accessflow_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[2]; // Default to Ethan Employee for immediate interactive preview
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessflow_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('accessflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('accessflow_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('accessflow_token', token);
    } else {
      localStorage.removeItem('accessflow_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.register(fullName, email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessflow_user');
    localStorage.removeItem('accessflow_token');
  };

  // Demo helper: allows 1-click role switching for interview presentations
  const switchDemoRole = (role) => {
    const target = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[2];
    setUser(target);
    setToken('demo-token-' + role.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
