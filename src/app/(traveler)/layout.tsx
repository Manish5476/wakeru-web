'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { notificationsApi } from '@/api/notifications';
import { AppIcon } from '@/design-system/components/AppIcon';

function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-sm font-semibold transition-all duration-200 px-3.5 py-1.5 rounded-xl ${
        isActive
          ? 'text-zinc-900 dark:text-white bg-black/5 dark:bg-white/10 font-bold border border-black/5 dark:border-white/10 shadow-xs'
          : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center justify-center py-2 relative transition-all duration-200 ${
        isActive
          ? 'text-amber-500 dark:text-amber-400 font-bold scale-105'
          : 'text-[var(--color-wakeru-text-muted)] hover:text-[var(--color-wakeru-text-primary)]'
      }`}
    >
      <div className="relative text-xl leading-none">
        <span>{icon}</span>
        {Boolean(badge && badge > 0) && (
          <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
            {badge! > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-[11px] mt-1 tracking-tight">{label}</span>
    </Link>
  );
}

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

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

  if (pathname === '/') {
    return <>{children}</>;
  }

  const initials = (user?.displayName || user?.name || user?.email || 'TripSplit')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full pb-16 md:pb-0">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-xl font-black tracking-tight text-[var(--color-wakeru-text-primary)] group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-white text-base font-black transition-transform group-hover:scale-105">
                ⚡
              </div>
              <span className="font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Trip<span className="text-amber-500">Split</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 ml-2">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/trips">Trips</NavLink>
              <NavLink href="/expenses">Expenses</NavLink>
              <NavLink href="/finance">Finance &amp; Budgets</NavLink>
              <NavLink href="/balances">Balances</NavLink>
              <NavLink href="/discover">Discover</NavLink>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Friends Icon */}
            <Link
              href="/friends"
              className="p-2 rounded-xl text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:flex items-center justify-center border border-transparent hover:border-black/5"
              title="Friends & Social"
            >
              <AppIcon name="users" size={18} />
            </Link>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center border border-transparent hover:border-black/5"
              title="Notifications"
            >
              <AppIcon name="sparkles" size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Portals */}
            <Link
              href="/vendor"
              className="hidden lg:inline-flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 px-3 py-1.5 rounded-xl hover:bg-black/10"
            >
              Host Portal 🏡
            </Link>

            {/* User Profile / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-xs flex items-center justify-center ring-2 ring-black/5 dark:ring-white/10 shadow-sm transition-transform hover:scale-105">
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
                        {user?.displayName || user?.name || 'TripSplit Traveler'}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Glassmorphic) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10 px-2 flex items-center justify-around shadow-lg">
        <MobileNavItem href="/dashboard" icon="📊" label="Dashboard" />
        <MobileNavItem href="/trips" icon="✈️" label="Trips" />
        <MobileNavItem href="/expenses" icon="💳" label="Expenses" />
        <MobileNavItem href="/finance" icon="💰" label="Finance" />
        <MobileNavItem href="/balances" icon="⚖️" label="Balances" />
        <MobileNavItem href="/profile" icon="👤" label="Profile" />
      </nav>
    </div>
  );
}
