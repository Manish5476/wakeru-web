'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { IUser, IUserPreferences } from '@/types/user.types';
import { getInitials } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB', 'JPY', 'AUD', 'CAD'];

export default function ProfileSettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setBio(user.bio || '');
      setUpiId(user.upiId || '');
    }

    usersApi
      .getPreferences()
      .then(res => {
        const prefs = (res as any)?.data?.preferences || (res as any)?.preferences;
        if (prefs) {
          if (prefs.defaultCurrency) setDefaultCurrency(prefs.defaultCurrency);
          if (prefs.theme) setThemePreference(prefs.theme);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);

      await Promise.all([
        authApi.updateProfile({ displayName, phoneNumber, bio }),
        upiId ? authApi.setUpiId(upiId.trim()) : Promise.resolve(),
        usersApi.updatePreferences({
          defaultCurrency,
          theme: themePreference,
        }),
      ]);

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploadingAvatar(true);
        const file = e.target.files[0];
        const res = await usersApi.uploadProfilePicture(file);
        const photoURL = (res as any)?.data?.photoURL || (res as any)?.photoURL;
        if (photoURL) {
          await authApi.updateProfile({ photoURL });
          await refreshUser();
        }
      } catch (err: any) {
        alert('Failed to upload profile picture.');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
          <span>⚙️ Account &amp; Identity</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
          Profile &amp; Settings
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Manage your personal profile, settlement banking details, and display preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-[var(--radius-card)] text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>Profile changes and preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <Card className="border-[var(--color-wakeru-border)]">
          <CardHeader className="pb-3 border-b border-[var(--color-wakeru-border)]">
            <CardTitle className="text-sm font-bold">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            {/* Avatar & Email */}
            <div className="flex items-center gap-4 pb-3 border-b border-[var(--color-wakeru-border)]">
              <div className="relative group">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center uppercase ring-4 ring-blue-500/10">
                  {getInitials(displayName || user?.email || 'User')}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span>{uploadingAvatar ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                  {displayName || 'Traveler'}
                </p>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)]">{user?.email}</p>
                <Badge variant="verified" size="sm" className="mt-1">
                  {user?.role || 'Verified Member'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Bio / Travel Philosophy</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
                placeholder="Backpacker, budget travel enthusiast..."
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Banking / UPI Settlements Card */}
        <Card className="border-[var(--color-wakeru-border)]">
          <CardHeader className="pb-3 border-b border-[var(--color-wakeru-border)]">
            <CardTitle className="text-sm font-bold">UPI &amp; Settlement Banking</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <p className="text-[var(--color-wakeru-text-secondary)]">
              This UPI ID is displayed to group members when settling trip balances via Google Pay, PhonePe, or Paytm.
            </p>
            <div>
              <label className="font-semibold block mb-1">UPI VPA (Virtual Payment Address)</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@okhdfcbank"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="border-[var(--color-wakeru-border)]">
          <CardHeader className="pb-3 border-b border-[var(--color-wakeru-border)]">
            <CardTitle className="text-sm font-bold">Preferences &amp; Currency</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Default Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={e => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)] font-bold"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Theme Display</label>
                <select
                  value={themePreference}
                  onChange={e => setThemePreference(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                >
                  <option value="system">Auto (System Default)</option>
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/profile/sessions"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>🛡️ View Active Login Sessions</span>
          </Link>

          <Button variant="primary" size="md" type="submit" isLoading={saving} className="px-6 shadow-sm">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
