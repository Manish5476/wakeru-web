import React from 'react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';

export interface ExpenseCardData {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  amount?: number;
  amountLocal?: number;
  currency?: string;
  localCurrency?: string;
  category?: string;
  date?: string;
  paidByName?: string;
  paidBy?: string;
  isSettled?: boolean;
  tripName?: string;
  tripId?: { _id: string; title: string };
  splits?: unknown[];
}

export interface ExpenseCardProps {
  expense: ExpenseCardData;
  onClick?: () => void;
  className?: string;
}

const CATEGORY_STYLES: Record<string, { icon: string; bg: string; text: string }> = {
  food: { icon: '☕', bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-500' },
  transport: { icon: '🚕', bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-500' },
  stay: { icon: '🏨', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-500' },
  accommodation: { icon: '🏨', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-500' },
  activities: { icon: '⚡', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-500' },
  activity: { icon: '⚡', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-500' },
  shopping: { icon: '🛍️', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500' },
  bills: { icon: '📄', bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-500' },
  entertainment: { icon: '🎬', bg: 'bg-pink-500/10 border-pink-500/20', text: 'text-pink-500' },
  other: { icon: '🏷️', bg: 'bg-zinc-500/10 border-zinc-500/20', text: 'text-zinc-500' },
};

export function ExpenseCard({ expense, onClick, className = '' }: ExpenseCardProps) {
  const title = expense.title || expense.description || 'Untitled Expense';
  const amount = expense.amountLocal ?? expense.amount ?? 0;
  const currency = expense.localCurrency || expense.currency || 'INR';
  const categoryKey = (expense.category || 'other').toLowerCase();
  const catStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.other;

  const payerName = expense.paidByName || (typeof expense.paidBy === 'string' ? expense.paidBy : 'Unknown');
  const dateFormatted = expense.date
    ? new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  const tripLabel = typeof expense.tripId === 'object' && expense.tripId?.title
    ? expense.tripId.title
    : expense.tripName;

  const currSymbol = currency === 'INR' || currency === '₹' ? '₹' : currency === 'USD' ? '$' : `${currency} `;

  return (
    <GlassCard
      variant="medium"
      padding="none"
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={`p-4 sm:p-5 flex items-center justify-between gap-4 group ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Category Icon Bubble */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border transition-transform duration-200 group-hover:scale-105 ${catStyle.bg}`}>
          {catStyle.icon}
        </div>

        {/* Expense Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-semibold text-[var(--color-wakeru-text-primary)] truncate">
              {title}
            </h4>
            {expense.isSettled && (
              <Badge variant="success" size="sm">
                Settled
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--color-wakeru-text-muted)] mt-0.5 truncate">
            <span>Paid by <strong className="font-medium text-[var(--color-wakeru-text-secondary)]">{payerName}</strong></span>
            {tripLabel && <span> • {tripLabel}</span>}
            {dateFormatted && <span> • {dateFormatted}</span>}
          </p>
        </div>
      </div>

      {/* Amount & Currency */}
      <div className="text-right shrink-0">
        <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-wakeru-text-primary)] block">
          {currSymbol}{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[11px] font-medium text-[var(--color-wakeru-text-tertiary)] uppercase tracking-wider">
          {expense.category || 'General'}
        </span>
      </div>
    </GlassCard>
  );
}

export default ExpenseCard;
