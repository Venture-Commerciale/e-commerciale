import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getMe(token)
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken('');
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    setToken(res.data.accessToken);
    localStorage.setItem('token', res.data.accessToken);
  };

  const logout = async () => {
    if (token) {
      try { await apiLogout(token); } catch {} // ignore
    }
    setToken('');
    localStorage.removeItem('token');
  };

  // Backend returns roles as plain names (e.g. 'ADMIN', 'STAFF').
  // Accept both forms ('ADMIN' and 'ROLE_ADMIN') for compatibility.
  const isStaff = () => {
    const roles = user?.roles || [];
    return (
      roles.includes('ROLE_STAFF') ||
      roles.includes('ROLE_ADMIN') ||
      roles.includes('STAFF') ||
      roles.includes('ADMIN')
    );
  };
  const isAdmin = () => {
    const roles = user?.roles || [];
    return roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, isStaff, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
