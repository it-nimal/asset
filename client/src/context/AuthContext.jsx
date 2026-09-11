import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEFAULT_USER = {
  name: 'IT Administrator',
  email: 'admin@vitromed.com',
  role: 'IT Admin',
  dept: 'IT Infrastructure',
  desc: 'Enterprise System Administrator',
};

const DUMMY_NAMES = [
  'Aditya Vikram',
  'Pooja Verma',
  'Kunal Deshmukh',
  'Neha Singhania',
  'Rahul Sharma',
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('itam_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If cached user is an old dummy admin, purge it
        if (parsed?.name && DUMMY_NAMES.includes(parsed.name)) {
          localStorage.setItem('itam_user', JSON.stringify(DEFAULT_USER));
          return DEFAULT_USER;
        }
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
    localStorage.setItem('itam_user', JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('itam_token') || 'system-admin-token');

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('itam_user', JSON.stringify(res.user));
        localStorage.setItem('itam_token', res.token);
        return { success: true };
      }
    } catch (err) {
      if (email === DEFAULT_USER.email) {
        setUser(DEFAULT_USER);
        localStorage.setItem('itam_user', JSON.stringify(DEFAULT_USER));
        return { success: true };
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    setToken('system-admin-token');
    localStorage.setItem('itam_user', JSON.stringify(DEFAULT_USER));
    localStorage.removeItem('itam_token');
  };

  // Role helper checks
  const isSuperAdmin = true;
  const isITAdmin = true;
  const isTechnician = true;
  const isManager = true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isSuperAdmin,
        isITAdmin,
        isTechnician,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);