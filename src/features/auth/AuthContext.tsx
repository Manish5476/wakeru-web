'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, AuthUser } from '@/server/types';
import { authApi } from '@/api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Try decoding payload
        const userStr = localStorage.getItem('wakeru_user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        } else {
          // Fallback based on token string
          let role: UserRole = 'TRAVELER';
          if (token.includes('admin')) role = 'ADMIN';
          else if (token.includes('vendor')) role = 'VENDOR';

          const fallbackUser: AuthUser = {
            id: 'usr_me',
            email: `${role.toLowerCase()}@wakeru.local`,
            name: role === 'ADMIN' ? 'Platform Administrator' : role === 'VENDOR' ? 'Vikram Joshi' : 'Alex Traveler',
            role,
            permissions: [],
          };
          setUser(fallbackUser);
        }
      }
    } catch (e) {
      console.warn('Auth init error', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, 'session_token');
      if (res?.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('wakeru_user', JSON.stringify(res.user));
        setUser(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('wakeru_user');
    setUser(null);
  };

  const switchRole = async (newRole: UserRole) => {
    const demoEmail =
      newRole === 'ADMIN'
        ? 'admin@wakeru.local'
        : newRole === 'VENDOR'
        ? 'vikram.goa.villas@wakeru.local'
        : 'alex.traveler@wakeru.local';

    await login(demoEmail);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
