'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppIcon, AppIconName } from './AppIcon';

interface BottomNavItem {
  key: string;
  label: string;
  icon: AppIconName;
  route: string;
  badge?: number;
}

interface CustomBottomTabBarProps {
  unreadCount?: number;
  onMenuPress: () => void;
}

export function CustomBottomTabBar({
  unreadCount = 0,
  onMenuPress,
}: CustomBottomTabBarProps) {
  const pathname = usePathname();

  const NAV_ITEMS: BottomNavItem[] = [
    { key: 'dashboard', label: 'Home', icon: 'home', route: '/dashboard' },
    { key: 'trips', label: 'Trips', icon: 'plane', route: '/trips' },
    { key: 'expenses', label: 'Splits', icon: 'arrow-left-right', route: '/expenses' },
    { key: 'notifications', label: 'Alerts', icon: 'bell', route: '/notifications', badge: unreadCount },
    { key: 'profile', label: 'Profile', icon: 'user', route: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-panel-prominent rounded-[22px] px-2 py-1.5 flex items-center justify-around shadow-2xl border border-black/10 dark:border-white/10">
      {/* ── Drawer Hamburger Menu Button ── */}
      <button
        type="button"
        onClick={onMenuPress}
        className="flex flex-col items-center justify-center p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        aria-label="Open Full Navigation Menu"
      >
        <AppIcon name="menu" size={18} />
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Menu</span>
      </button>

      {/* ── Tab Pills ── */}
      {NAV_ITEMS.map(item => {
        const isActive =
          pathname === item.route ||
          (item.route !== '/' && pathname.startsWith(item.route + '/'));

        return (
          <Link
            key={item.key}
            href={item.route}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl relative transition-all duration-200 ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-500/15 border border-amber-500/25 scale-105'
                : 'text-[var(--color-wakeru-text-muted)] hover:text-[var(--color-wakeru-text-primary)]'
            }`}
          >
            <div className="relative">
              <AppIcon name={item.icon} size={18} />
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-xs">
                  {item.badge! > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default CustomBottomTabBar;
