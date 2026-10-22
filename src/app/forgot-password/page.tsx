'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
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
            Autonomous Group Travel &amp; Multi-Currency FinTech Platform
          </p>
        </div>

        <Card className="border-[var(--color-wakeru-border)] shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Reset Your Password</CardTitle>
            <p className="text-[var(--color-wakeru-text-secondary)] text-xs mt-1">
              Enter your registered email address to receive password reset instructions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-lg text-xs font-semibold">
                  <span>✓ If an account exists for {email}, a password reset link has been dispatched.</span>
                </div>
                <Link href="/login" className="inline-block">
                  <Button variant="primary" size="sm">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-[var(--radius-control)] text-xs">
                    {error}
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  Send Password Reset Link
                </Button>

                <div className="text-center pt-2 border-t border-[var(--color-wakeru-border)] text-xs text-[var(--color-wakeru-text-secondary)]">
                  Remembered your password?{' '}
                  <Link href="/login" className="text-[var(--color-wakeru-primary)] font-bold hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
