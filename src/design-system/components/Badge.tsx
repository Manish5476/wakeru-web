import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'sponsored'
  | 'outline'
  | 'verified'
  | 'secondary'
  | 'destructive'
  | 'gold';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Badge({
  children,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const base =
    'inline-flex items-center gap-1.5 rounded-full font-semibold backdrop-blur-md transition-colors';

  const variants: Record<BadgeVariant, string> = {
    default:
      'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20',
    neutral:
      'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20',
    secondary:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    success:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    destructive:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    info:
      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
    sponsored:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    verified:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    gold:
      'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    outline:
      'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',
  };

  return (
    <span className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`} {...props}>
      {label || children}
    </span>
  );
}

export default Badge;
