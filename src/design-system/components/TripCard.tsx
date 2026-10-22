import React, { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';

export interface TripCardMember {
  userId: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  photoURL?: string;
}

export interface TripCardData {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  baseCurrency?: string;
  currency?: string;
  totalBudget?: number;
  budget?: number;
  totalSpent?: number;
  totalSpentBase?: number;
  members?: TripCardMember[];
  stops?: unknown[];
}

export interface TripCardProps {
  trip: TripCardData;
  className?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

export function TripCard({ trip, className = '' }: TripCardProps) {
  const tripId = trip.id || trip._id || '';
  const title = trip.name || trip.title || 'Untitled Trip';
  const currency = trip.baseCurrency || trip.currency || 'INR';
  const budget = trip.totalBudget || trip.budget || 0;
  const spent = trip.totalSpent || trip.totalSpentBase || 0;
  const status = trip.status || 'planning';
  const members = trip.members || [];

  const [imgSrc, setImgSrc] = useState(trip.coverImage || FALLBACK_IMAGE);

  // Status mapping matching native TripCard
  const statusConfig: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'neutral' }> = {
    active: { label: '🟢 Live', variant: 'success' },
    planning: { label: '📅 Planning', variant: 'info' },
    completed: { label: '✅ Done', variant: 'neutral' },
    archived: { label: 'Archived', variant: 'neutral' },
  };
  const currentStatus = statusConfig[status.toLowerCase()] || { label: status, variant: 'neutral' };

  // Date formatting
  const formattedDates = trip.startDate && trip.endDate
    ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Dates pending';

  // Budget calculations
  const percentSpent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isBudgetWarning = percentSpent >= 80 && percentSpent < 100;
  const isBudgetExceeded = percentSpent >= 100;

  const barColor = isBudgetExceeded
    ? 'bg-rose-500'
    : isBudgetWarning
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <Link href={`/trips/${tripId}`} className="block group">
      <GlassCard
        variant="medium"
        padding="none"
        interactive
        className={`flex flex-col h-full ${className}`}
      >
        {/* Cover Image with Scrim */}
        <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
          <img
            src={imgSrc}
            alt={title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges on Cover */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant={currentStatus.variant} size="sm">
              {currentStatus.label}
            </Badge>
            <span className="text-[11px] font-semibold tracking-wide text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              {currency}
            </span>
          </div>

          {/* Title on Scrim */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug drop-shadow-sm truncate">
              {title}
            </h3>
            <p className="text-xs text-white/80 font-medium">
              {formattedDates}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          {/* Budget Health Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-[var(--color-wakeru-text-tertiary)]">Budget Spent</span>
              <span className={isBudgetExceeded ? 'text-rose-500 font-bold' : isBudgetWarning ? 'text-amber-500 font-bold' : 'text-[var(--color-wakeru-text-secondary)]'}>
                {percentSpent}%
              </span>
            </div>
            <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(percentSpent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--color-wakeru-text-muted)] mt-1.5">
              <span>Spent: {currency} {spent.toLocaleString()}</span>
              {budget > 0 && <span>Cap: {currency} {budget.toLocaleString()}</span>}
            </div>
          </div>

          {/* Footer: Members Avatar Pile */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 dark:border-white/5">
            <div className="flex items-center -space-x-2">
              {members.slice(0, 4).map((m, idx) => {
                const name = m.displayName || m.name || `User ${idx + 1}`;
                const avatar = m.photoURL || m.avatarUrl;
                return (
                  <div
                    key={m.userId || idx}
                    title={name}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300 overflow-hidden"
                  >
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                );
              })}
              {members.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                  +{members.length - 4}
                </div>
              )}
            </div>

            <span className="text-xs font-semibold text-[var(--color-wakeru-brand-gold)] group-hover:translate-x-0.5 transition-transform">
              View Hub →
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export default TripCard;
