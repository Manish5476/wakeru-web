'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { dashboardApi, DashboardData } from '@/api/dashboard';
import { ledgerApi, AuthoritativeBalances } from '@/api/ledger';
import { tripsApi } from '@/api/trips';
import { expensesApi } from '@/api/expenses';
import { ITrip } from '@/types/trip.types';
import { IExpense } from '@/types/expense.types';
import { formatCurrency } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { GlassCard } from '@/design-system/components/GlassCard';
import { ExecutiveBalanceCard } from '@/design-system/components/ExecutiveBalanceCard';
import { BentoQuickActions } from '@/design-system/components/BentoQuickActions';
import { TripCard } from '@/design-system/components/TripCard';
import { ExpenseCard } from '@/design-system/components/ExpenseCard';

function getGreeting(): { emoji: string; text: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { emoji: '🌙', text: 'Good Night' };
  if (hour < 12) return { emoji: '🌅', text: 'Good Morning' };
  if (hour < 17) return { emoji: '☀️', text: 'Good Afternoon' };
  if (hour < 21) return { emoji: '🌇', text: 'Good Evening' };
  return { emoji: '🌙', text: 'Good Night' };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [balances, setBalances] = useState<AuthoritativeBalances | null>(null);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<IExpense[]>([]);
  const [error, setError] = useState<string | null>(null);

  const greeting = getGreeting();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, balRes, tripsRes, expRes] = await Promise.allSettled([
        dashboardApi.getDashboard(),
        ledgerApi.getBalances(),
        tripsApi.getMyTrips({ limit: 6 }),
        expensesApi.getMyExpenses({ limit: 6 }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data);
      }
      if (balRes.status === 'fulfilled' && balRes.value?.data) {
        setBalances(balRes.value.data);
      }
      if (tripsRes.status === 'fulfilled' && tripsRes.value?.data?.trips) {
        setTrips(tripsRes.value.data.trips);
      }
      if (expRes.status === 'fulfilled') {
        const data = expRes.value?.data;
        if (data && 'expenses' in data && Array.isArray(data.expenses)) {
          setRecentExpenses(data.expenses);
        } else if (data && 'items' in data && Array.isArray(data.items)) {
          setRecentExpenses(data.items as IExpense[]);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load dashboard:', err);
      setError('Could not connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeTrips = trips.filter(t => t.status === 'active' || t.status === 'planning');
  const netBalance = balances?.netBalance ?? dashboardData?.stats?.netBalance ?? 0;
  const youOwe = balances?.grossYouOwe ?? 0;
  const owesYou = balances?.grossOwedToYou ?? 0;
  const currency = balances?.baseCurrency || 'INR';

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-black/5 dark:bg-white/5 rounded-2xl w-1/3"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-44 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-80 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Top Greeting Ribbon (Exact Expo Greeting) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>
              {greeting.emoji} {greeting.text}, {user?.displayName || user?.name || 'Traveler'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-wakeru-text-primary)] tracking-tight">
            Financial &amp; Travel Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Live group travel budgets, debt-minimized settlements, and companion itineraries.
          </p>
        </div>

        {/* Global Search / Action Trigger */}
        <Link href="/trips/create">
          <Button variant="gold" size="sm" className="flex items-center gap-1.5 shadow-sm">
            <AppIcon name="plus" size={16} />
            <span>Plan New Trip</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* ── 1. Bento Quick Actions Cluster (Exact Expo Bento) ── */}
      <BentoQuickActions />

      {/* ── 2. Executive Net Balance Card (Exact Expo Card) ── */}
      <ExecutiveBalanceCard
        netBalance={netBalance}
        totalOwed={youOwe}
        totalLent={owesYou}
        currency={currency}
      />

      {/* ── 3. Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Trips & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Trips Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌴</span>
                <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
                  Current &amp; Upcoming Trips
                </h2>
              </div>
              <Link href="/trips" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                View All ({trips.length})
              </Link>
            </div>

            {activeTrips.length === 0 ? (
              <GlassCard variant="soft" padding="xl" className="text-center">
                <div className="text-4xl mb-3">🏖️</div>
                <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
                  No active trips right now
                </h3>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1.5 max-w-sm mx-auto">
                  Create a new group trip to split accommodations, transport, and dining with companions.
                </p>
                <Link href="/trips/create" className="inline-block mt-4">
                  <Button variant="gold" size="sm">
                    Create New Trip
                  </Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {activeTrips.slice(0, 4).map(trip => (
                  <TripCard
                    key={trip._id || trip.id}
                    trip={{
                      id: trip._id || trip.id,
                      title: trip.name || trip.title,
                      coverImage: trip.coverImage,
                      startDate: trip.startDate,
                      endDate: trip.endDate,
                      status: trip.status,
                      baseCurrency: trip.currency || 'INR',
                      totalBudget: trip.budget,
                      totalSpentBase: trip.spentBase,
                      members: trip.members?.map(m => ({
                        userId: m.userId,
                        displayName: m.name,
                        photoURL: m.avatar,
                      })),
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">💳</span>
                <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
                  Recent Expenses
                </h2>
              </div>
              <Link href="/expenses" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                View All Expenses
              </Link>
            </div>

            {recentExpenses.length === 0 ? (
              <GlassCard variant="soft" padding="lg" className="text-center text-xs text-zinc-500">
                No recent expenses recorded yet.
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {recentExpenses.slice(0, 5).map(expense => (
                  <ExpenseCard
                    key={expense._id || expense.id}
                    expense={{
                      id: expense._id || expense.id,
                      title: expense.title || expense.description || 'Expense',
                      amount: expense.amount,
                      currency: expense.currency || currency,
                      category: expense.category,
                      date: expense.date,
                      paidByName: typeof expense.paidBy === 'object' ? (expense.paidBy as any)?.name : (expense.paidByName || 'Someone'),
                      paidBy: typeof expense.paidBy === 'string' ? expense.paidBy : (expense.paidBy as any)?._id || '',
                      splits: expense.splits,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Settlement Engine & Summaries */}
        <div className="space-y-6">
          {/* Quick Settlement Summary Widget */}
          <GlassCard variant="medium" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <AppIcon name="check-circle" size={18} />
                </div>
                <h3 className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                  Settlement Engine
                </h3>
              </div>
              <Link href="/balances" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                Settle Up →
              </Link>
            </div>

            <p className="text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              Greedy graph min-cash-flow algorithms condense group IOUs into the minimum number of direct UPI payments.
            </p>

            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">You Owe Companions:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(youOwe, currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Owed to You:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(owesYou, currency)}
                </span>
              </div>
            </div>

            <Link href="/balances" className="block w-full">
              <Button variant="secondary" size="sm" className="w-full text-xs font-bold">
                Review &amp; Pay via UPI
              </Button>
            </Link>
          </GlassCard>

          {/* Quick Travel Planner Shortcut */}
          <GlassCard variant="warm" padding="lg" className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈️</span>
              <h3 className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                Collaborative Planner
              </h3>
            </div>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              Build day-by-day itineraries, track packing checklists, and pin flight or villa reservations with your companions.
            </p>
            <Link href="/trips" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Explore Trips Portfolio
              </Button>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
