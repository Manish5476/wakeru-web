'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'traveler' | 'vendor' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail =
        role === 'vendor'
          ? 'vikram.goa.villas@wakeru.local'
          : role === 'admin'
          ? 'admin@wakeru.local'
          : 'alex.traveler@wakeru.local';

      await login(demoEmail);
      if (role === 'vendor') router.push('/vendor');
      else if (role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
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
              TripSplit <span className="text-[var(--color-wakeru-primary)]">OS</span>
            </span>
          </Link>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            Autonomous Group Travel &amp; Multi-Currency FinTech Platform
          </p>
        </div>

        <Card className="border-[var(--color-wakeru-border)] shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Sign In to Your Account</CardTitle>
            <p className="text-[var(--color-wakeru-text-secondary)] text-xs mt-1">
              Access your trip ledgers, budgets, and outstanding settlements
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

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-[var(--color-wakeru-text-primary)]">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[var(--color-wakeru-primary)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-[var(--radius-control)] text-xs">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-wakeru-border)]"></div>
              </div>
              <span className="relative bg-[var(--color-wakeru-surface-elevated)] px-2 text-[10px] uppercase font-bold text-[var(--color-wakeru-text-tertiary)] tracking-wider">
                Or One-Click Demo Profiles
              </span>
            </div>

            {/* Quick Demo Switchers */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-[11px]"
                onClick={() => handleQuickDemo('traveler')}
                disabled={loading}
              >
                Traveler ✈️
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px]"
                onClick={() => handleQuickDemo('vendor')}
                disabled={loading}
              >
                Host 🏡
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px]"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
              >
                Admin 🛡️
              </Button>
            </div>

            <div className="text-center pt-2 border-t border-[var(--color-wakeru-border)] text-xs text-[var(--color-wakeru-text-secondary)]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[var(--color-wakeru-primary)] font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
