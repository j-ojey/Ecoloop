import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ecoloop_auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { token: t, user: u } = JSON.parse(raw);
      setToken(t); setUser(u);
    }
  }, []);

  const login = (t, u) => {
    setToken(t); setUser(u);
    setAuthToken(t); // Set token immediately before storing
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, user: u }));
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  useEffect(() => { setAuthToken(token); }, [token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
