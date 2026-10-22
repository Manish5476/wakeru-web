'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { AppIcon } from './AppIcon';
import { formatCurrency } from '@/lib/formatters';

interface ExecutiveBalanceCardProps {
  netBalance: number;
  totalOwed: number;
  totalLent: number;
  currency?: string;
  onPressExplain?: () => void;
  className?: string;
}

/**
 * ExecutiveBalanceCard — Faithfully reproduces the flagship financial
 * summary card from TripSplit/src/app/(app)/(tabs)/dashboard.tsx.
 */
export function ExecutiveBalanceCard({
  netBalance,
  totalOwed,
  totalLent,
  currency = 'INR',
  onPressExplain,
  className = '',
}: ExecutiveBalanceCardProps) {
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const isPositive = netBalance > 0.01;
  const isNegative = netBalance < -0.01;
  const isZero = !isPositive && !isNegative;

  return (
    <>
      <GlassCard variant="prominent" padding="lg" className={`relative overflow-hidden ${className}`}>
        {/* Top Net Balance Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5 dark:border-white/10">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
              OVERALL NET BALANCE
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
                  isZero
                    ? 'text-[var(--color-wakeru-text-primary)]'
                    : isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isZero ? '' : isPositive ? '+' : '−'}
                {formatCurrency(Math.abs(netBalance), currency)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1 font-medium">
              {isZero
                ? 'All group balances settled up'
                : isPositive
                ? 'You are owed in total across all trips'
                : 'You owe in total across all trips'}
            </p>
          </div>

          {/* Status Tag Pill */}
          <div
            className={`self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isZero
                ? 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20'
                : isPositive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
            }`}
          >
            <AppIcon
              name={isZero ? 'check-circle' : isPositive ? 'arrow-up-right' : 'arrow-down-left'}
              size={15}
            />
            <span>{isZero ? 'Settled Up' : isPositive ? 'In Credit' : 'In Debt'}</span>
          </div>
        </div>

        {/* Dual Bottom Split Metrics (You Owe vs Owed to You) */}
        <div className="grid grid-cols-2 gap-3 pt-5">
          {/* Tile 1: You Owe */}
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 block truncate">
                YOU OWE
              </span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400 truncate block">
                {formatCurrency(totalOwed, currency)}
              </span>
            </div>
          </div>

          {/* Tile 2: Owed to You */}
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 block truncate">
                OWED TO YOU
              </span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 truncate block">
                {formatCurrency(totalLent, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Explain Calculation Trigger Link */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onPressExplain || (() => setShowCalculationModal(true))}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold"
          >
            <AppIcon name="help-circle" size={14} />
            <span>How was this calculated?</span>
          </button>
          <span className="text-[11px] font-mono text-zinc-400">Min-Cash-Flow Alg</span>
        </div>
      </GlassCard>

      {/* Explanatory Calculation Modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg glass-panel-prominent rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AppIcon name="help-circle" size={18} />
                </div>
                <h3 className="font-extrabold text-base text-[var(--color-wakeru-text-primary)]">
                  Balance Calculation Engine
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <AppIcon name="x" size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              <p>
                TripSplit calculates your financial status using an authoritative double-entry balance ledger combined with a bipartite min-cash-flow greedy optimization engine:
              </p>
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 font-mono text-[11px] space-y-1">
                <div>Net Balance = Total Lent (Paid for Others) − Total Owed (Others Paid for You)</div>
                <div className="text-emerald-600 dark:text-emerald-400">Total Lent: {formatCurrency(totalLent, currency)}</div>
                <div className="text-rose-600 dark:text-rose-400">Total Owed: {formatCurrency(totalOwed, currency)}</div>
                <div className="font-bold border-t border-black/5 dark:border-white/10 pt-1">
                  Result: {netBalance >= 0 ? '+' : '−'}{formatCurrency(Math.abs(netBalance), currency)}
                </div>
              </div>
              <p>
                When multiple members incur overlapping debts, circular dependencies (A owes B, B owes C, C owes A) are pruned into the minimum number of direct peer transfers.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExecutiveBalanceCard;
