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
import { StatCard } from '@/design-system/components/StatCard';
import { TripCard } from '@/design-system/components/TripCard';
import { ExpenseCard } from '@/design-system/components/ExpenseCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [balances, setBalances] = useState<AuthoritativeBalances | null>(null);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<IExpense[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, balRes, tripsRes, expRes] = await Promise.allSettled([
        dashboardApi.getDashboard(),
        ledgerApi.getBalances(),
        tripsApi.getMyTrips({ limit: 6 }),
        expensesApi.getMyExpenses({ limit: 5 }),
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-80 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>✨ Welcome back, {user?.displayName || user?.name || 'Traveler'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            Financial &amp; Travel Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Real-time group budgets, debt-minimized settlements, and companion itineraries.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/trips/create">
            <Button variant="gold" size="sm" className="flex items-center gap-1.5 shadow-sm">
              <AppIcon name="plus" size={16} />
              <span>Plan Trip</span>
            </Button>
          </Link>
          <Link href="/expenses">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
              <AppIcon name="receipt" size={16} />
              <span>Expenses</span>
            </Button>
          </Link>
          <Link href="/balances">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
              <AppIcon name="wallet" size={16} />
              <span>Settle Up</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Stat Cards (Direct port of native StatCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Group Balance"
          amount={netBalance}
          currency={currency}
          variant={netBalance >= 0 ? 'success' : 'danger'}
          subtitle={netBalance >= 0 ? 'Net positive receivable' : 'Net outstanding debt'}
          icon={<AppIcon name="wallet" size={18} />}
        />

        <StatCard
          title="You Owe"
          amount={youOwe}
          currency={currency}
          variant="danger"
          subtitle="To trip companions"
          icon={<AppIcon name="arrow-right" size={18} />}
        />

        <StatCard
          title="You Are Owed"
          amount={owesYou}
          currency={currency}
          variant="success"
          subtitle="Pending settlement"
          icon={<AppIcon name="arrow-left" size={18} />}
        />

        <StatCard
          title="Active Journeys"
          amount={activeTrips.length}
          currency=""
          variant="default"
          subtitle={activeTrips.length === 1 ? '1 ongoing journey' : `${activeTrips.length} journeys active`}
          icon={<AppIcon name="plane" size={18} />}
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Trips & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Trips Section with TripCards */}
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

          {/* Recent Expenses Feed with ExpenseCards */}
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
              <GlassCard variant="soft" padding="lg" className="text-center text-xs text-[var(--color-wakeru-text-secondary)]">
                No recent expenses recorded. Add your first shared or personal expense.
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map(expense => (
                  <ExpenseCard
                    key={expense._id || expense.id}
                    expense={{
                      id: expense._id || expense.id,
                      title: expense.description || expense.title,
                      amount: expense.amount,
                      currency: expense.currency || 'INR',
                      category: expense.category,
                      date: expense.date,
                      paidByName: expense.paidBy === user?._id ? 'You' : 'Member',
                      isSettled: expense.isSettled,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Outstanding Balances & Shortcuts */}
        <div className="space-y-6">
          <GlassCard variant="prominent" padding="lg">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                Outstanding Balances
              </h3>
              <Link href="/balances" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">
                Full Ledger
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {balances?.counterparties && balances.counterparties.length > 0 ? (
                balances.counterparties.slice(0, 5).map(cp => (
                  <div
                    key={cp.counterpartyId}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                        {cp.counterpartyName}
                      </p>
                      <p className="text-[10px] text-[var(--color-wakeru-text-muted)] mt-0.5">
                        {cp.direction === 'owes_you' ? '🟢 Owes you' : '🔴 You owe'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold ${
                          cp.direction === 'owes_you' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(Math.abs(cp.netAmount), balances.baseCurrency || 'INR')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[var(--color-wakeru-text-secondary)]">
                  <span>✨ All balances are settled up!</span>
                </div>
              )}

              <Link href="/balances" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Review &amp; Settle All Debts
                </Button>
              </Link>
            </div>
          </GlassCard>

          {/* Quick Hub Navigation Cards */}
          <GlassCard variant="warm" padding="lg">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-amber-500/20">
              TripSplit Features
            </h3>
            <div className="space-y-1.5 pt-3 text-xs">
              <Link
                href="/finance"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-500/10 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">📊</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Personal Finance &amp; Budgets</span>
                </span>
                <span className="text-amber-600">→</span>
              </Link>
              <Link
                href="/expenses/receipt-scanner"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-500/10 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">📸</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Receipt Scanner (OCR)</span>
                </span>
                <span className="text-amber-600">→</span>
              </Link>
              <Link
                href="/friends"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-500/10 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">👥</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Friends &amp; Travel Buddies</span>
                </span>
                <span className="text-amber-600">→</span>
              </Link>
              <Link
                href="/achievements"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-500/10 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">🏆</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Badges &amp; Milestones</span>
                </span>
                <span className="text-amber-600">→</span>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
