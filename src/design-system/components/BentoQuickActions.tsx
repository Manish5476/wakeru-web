'use client';

import React from 'react';
import Link from 'next/link';
import { AppIcon, AppIconName } from './AppIcon';

interface ActionItem {
  id: string;
  icon: AppIconName;
  label: string;
  sub: string;
  route: string;
  gradientClass: string;
  shadowClass: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'expense',
    icon: 'plus-circle',
    label: 'Add Expense',
    sub: 'Log cost & split',
    route: '/expenses',
    gradientClass: 'from-rose-500 to-rose-600',
    shadowClass: 'shadow-rose-500/20',
  },
  {
    id: 'trip',
    icon: 'map',
    label: 'New Trip',
    sub: 'Plan adventure',
    route: '/trips/create',
    gradientClass: 'from-sky-400 to-blue-600',
    shadowClass: 'shadow-sky-500/20',
  },
  {
    id: 'settle',
    icon: 'check-circle',
    label: 'Settle Up',
    sub: 'Clear balances',
    route: '/balances',
    gradientClass: 'from-emerald-400 to-emerald-600',
    shadowClass: 'shadow-emerald-500/20',
  },
  {
    id: 'analytics',
    icon: 'bar-chart-2',
    label: 'Analytics',
    sub: 'Spending reports',
    route: '/finance',
    gradientClass: 'from-purple-500 to-violet-600',
    shadowClass: 'shadow-purple-500/20',
  },
];

export function BentoQuickActions({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3.5 ${className}`}>
      {ACTIONS.map(action => (
        <Link
          key={action.id}
          href={action.route}
          className="group relative p-4 rounded-2xl glass-panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] border border-black/5 dark:border-white/10"
        >
          {/* Subtle Accent Glow */}
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradientClass} text-white flex items-center justify-center shadow-md ${action.shadowClass} mb-3 transition-transform group-hover:scale-110`}
          >
            <AppIcon name={action.icon} size={20} />
          </div>

          <h3 className="font-extrabold text-sm text-[var(--color-wakeru-text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {action.label}
          </h3>
          <p className="text-[11px] text-[var(--color-wakeru-text-muted)] mt-0.5">
            {action.sub}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default BentoQuickActions;
