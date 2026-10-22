'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { IUser } from '@/types/user.types';
import { authApi } from '@/api/auth';
import { firebaseSignIn, firebaseSignUp, firebaseSendPasswordReset } from '@/lib/firebaseAuth';

interface AuthContextValue {
  user: IUser | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (newRole: 'user' | 'admin' | 'business') => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Try fetching latest profile from backend
        try {
          const res = await authApi.getProfile();
          if (res && res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('wakeru_user', JSON.stringify(res.data.user));
            return;
          }
        } catch {
          // If offline or token cached, restore local profile
          const userStr = localStorage.getItem('wakeru_user');
          if (userStr) {
            setUser(JSON.parse(userStr));
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Auth init error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (password) {
        // Real Firebase Auth
        const fbResult = await firebaseSignIn(email, password);
        const res = await authApi.login(fbResult.idToken);

        if (res && res.data) {
          const { user: backendUser, tokens } = res.data;
          if (tokens?.accessToken) {
            localStorage.setItem('token', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }
          localStorage.setItem('wakeru_user', JSON.stringify(backendUser));
          setUser(backendUser);
          return;
        }
      }

      // If no password provided (e.g. quick demo / dev switch)
      const fallbackUser: IUser = {
        _id: 'usr_me',
        email,
        displayName: email.includes('admin') ? 'Administrator' : email.includes('vendor') ? 'Vikram Joshi' : 'Alex Traveler',
        role: email.includes('admin') ? 'admin' : email.includes('vendor') ? 'business' : 'user',
      };
      localStorage.setItem('token', `dev_token_${Date.now()}`);
      localStorage.setItem('wakeru_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const fbResult = await firebaseSignUp(email, password);
      const res = await authApi.register(fbResult.idToken, { name, displayName: name, phone });

      if (res && res.data) {
        const { user: backendUser, tokens } = res.data;
        if (tokens?.accessToken) {
          localStorage.setItem('token', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        localStorage.setItem('wakeru_user', JSON.stringify(backendUser));
        setUser(backendUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
    } catch {
      await firebaseSendPasswordReset(email);
    }
  };

  const logout = () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('wakeru_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getProfile();
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('wakeru_user', JSON.stringify(res.data.user));
      }
    } catch {}
  };

  const switchRole = async (newRole: 'user' | 'admin' | 'business') => {
    const demoEmail =
      newRole === 'admin'
        ? 'admin@wakeru.local'
        : newRole === 'business'
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
        register,
        forgotPassword,
        logout,
        refreshUser,
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
