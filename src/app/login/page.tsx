'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { authApi } from '@/api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res: any = await authApi.login(email, 'mock_firebase_token_for_now');
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) {
          localStorage.setItem('wakeru_user', JSON.stringify(res.user));
        }
        if (email.includes('vendor')) {
          window.location.href = '/vendor';
        } else if (email.includes('admin')) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/trips';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'traveler' | 'vendor' | 'admin') => {
    setLoading(true);
    const demoEmail =
      role === 'vendor'
        ? 'vikram.goa.villas@wakeru.local'
        : role === 'admin'
        ? 'admin@wakeru.local'
        : 'alex.traveler@wakeru.local';

    const res: any = await authApi.login(demoEmail, 'mock_firebase_demo_token');
    if (res?.token) {
      localStorage.setItem('token', res.token);
      if (res.user) {
        localStorage.setItem('wakeru_user', JSON.stringify(res.user));
      }
      if (role === 'vendor') {
        window.location.href = '/vendor';
      } else if (role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/trips';
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-wakeru-surface-muted)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🌴</span>
            <span className="text-2xl font-black text-[var(--color-wakeru-text-primary)] tracking-tight">
              TripSplit <span className="text-[var(--color-wakeru-primary)]">× Wakeru</span>
            </span>
          </Link>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            Autonomous Group Travel &amp; Local Partner Platform
          </p>
        </div>

        <Card className="border-[var(--color-wakeru-border)] shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Sign In to Your Account</CardTitle>
            <p className="text-[var(--color-wakeru-text-secondary)] text-xs mt-1">
              Access your trip ledgers, bookings, or partner business portal
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 text-xs text-[var(--color-wakeru-danger)] bg-red-50 dark:bg-red-950/20 border border-[var(--color-wakeru-danger)] rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full h-10 font-bold" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            {/* Quick Demo Access Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--color-wakeru-border)]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-[var(--color-wakeru-surface)] px-2 text-[var(--color-wakeru-text-muted)]">
                  Instant Demo Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('traveler')}
                disabled={loading}
                className="p-2.5 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] hover:bg-[var(--color-wakeru-surface-hover)] text-center transition-all text-xs group"
              >
                <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🎒</span>
                <span className="font-bold block text-[var(--color-wakeru-text-primary)]">Traveler</span>
                <span className="text-[10px] text-[var(--color-wakeru-text-muted)]">Alex</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('vendor')}
                disabled={loading}
                className="p-2.5 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] hover:bg-[var(--color-wakeru-surface-hover)] text-center transition-all text-xs group"
              >
                <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🏡</span>
                <span className="font-bold block text-[var(--color-wakeru-text-primary)]">Host/Vendor</span>
                <span className="text-[10px] text-[var(--color-wakeru-text-muted)]">Vikram</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="p-2.5 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] hover:bg-[var(--color-wakeru-surface-hover)] text-center transition-all text-xs group"
              >
                <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🛡️</span>
                <span className="font-bold block text-[var(--color-wakeru-text-primary)]">Admin</span>
                <span className="text-[10px] text-[var(--color-wakeru-text-muted)]">Moderator</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer links */}
        <div className="text-center text-xs text-[var(--color-wakeru-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-wakeru-primary)] underline">
            &larr; Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
