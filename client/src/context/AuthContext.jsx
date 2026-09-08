import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin@vitromed.com', name: 'Aditya Vikram', dept: 'Executive Management', desc: 'Full Enterprise Unrestricted Access' },
  { role: 'IT Admin', email: 'itadmin@vitromed.com', name: 'Pooja Verma', dept: 'IT Infrastructure', desc: 'Manage assets, assignments, software, and reports' },
  { role: 'IT Technician', email: 'tech@vitromed.com', name: 'Kunal Deshmukh', dept: 'IT Support', desc: 'Hardware repairs, inward entries & maintenance' },
  { role: 'Manager', email: 'manager@vitromed.com', name: 'Neha Singhania', dept: 'Operations', desc: 'View department allocations and analytics' },
  { role: 'Employee', email: 'employee@vitromed.com', name: 'Rahul Sharma', dept: 'Engineering', desc: 'View assigned personal assets and status' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('itam_user');
    return saved ? JSON.parse(saved) : DEMO_ACCOUNTS[0]; // Default to Super Admin for seamless demo
  });
  const [token, setToken] = useState(() => localStorage.getItem('itam_token') || 'demo-jwt-token');

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
      // Local fallback for demo
      const match = DEMO_ACCOUNTS.find(a => a.email === email);
      if (match) {
        setUser(match);
        localStorage.setItem('itam_user', JSON.stringify(match));
        return { success: true };
      }
      throw err;
    }
  };

  const switchDemoRole = (roleName) => {
    const target = DEMO_ACCOUNTS.find(a => a.role === roleName) || DEMO_ACCOUNTS[0];
    setUser(target);
    localStorage.setItem('itam_user', JSON.stringify(target));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('itam_user');
    localStorage.removeItem('itam_token');
  };

  // Role helper checks
  const isSuperAdmin = user?.role === 'Super Admin';
  const isITAdmin = user?.role === 'IT Admin' || isSuperAdmin;
  const isTechnician = user?.role === 'IT Technician' || isITAdmin;
  const isManager = user?.role === 'Manager' || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        switchDemoRole,
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