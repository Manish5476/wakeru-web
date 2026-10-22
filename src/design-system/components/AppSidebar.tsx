'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { AppIcon, AppIconName } from './AppIcon';

export interface NavItem {
  id: string;
  label: string;
  icon: AppIconName;
  route: string;
  match?: string[];
  badge?: number;
  tag?: 'new' | 'beta' | 'soon' | 'pro';
}

export interface NavSection {
  id: string;
  title: string;
  count: number;
  items: NavItem[];
  defaultOpen: boolean;
}

const PRIMARY_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', route: '/dashboard' },
  { id: 'trips', label: 'My Trips', icon: 'plane', route: '/trips', match: ['/trips'] },
  { id: 'expenses', label: 'Expenses', icon: 'receipt', route: '/expenses' },
  { id: 'finance', label: 'Regular Expenses', icon: 'wallet', route: '/finance' },
];

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'travel',
    title: 'Travel & Local',
    count: 3,
    defaultOpen: true,
    items: [
      { id: 'explore', label: 'Explore Local', icon: 'compass', route: '/discover' },
      { id: 'bookings', label: 'My Bookings', icon: 'calendar', route: '/bookings' },
      { id: 'reminders', label: 'Reminders', icon: 'bell', route: '/reminders' },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    count: 3,
    defaultOpen: true,
    items: [
      { id: 'balances', label: 'Settlements', icon: 'check-circle', route: '/balances' },
      { id: 'requests', label: 'Requests', icon: 'arrow-left-right', route: '/requests' },
      { id: 'transactions', label: 'Transactions', icon: 'banknote', route: '/finance' },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    count: 3,
    defaultOpen: true,
    items: [
      { id: 'friends', label: 'Friends', icon: 'users', route: '/friends' },
      { id: 'invites', label: 'Invitations', icon: 'mail', route: '/invitations' },
      { id: 'achievements', label: 'Achievements', icon: 'award', route: '/achievements' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    count: 2,
    defaultOpen: false,
    items: [
      { id: 'analytics', label: 'Analytics', icon: 'bar-chart-2', route: '/analytics' },
      { id: 'insights', label: 'Insights', icon: 'sparkles', route: '/insights', tag: 'pro' },
    ],
  },
  {
    id: 'merchant',
    title: 'Merchant & Partners',
    count: 1,
    defaultOpen: false,
    items: [
      { id: 'vendor', label: 'Vendor Portal', icon: 'store', route: '/vendor', tag: 'pro' },
    ],
  },
  {
    id: 'admin',
    title: 'Platform Admin',
    count: 1,
    defaultOpen: false,
    items: [
      { id: 'admin', label: 'Admin Console', icon: 'shield-check', route: '/admin', tag: 'pro' },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    travel: true,
    finance: true,
    community: false,
    analytics: false,
    merchant: false,
    admin: false,
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const isItemActive = (item: NavItem): boolean => {
    if (pathname === item.route) return true;
    if (item.route !== '/' && pathname.startsWith(item.route + '/')) return true;
    if (item.match) return item.match.some(m => pathname.startsWith(m));
    return false;
  };

  const initials = (user?.displayName || user?.name || user?.email || 'TripSplit')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3.5 select-none overflow-x-hidden">
      {/* ── Brand & Collapse Header ── */}
      <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-black/5 dark:border-white/10">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-2.5 group overflow-hidden"
          title="TripSplit Home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-white text-base font-black shrink-0 transition-transform group-hover:scale-105">
            ⚡
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
                Trip<span className="text-amber-500">Split</span>
              </span>
              <span className="text-[10px] text-[var(--color-wakeru-text-muted)] font-mono tracking-wider uppercase mt-0.5">
                Expense OS
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <AppIcon name={collapsed ? 'chevron-right' : 'chevron-down'} size={16} />
        </button>
      </div>

      {/* ── Scrollable Nav Rows ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-1 pr-1 scrollbar-none">
        {/* Primary Items */}
        <div className="space-y-1">
          {PRIMARY_ITEMS.map(item => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                href={item.route}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/25 shadow-xs'
                    : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`shrink-0 ${active ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                  <AppIcon name={item.icon} size={18} />
                </div>
                {!collapsed && (
                  <span className="truncate flex-1 tracking-tight">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Accordion Categories */}
        {!collapsed &&
          NAV_SECTIONS.map(section => {
            const isOpen = openSections[section.id];
            return (
              <div key={section.id} className="pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <span>{section.title}</span>
                  <span className="text-[10px] transform transition-transform duration-200">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-0.5 mt-1">
                    {section.items.map(item => {
                      const active = isItemActive(item);
                      return (
                        <Link
                          key={item.id}
                          href={item.route}
                          onClick={onMobileClose}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                            active
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/25'
                              : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <AppIcon name={item.icon} size={15} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.tag && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              {item.tag}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ── Bottom User Profile Card ── */}
      <div className="pt-3 border-t border-black/5 dark:border-white/10 mt-2">
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <Link
              href="/profile"
              onClick={onMobileClose}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
              title="Account & Profile"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {initials}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)] truncate leading-tight">
                    {user?.displayName || user?.name || 'Traveler'}
                  </p>
                  <p className="text-[10px] text-[var(--color-wakeru-text-muted)] truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                title="Sign Out"
              >
                <AppIcon name="x" size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Link
              href="/login"
              onClick={onMobileClose}
              className="block w-full text-center py-2 text-xs font-bold rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              Log In
            </Link>
            {!collapsed && (
              <Link
                href="/register"
                onClick={onMobileClose}
                className="block w-full text-center py-2 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 shadow-xs transition-opacity"
              >
                Sign Up
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Floating Glass Dock matching Expo AppSidebar) */}
      <aside
        className={`hidden md:block fixed top-3 left-3 bottom-3 z-40 transition-all duration-300 ease-in-out glass-panel rounded-[24px] overflow-hidden ${
          collapsed ? 'w-[72px]' : 'w-[270px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (When Opened) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          {/* Drawer Canvas */}
          <aside className="relative w-72 max-w-[80vw] h-full glass-panel-prominent shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default AppSidebar;
