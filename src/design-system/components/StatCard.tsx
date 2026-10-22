import React from 'react';
import { GlassCard } from './GlassCard';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger';

export interface StatCardProps {
  title: string;
  amount: number | string;
  currency?: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  variant?: StatCardVariant;
  onClick?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<
  StatCardVariant,
  { color: string; iconBg: string; textClass: string; badgeBg: string }
> = {
  default: {
    color: '#3B82F6',
    iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    textClass: 'text-[var(--color-wakeru-text-primary)]',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  success: {
    color: '#10B981',
    iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    color: '#F59E0B',
    iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  danger: {
    color: '#EF4444',
    iconBg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    textClass: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
};

function formatStatAmount(amount: number | string, currency = 'INR'): string {
  if (typeof amount === 'string') return amount;
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  const currSymbol = currency === 'INR' || currency === '₹' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  return `${currSymbol}${formatted}`;
}

export function StatCard({
  title,
  amount,
  currency = 'INR',
  subtitle,
  trend,
  icon,
  variant = 'default',
  onClick,
  className = '',
}: StatCardProps) {
  const meta = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  const displayValue = formatStatAmount(amount, currency);

  return (
    <GlassCard
      variant="prominent"
      padding="lg"
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={`relative group ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-wakeru-text-tertiary)]">
          {title}
        </span>
        {icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${meta.iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${meta.textClass}`}>
          {displayValue}
        </span>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/10 dark:border-white/5">
          {subtitle && (
            <span className="text-[var(--color-wakeru-text-muted)] truncate">{subtitle}</span>
          )}
          {trend && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}

export default StatCard;
