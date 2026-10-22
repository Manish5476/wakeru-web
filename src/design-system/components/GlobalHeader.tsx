'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { notificationsApi } from '@/api/notifications';
import { AppIcon, AppIconName } from './AppIcon';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface RouteInfo {
  title: string;
  section?: string;
  icon: AppIconName;
}

const ROUTE_MAP: Record<string, RouteInfo> = {
  '/dashboard': { title: 'Dashboard', icon: 'grid' },
  '/trips': { title: 'Trips Portfolio', icon: 'plane', section: 'Travel' },
  '/expenses': { title: 'Expense Splits', icon: 'receipt', section: 'Finance' },
  '/finance': { title: 'Regular Expenses', icon: 'wallet', section: 'Finance' },
  '/balances': { title: 'Settlements', icon: 'check-circle', section: 'Finance' },
  '/discover': { title: 'Explore Local', icon: 'compass', section: 'Travel' },
  '/friends': { title: 'Friends & Social', icon: 'users', section: 'Community' },
  '/analytics': { title: 'Analytics', icon: 'bar-chart-2', section: 'Analytics' },
  '/insights': { title: 'Insights', icon: 'sparkles', section: 'Analytics' },
  '/reminders': { title: 'Reminders', icon: 'bell', section: 'Productivity' },
  '/profile': { title: 'Profile & Settings', icon: 'user' },
  '/notifications': { title: 'Notifications', icon: 'bell' },
  '/vendor': { title: 'Vendor Portal', icon: 'store', section: 'Host' },
  '/admin': { title: 'Admin Console', icon: 'shield-check', section: 'Platform' },
};

function getRouteInfo(pathname: string): RouteInfo {
  if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];
  for (const [key, info] of Object.entries(ROUTE_MAP)) {
    if (pathname.startsWith(key + '/')) return info;
  }
  return { title: 'TripSplit', icon: 'plane' };
}

interface GlobalHeaderProps {
  onMenuPress: () => void;
  sidebarCollapsed?: boolean;
}

export function GlobalHeader({ onMenuPress, sidebarCollapsed }: GlobalHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi
        .getUnreadCount()
        .then(res => {
          if (res && res.data && typeof res.data.unreadCount === 'number') {
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const routeInfo = getRouteInfo(pathname);

  const initials = (user?.displayName || user?.name || user?.email || 'TripSplit')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel-prominent border-b border-black/5 dark:border-white/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuPress}
            className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <AppIcon name="menu" size={20} />
          </button>

          {/* Breadcrumb Information */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AppIcon name={routeInfo.icon} size={15} />
            </div>
            <div className="flex items-baseline gap-1.5">
              {routeInfo.section && (
                <span className="hidden sm:inline text-xs text-zinc-400 font-medium">
                  {routeInfo.section} /
                </span>
              )}
              <h1 className="text-sm sm:text-base font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
                {routeInfo.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Live Sync & Status Indicator */}
        <div className="hidden sm:flex items-center">
          <SyncStatusIndicator />
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Toggle */}
          <button
            type="button"
            onClick={() => setCurrency(c => (c === 'INR' ? 'USD' : 'INR'))}
            className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-black/10 transition-colors"
            title="Toggle Base Currency Display"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center border border-transparent hover:border-black/5"
            title="Notifications"
          >
            <AppIcon name="bell" size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile / Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-xs flex items-center justify-center ring-2 ring-black/5 dark:ring-white/10 shadow-sm transition-transform hover:scale-105">
                  {initials}
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 glass-panel-prominent rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-black/5 dark:border-white/10">
                    <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)] truncate">
                      {user?.displayName || user?.name || 'Traveler'}
                    </p>
                    <p className="text-[11px] text-[var(--color-wakeru-text-muted)] truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    👤 Account &amp; Profile
                  </Link>
                  <Link
                    href="/profile/sessions"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    🛡️ Security &amp; Sessions
                  </Link>
                  <Link
                    href="/achievements"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    🏆 Achievements &amp; Badges
                  </Link>
                  <Link
                    href="/vendor"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    🏡 Host Portal
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    ⚙️ Admin Console
                  </Link>

                  <div className="border-t border-black/5 dark:border-white/10 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        router.push('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] px-3 py-1.5"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-1.5 rounded-xl shadow-xs hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default GlobalHeader;
