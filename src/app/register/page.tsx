'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(email.trim(), password, name.trim(), phone.trim() || undefined);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-wakeru-surface-muted)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🌴</span>
            <span className="text-2xl font-black text-[var(--color-wakeru-text-primary)] tracking-tight">
              TripSplit <span className="text-[var(--color-wakeru-primary)]">OS</span>
            </span>
          </Link>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            Create your account to start managing group travel expenses
          </p>
        </div>

        <Card className="border-[var(--color-wakeru-border)] shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Create Traveler Account</CardTitle>
            <p className="text-[var(--color-wakeru-text-secondary)] text-xs mt-1">
              Join companions and start sharing trip expenses in seconds
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-[var(--radius-control)] text-xs">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Create Account
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-[var(--color-wakeru-border)] text-xs text-[var(--color-wakeru-text-secondary)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--color-wakeru-primary)] font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
