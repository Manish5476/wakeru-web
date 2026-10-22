'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { ITrip, ITripMember } from '@/types/trip.types';
import { IExpense, ExpenseCategory } from '@/types/expense.types';
import { ISettlement, ISettlementTransaction, MemberBalance } from '@/types/settlement.types';
import { ITravelPlan, IItineraryDay, IPackingItem } from '@/types/travelPlan.types';
import { tripsApi } from '@/api/trips';
import { expensesApi } from '@/api/expenses';
import { settlementsApi } from '@/api/settlements';
import {
  formatCurrency,
  formatDateRange,
  formatDateShort,
  getCategoryMeta,
  getInitials,
} from '@/lib/formatters';
import { AppIcon, AppIconName } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';
import { exportExpensesToCsv, generateWhatsAppSettlementSummary } from '@/lib/exportUtils';

const FX_RATES: Record<string, number> = {
  INR: 1,
  USD: 87.5,
  EUR: 94.2,
  GBP: 111.8,
  AED: 23.8,
  THB: 2.45,
  JPY: 0.58,
};

type ActiveTab = 'overview' | 'expenses' | 'settlements' | 'itinerary' | 'members';

/**
 * Derives each companion's fair balance from the trip roster, logged expenses, and settlements.
 * Fallback when raw balances array is omitted from backend settlement response.
 */
function deriveMemberBalances(
  trip: ITrip | null,
  expenses: IExpense[] = [],
  _settlement: ISettlement | null = null,
): MemberBalance[] {
  if (!trip || !Array.isArray(trip.members) || trip.members.length === 0) {
    return [];
  }

  const balanceMap = new Map<
    string,
    {
      userId: string;
      userName: string;
      avatarUrl?: string;
      totalPaid: number;
      totalShare: number;
    }
  >();

  // Initialize with trip members
  trip.members.forEach(member => {
    const id = member.userId || member.id;
    balanceMap.set(id, {
      userId: id,
      userName: member.name || 'Member',
      avatarUrl: member.avatarUrl || member.avatar,
      totalPaid: 0,
      totalShare: 0,
    });
  });

  // Accumulate paid and shares from expenses
  if (Array.isArray(expenses)) {
    expenses.forEach(exp => {
      // 1. Total paid
      if (Array.isArray(exp.payers) && exp.payers.length > 0) {
        exp.payers.forEach(p => {
          if (!balanceMap.has(p.userId)) {
            balanceMap.set(p.userId, {
              userId: p.userId,
              userName: p.userName || 'Member',
              totalPaid: 0,
              totalShare: 0,
            });
          }
          const rec = balanceMap.get(p.userId)!;
          rec.totalPaid += Number(p.amount) || 0;
        });
      } else if (exp.paidBy) {
        if (!balanceMap.has(exp.paidBy)) {
          balanceMap.set(exp.paidBy, {
            userId: exp.paidBy,
            userName: exp.paidByName || 'Member',
            totalPaid: 0,
            totalShare: 0,
          });
        }
        const rec = balanceMap.get(exp.paidBy)!;
        rec.totalPaid += Number(exp.amount) || 0;
      }

      // 2. Total share (what each person owes)
      if (Array.isArray(exp.splits)) {
        exp.splits.forEach(s => {
          if (!balanceMap.has(s.userId)) {
            balanceMap.set(s.userId, {
              userId: s.userId,
              userName: s.userName || 'Member',
              totalPaid: 0,
              totalShare: 0,
            });
          }
          const rec = balanceMap.get(s.userId)!;
          rec.totalShare += Number(s.amount) || 0;
        });
      }
    });
  }

  return Array.from(balanceMap.values()).map(b => ({
    userId: b.userId,
    userName: b.userName,
    avatarUrl: b.avatarUrl,
    totalPaid: Math.round(b.totalPaid * 100) / 100,
    totalShare: Math.round(b.totalShare * 100) / 100,
    netBalance: Math.round((b.totalPaid - b.totalShare) * 100) / 100,
  }));
}

export default function TripHubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [settlement, setSettlement] = useState<ISettlement | null>(null);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [travelPlan, setTravelPlan] = useState<ITravelPlan | null>(null);

  // Modals & States
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [settleModalTx, setSettleModalTx] = useState<ISettlementTransaction | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [addDayModalOpen, setAddDayModalOpen] = useState<boolean>(false);
  const [addPackingModalOpen, setAddPackingModalOpen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // New Itinerary Day Form State
  const [newDayTheme, setNewDayTheme] = useState('');
  const [newDayMorning, setNewDayMorning] = useState('');
  const [newDayAfternoon, setNewDayAfternoon] = useState('');
  const [newDaySunset, setNewDaySunset] = useState('');
  const [newDayStay, setNewDayStay] = useState('');

  // New Packing Item Form State
  const [newPackName, setNewPackName] = useState('');
  const [newPackCategory, setNewPackCategory] = useState<IPackingItem['category']>('clothing');
  const [newPackAssigned, setNewPackAssigned] = useState('Everyone');

  // Currency Converter State
  const [fxAmount, setFxAmount] = useState<string>('100');
  const [fxFrom, setFxFrom] = useState<string>('USD');
  const [fxTo, setFxTo] = useState<string>('INR');

  // WhatsApp Share Ledger
  const [shareLedgerModalOpen, setShareLedgerModalOpen] = useState<boolean>(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);

  // Expense Filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const tabQuery = searchParams.get('tab');
    if (tabQuery && ['overview', 'expenses', 'settlements', 'itinerary', 'members'].includes(tabQuery)) {
      setActiveTab(tabQuery as ActiveTab);
    }
    loadAllTripData();
  }, [tripId, searchParams]);

  const loadAllTripData = async () => {
    try {
      setLoading(true);
      const [tripRes, expRes, settleRes, planRes] = await Promise.all([
        tripsApi.getTrip(tripId),
        expensesApi.getTripExpenses(tripId),
        settlementsApi.getSettlement(tripId),
        tripsApi.getTravelPlan(tripId),
      ]);

      const loadedTrip = (tripRes as any)?.data?.trip || (tripRes as any)?.trip || (tripRes as any)?.data || null;
      const loadedExpenses = (expRes as any)?.data?.expenses || (expRes as any)?.expenses || (expRes as any)?.data?.items || [];
      const loadedSettlement = (settleRes as any)?.data?.settlement || (settleRes as any)?.settlement || null;

      const rawBalances = (settleRes as any)?.data?.balances || (settleRes as any)?.balances;
      const computedBalances = Array.isArray(rawBalances)
        ? rawBalances
        : deriveMemberBalances(loadedTrip, loadedExpenses, loadedSettlement);

      setTrip(loadedTrip);
      setExpenses(Array.isArray(loadedExpenses) ? loadedExpenses : []);
      setSettlement(loadedSettlement);
      setBalances(computedBalances);
      setTravelPlan((planRes as any)?.data?.plan || (planRes as any)?.plan || null);
    } catch (err) {
      console.error('Failed to load trip hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (!trip?.inviteCode) return;
    navigator.clipboard.writeText(trip.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = () => {
    if (typeof window === 'undefined' || !trip?.inviteCode) return;
    const url = `${window.location.origin}/trips/join/${trip.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCsv = () => {
    if (trip) {
      exportExpensesToCsv(trip, expenses);
    }
  };

  const handleCopyWhatsAppSummary = () => {
    if (!trip || !settlement) return;
    const safeBalances = Array.isArray(balances) ? balances : [];
    const text = generateWhatsAppSettlementSummary(trip, settlement, safeBalances);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleConfirmSettlementPayment = async (txId: string) => {
    try {
      const res = await settlementsApi.confirmTransaction(tripId, txId);
      setSettlement((res as any)?.data?.settlement || (res as any)?.settlement);
      setSettleModalTx(null);
    } catch (err) {
      console.error('Failed to confirm payment:', err);
    }
  };

  const handleTogglePackingItem = async (itemId: string) => {
    if (!travelPlan) return;
    const updatedList = travelPlan.packingList.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    );
    setTravelPlan({ ...travelPlan, packingList: updatedList });
    await tripsApi.updateTravelPlan(tripId, { packingList: updatedList });
  };

  const handleAddItineraryDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelPlan) return;

    const nextDayNum = travelPlan.itinerary.length + 1;
    const newDay: IItineraryDay = {
      dayNumber: nextDayNum,
      theme: newDayTheme || `Day ${nextDayNum} Exploration`,
      morning: newDayMorning || 'Breakfast and morning activities',
      afternoon: newDayAfternoon || 'Sightseeing and local discovery',
      sunset: newDaySunset || 'Sunset dinner and evening relaxation',
      accommodation: newDayStay || undefined,
    };

    const updated = [...travelPlan.itinerary, newDay];
    setTravelPlan({ ...travelPlan, itinerary: updated });
    await tripsApi.updateTravelPlan(tripId, { itinerary: updated });

    setAddDayModalOpen(false);
    setNewDayTheme('');
    setNewDayMorning('');
    setNewDayAfternoon('');
    setNewDaySunset('');
    setNewDayStay('');
  };

  const handleAddPackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelPlan || !newPackName.trim()) return;

    const newItem: IPackingItem = {
      id: `pack_${Date.now()}`,
      name: newPackName.trim(),
      category: newPackCategory,
      checked: false,
      assignedToName: newPackAssigned,
    };

    const updated = [...travelPlan.packingList, newItem];
    setTravelPlan({ ...travelPlan, packingList: updated });
    await tripsApi.updateTravelPlan(tripId, { packingList: updated });

    setAddPackingModalOpen(false);
    setNewPackName('');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expensesApi.archiveExpense(expenseId);
      setSelectedExpense(null);
      // Reload expenses & settlement
      const [expRes, settleRes] = await Promise.all([
        expensesApi.getTripExpenses(tripId),
        settlementsApi.calculateSettlement(tripId),
      ]);
      const loadedExpenses = (expRes as any)?.data?.expenses || (expRes as any)?.expenses || (expRes as any)?.data?.items || [];
      const loadedSettlement = (settleRes as any)?.data?.settlement || (settleRes as any)?.settlement || null;
      const rawBalances = (settleRes as any)?.data?.balances || (settleRes as any)?.balances;
      const computedBalances = Array.isArray(rawBalances)
        ? rawBalances
        : deriveMemberBalances(trip, loadedExpenses, loadedSettlement);

      setExpenses(Array.isArray(loadedExpenses) ? loadedExpenses : []);
      setSettlement(loadedSettlement);
      setBalances(computedBalances);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  if (loading || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[var(--color-wakeru-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-wakeru-text-primary)]">
          Loading Trip Hub...
        </h2>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Synchronizing balances, itinerary, and split calculation engine.
        </p>
      </div>
    );
  }

  // Budget calculations
  const totalBudget = trip.budget || 1;
  const totalSpent = trip.spentBase || 0;
  const budgetPct = Math.min(100, Math.round((totalSpent / totalBudget) * 100));
  const isBudgetExceeded = totalSpent > totalBudget;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  // Safe Balances List
  const safeBalances = Array.isArray(balances) ? balances : [];

  // Current User Balance
  const currentUserId = user?._id || user?.id || user?.firebaseUid || 'usr_me';
  const myBalance = safeBalances.find(
    b =>
      b.userId === currentUserId ||
      b.userId === user?._id ||
      b.userId === user?.id ||
      b.userId === user?.firebaseUid ||
      b.userId === 'usr_me'
  ) || safeBalances[0];
  const myNet = myBalance?.netBalance || 0;

  // Filtered expenses
  const filteredExpenses = (expenses || []).filter(e => {
    if (categoryFilter === 'all') return true;
    return e.category === categoryFilter;
  });

  return (
    <div className="min-h-screen pb-16 overflow-x-hidden w-full max-w-full">
      {/* 1. Hero Vacation Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        {/* Hero Content */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-between py-6">
          {/* Top Row: Back to Portfolio + Invite Code */}
          <div className="flex items-center justify-between">
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold transition-colors"
            >
              <AppIcon name="arrow-left" size={14} />
              <span>All Trips</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-mono font-bold transition-colors"
                title="Click to copy invite code"
              >
                <AppIcon name="users" size={14} />
                <span>Code: #{trip.inviteCode}</span>
                {copiedCode ? (
                  <span className="text-emerald-400 font-sans text-[10px]">Copied!</span>
                ) : (
                  <AppIcon name="copy" size={12} />
                )}
              </button>

              <button
                onClick={() => setInviteModalOpen(true)}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
                title="Share Trip & QR Code"
              >
                <AppIcon name="share-2" size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Row: Title, Destination, Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{trip.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                  {trip.status}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {trip.destination}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black drop-shadow-md">
                {trip.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <AppIcon name="calendar" size={14} />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                <span>•</span>
                <span>{(trip.members || []).length} companions</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Link href={`/trips/${tripId}/expenses/scan`}>
                <Button variant="secondary" className="shadow-md flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                  <AppIcon name="camera" size={16} />
                  <span className="hidden sm:inline">Scan Receipt</span>
                </Button>
              </Link>
              <Link href={`/trips/${tripId}/expenses/add`}>
                <Button variant="primary" className="shadow-lg flex items-center gap-2">
                  <AppIcon name="plus" size={16} />
                  <span>Add Expense</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs (Frosted Floating Bar) */}
      <div className="sticky top-16 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5">
          {(
            [
              { id: 'overview', label: 'Trip Overview', icon: 'compass' },
              { id: 'expenses', label: `Expenses (${expenses.length})`, icon: 'receipt' },
              { id: 'settlements', label: 'Debt Settlements', icon: 'wallet' },
              { id: 'itinerary', label: 'Itinerary & Packing', icon: 'calendar' },
              { id: 'members', label: `Companions (${(trip.members || []).length})`, icon: 'users' },
            ] as const
          ).map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                    : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <AppIcon name={tab.icon as AppIconName} size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Budget Health Card */}
              <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                    Budget Health
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isBudgetExceeded
                        ? 'bg-red-500/10 text-red-600'
                        : budgetPct > 80
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-emerald-500/10 text-emerald-600'
                    }`}
                  >
                    {isBudgetExceeded ? 'Exceeded' : budgetPct > 80 ? 'Near Limit' : 'Healthy'}
                  </span>
                </div>

                <div className="text-3xl font-black text-[var(--color-wakeru-text-primary)] mb-1">
                  {formatCurrency(totalSpent, trip.currency)}
                </div>
                <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-4">
                  of {formatCurrency(totalBudget, trip.currency)} total estimated budget
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--color-wakeru-surface-muted)] h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isBudgetExceeded
                        ? 'bg-red-500'
                        : budgetPct > 80
                        ? 'bg-amber-500'
                        : 'bg-[var(--color-wakeru-primary)]'
                    }`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--color-wakeru-text-secondary)]">
                  <span>{budgetPct}% utilized</span>
                  <span>{formatCurrency(remainingBudget, trip.currency)} left</span>
                </div>
              </div>

              {/* Your Personal Net Balance Card */}
              <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                    Your Trip Balance
                  </span>
                  <AppIcon name="wallet" size={18} className="text-[var(--color-wakeru-primary)]" />
                </div>

                <div
                  className={`text-3xl font-black mb-1 ${
                    myNet > 0 ? 'text-emerald-600' : myNet < 0 ? 'text-red-500' : 'text-[var(--color-wakeru-text-primary)]'
                  }`}
                >
                  {myNet > 0
                    ? `+${formatCurrency(myNet, trip.currency)}`
                    : myNet < 0
                    ? `-${formatCurrency(Math.abs(myNet), trip.currency)}`
                    : formatCurrency(0, trip.currency)}
                </div>
                <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-4">
                  {myNet > 0
                    ? 'Companions owe you in total'
                    : myNet < 0
                    ? 'You owe companions in total'
                    : 'You are completely settled up!'}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-wakeru-border)] text-xs">
                  <span className="text-[var(--color-wakeru-text-secondary)]">Total paid by you:</span>
                  <span className="font-bold text-[var(--color-wakeru-text-primary)]">
                    {formatCurrency(myBalance?.totalPaid || 0, trip.currency)}
                  </span>
                </div>
              </div>

              {/* Debt Simplifier Engine Status */}
              <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                      Debt Simplifier
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 uppercase">
                      Min-Cash-Flow
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[var(--color-wakeru-text-primary)] mb-1">
                    {settlement?.transactions.length || 0} Transfers
                  </div>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    Graph optimization eliminated cross-payments so everyone settles in 1 payment.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('settlements')}
                  className="mt-4 text-xs font-bold text-[var(--color-wakeru-primary)] hover:underline flex items-center gap-1"
                >
                  <span>Review Settlements &amp; UPI</span>
                  <AppIcon name="chevron-right" size={14} />
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Recent Expenses */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
                    Recent Group Expenses
                  </h2>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="text-xs font-bold text-[var(--color-wakeru-primary)] hover:underline"
                  >
                    View All ({expenses.length})
                  </button>
                </div>

                <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] divide-y divide-[var(--color-wakeru-border)] overflow-hidden shadow-xs">
                  {expenses.slice(0, 5).map(exp => {
                    const meta = getCategoryMeta(exp.category);
                    return (
                      <div
                        key={exp._id || exp.id}
                        onClick={() => setSelectedExpense(exp)}
                        className="cursor-pointer p-4 flex items-center justify-between hover:bg-[var(--color-wakeru-surface-muted)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] flex items-center justify-center text-lg">
                            {meta.emoji}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                              {exp.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                              <span>Paid by {exp.paidByName || 'Member'}</span>
                              <span>•</span>
                              <span>{formatDateShort(exp.date)}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-wakeru-surface-muted)] font-bold">
                                {exp.splitType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-[var(--color-wakeru-text-primary)] font-mono">
                            {formatCurrency(exp.amount, exp.currency)}
                          </div>
                          <div className="text-[11px] text-[var(--color-wakeru-text-tertiary)]">
                            {exp.splits.length} people split
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Col: Companion Balances */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
                    Companion Balances
                  </h2>
                  <button
                    onClick={() => setActiveTab('members')}
                    className="text-xs font-bold text-[var(--color-wakeru-primary)] hover:underline"
                  >
                    Manage
                  </button>
                </div>

                <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] p-4 shadow-xs space-y-3">
                  {safeBalances.map(b => (
                    <div
                      key={b.userId}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-wakeru-surface-muted)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-wakeru-primary)] text-white text-xs font-bold flex items-center justify-center">
                          {getInitials(b.userName)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                            {b.userName}
                          </div>
                          <div className="text-[10px] text-[var(--color-wakeru-text-secondary)]">
                            Paid {formatCurrency(b.totalPaid, trip.currency)}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-mono font-bold ${
                          b.netBalance > 0
                            ? 'text-emerald-600'
                            : b.netBalance < 0
                            ? 'text-red-500'
                            : 'text-[var(--color-wakeru-text-secondary)]'
                        }`}
                      >
                        {b.netBalance > 0
                          ? `+${formatCurrency(b.netBalance, trip.currency)}`
                          : b.netBalance < 0
                          ? `-${formatCurrency(Math.abs(b.netBalance), trip.currency)}`
                          : 'Settled'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Itinerary Highlight */}
                {travelPlan && travelPlan.itinerary.length > 0 && (
                  <div className="p-4 rounded-[var(--radius-card)] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                        Itinerary Highlight (Day 1)
                      </span>
                      <button
                        onClick={() => setActiveTab('itinerary')}
                        className="font-bold text-indigo-600 hover:underline"
                      >
                        All Days →
                      </button>
                    </div>
                    <div className="font-bold text-sm text-[var(--color-wakeru-text-primary)] mb-1">
                      {travelPlan.itinerary[0].theme}
                    </div>
                    <p className="text-[var(--color-wakeru-text-secondary)] line-clamp-2">
                      {travelPlan.itinerary[0].sunset || travelPlan.itinerary[0].morning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Multi-Currency Live Converter & Category Spending Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-wakeru-border)]">
              {/* Category Spending Breakdown */}
              <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                      Category Spend Breakdown
                    </h3>
                    <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                      How group funds are distributed across expense types
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--color-wakeru-primary)]">
                    {formatCurrency(totalSpent, trip.currency)}
                  </span>
                </div>

                <div className="space-y-3">
                  {(['stay', 'food', 'transport', 'activity', 'shopping', 'entertainment'] as ExpenseCategory[]).map(cat => {
                    const meta = getCategoryMeta(cat);
                    const catTotal = expenses
                      .filter(e => e.category === cat)
                      .reduce((sum, e) => sum + e.amount, 0);
                    const catPct = totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-[var(--color-wakeru-text-primary)]">
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>
                          <span className="font-mono text-[var(--color-wakeru-text-secondary)]">
                            {formatCurrency(catTotal, trip.currency)} ({catPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[var(--color-wakeru-surface-muted)] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${catPct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Currency Live Converter */}
              <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                      Live Multi-Currency Converter
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                      Real-Time FX
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    Quickly convert vacation expenses, menu items, or booking prices.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-1">
                        Amount &amp; From
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={fxAmount}
                          onChange={e => setFxAmount(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-mono font-bold"
                        />
                        <select
                          value={fxFrom}
                          onChange={e => setFxFrom(e.target.value)}
                          className="px-2 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-bold"
                        >
                          {Object.keys(FX_RATES).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-1">
                        Target Currency
                      </label>
                      <select
                        value={fxTo}
                        onChange={e => setFxTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-bold"
                      >
                        {Object.keys(FX_RATES).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-wakeru-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-wakeru-text-secondary)] font-medium">Converted Value:</span>
                    <span className="text-lg font-mono font-black text-[var(--color-wakeru-primary)]">
                      {fxTo} {(((parseFloat(fxAmount) || 0) * (FX_RATES[fxFrom] || 1)) / (FX_RATES[fxTo] || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[var(--color-wakeru-text-tertiary)] flex items-center justify-between">
                  <span>1 {fxFrom} ≈ {((FX_RATES[fxFrom] || 1) / (FX_RATES[fxTo] || 1)).toFixed(3)} {fxTo}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Zero Foreign Transaction Fee</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXPENSES & SPLIT */}
        {/* ========================================================================= */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Action Bar & Categories */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-[var(--color-wakeru-primary)] text-white'
                      : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
                  }`}
                >
                  All ({expenses.length})
                </button>
                {(['stay', 'food', 'transport', 'activity', 'shopping', 'entertainment'] as ExpenseCategory[]).map(
                  cat => {
                    const meta = getCategoryMeta(cat);
                    const count = expenses.filter(e => e.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                          categoryFilter === cat
                            ? 'bg-[var(--color-wakeru-primary)] text-white'
                            : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
                        }`}
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                        <span className="opacity-70 text-[10px]">({count})</span>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 shadow-xs shrink-0 text-xs"
                  title="Export all expenses to CSV spreadsheet"
                >
                  <AppIcon name="download" size={14} />
                  <span>Export CSV</span>
                </Button>
                <Link href={`/trips/${tripId}/expenses/scan`}>
                  <Button variant="outline" className="flex items-center gap-2 shadow-xs shrink-0 text-xs">
                    <AppIcon name="camera" size={15} />
                    <span>Scan Receipt</span>
                  </Button>
                </Link>
                <Link href={`/trips/${tripId}/expenses/add`}>
                  <Button variant="primary" className="flex items-center gap-2 shadow-xs shrink-0">
                    <AppIcon name="plus" size={16} />
                    <span>Add Expense</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Expense List */}
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-16 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)]">
                <div className="w-16 h-16 rounded-full bg-[var(--color-wakeru-surface-muted)] flex items-center justify-center mx-auto mb-4 text-2xl">
                  🧾
                </div>
                <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                  No expenses in this category
                </h3>
                <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-sm mx-auto mb-6">
                  Add shared bills, activities, or restaurant orders to calculate splits.
                </p>
                <Link href={`/trips/${tripId}/expenses/add`}>
                  <Button variant="primary">Record First Expense</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] divide-y divide-[var(--color-wakeru-border)] overflow-hidden shadow-xs">
                {filteredExpenses.map(exp => {
                  const meta = getCategoryMeta(exp.category);
                  const myShare = exp.splits.find(s => s.userId === 'usr_me');
                  const iPaid = exp.paidBy === 'usr_me';

                  return (
                    <div
                      key={exp._id || exp.id}
                      onClick={() => setSelectedExpense(exp)}
                      className="cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-wakeru-surface-muted)] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] flex items-center justify-center text-xl shrink-0">
                          {meta.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]">
                              {meta.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600">
                              {exp.splitType}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
                            {exp.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
                            <span>Paid by <strong className="text-[var(--color-wakeru-text-primary)]">{exp.paidByName || 'Companion'}</strong></span>
                            <span>•</span>
                            <span>{formatDateShort(exp.date)}</span>
                            {exp.lineItems && (
                              <>
                                <span>•</span>
                                <span className="text-[var(--color-wakeru-primary)] font-semibold">
                                  {exp.lineItems.length} itemized items
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amounts Breakdown */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-wakeru-border)]">
                        <div className="text-lg font-black text-[var(--color-wakeru-text-primary)] font-mono">
                          {formatCurrency(exp.amount, exp.currency)}
                        </div>
                        <div className="text-xs">
                          {iPaid ? (
                            <span className="text-emerald-600 font-semibold">
                              You paid full bill
                            </span>
                          ) : myShare ? (
                            <span className="text-amber-600 font-semibold">
                              Your share: {formatCurrency(myShare.amount, exp.currency)}
                            </span>
                          ) : (
                            <span className="text-[var(--color-wakeru-text-tertiary)]">
                              Not involved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SETTLEMENTS & DEBT SIMPLIFICATION */}
        {/* ========================================================================= */}
        {activeTab === 'settlements' && (
          <div className="space-y-8">
            {/* Info Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-xs">
                  <AppIcon name="wallet" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
                    Greedy Min-Cash-Flow Debt Engine
                  </h3>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                    Instead of dozens of messy back-and-forth transfers, TripSplit calculates the mathematically optimal minimum number of payments to settle the entire trip.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={loadAllTripData}
                  className="text-xs flex items-center gap-1.5"
                >
                  <AppIcon name="refresh-cw" size={14} />
                  <span>Recalculate</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShareLedgerModalOpen(true)}
                  className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <AppIcon name="share-2" size={14} />
                  <span>Share Ledger</span>
                </Button>
              </div>
            </div>

            {/* Simplified Transfer Actions List */}
            <div>
              <h2 className="text-xl font-black text-[var(--color-wakeru-text-primary)] mb-4">
                Required Payments ({settlement?.transactions.length || 0})
              </h2>

              {!settlement?.transactions || settlement.transactions.length === 0 ? (
                <div className="p-8 text-center bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)]">
                  <span className="text-3xl block mb-2">🎉</span>
                  <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
                    All Debts Are Fully Settled!
                  </h3>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
                    No outstanding balance between any companions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settlement.transactions.map(tx => {
                    const isFromMe = tx.fromUserId === 'usr_me';
                    const isToMe = tx.toUserId === 'usr_me';
                    const isConfirmed = tx.status === 'CONFIRMED';
                    const isInitiated = tx.status === 'INITIATED';

                    return (
                      <div
                        key={tx.id}
                        className={`p-5 rounded-[var(--radius-card)] border transition-all ${
                          isConfirmed
                            ? 'bg-[var(--color-wakeru-surface-muted)] border-emerald-500/30 opacity-75'
                            : 'bg-[var(--color-wakeru-surface)] border-[var(--color-wakeru-border)] shadow-xs hover:border-[var(--color-wakeru-primary)]'
                        }`}
                      >
                        {/* Transaction Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isConfirmed
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : isInitiated
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-slate-500/10 text-slate-600'
                            }`}
                          >
                            {tx.status}
                          </span>
                          <span className="text-lg font-black font-mono text-[var(--color-wakeru-text-primary)]">
                            {formatCurrency(tx.amount, tx.currency)}
                          </span>
                        </div>

                        {/* Who Pays Whom */}
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-wakeru-surface-muted)] mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center">
                              {getInitials(tx.fromUserName)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                                {tx.fromUserName}
                              </div>
                              <div className="text-[10px] text-[var(--color-wakeru-text-secondary)]">
                                {isFromMe ? 'You pay' : 'Sender'}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-[var(--color-wakeru-text-tertiary)]">→</span>
                            <span className="text-[10px] uppercase font-bold text-[var(--color-wakeru-primary)]">pays</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-wakeru-primary)] text-white text-xs font-bold flex items-center justify-center">
                              {getInitials(tx.toUserName)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                                {tx.toUserName}
                              </div>
                              <div className="text-[10px] text-[var(--color-wakeru-text-secondary)]">
                                {isToMe ? 'You receive' : 'Recipient'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* UPI / Payment Info */}
                        {tx.toUserUpi && (
                          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface)] p-2.5 rounded-lg border border-[var(--color-wakeru-border)] mb-4">
                            <span>UPI: {tx.toUserUpi}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tx.toUserUpi || '');
                                alert('UPI ID copied!');
                              }}
                              className="text-[var(--color-wakeru-primary)] hover:underline font-sans text-[11px]"
                            >
                              Copy
                            </button>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-wakeru-border)]">
                          {!isConfirmed ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSettleModalTx(tx)}
                                className="text-xs flex items-center gap-1.5"
                              >
                                <AppIcon name="qr-code" size={14} />
                                <span>QR / UPI Pay</span>
                              </Button>

                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleConfirmSettlementPayment(tx.id)}
                                className="text-xs flex items-center gap-1.5"
                              >
                                <AppIcon name="check" size={14} />
                                <span>Confirm Settled</span>
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <AppIcon name="check-circle" size={16} />
                              <span>Settlement Completed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Member Net Balances Breakdown Table */}
            <div>
              <h2 className="text-xl font-black text-[var(--color-wakeru-text-primary)] mb-4">
                Companion Net Ledger
              </h2>
              <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-wakeru-surface-muted)] border-b border-[var(--color-wakeru-border)] text-[var(--color-wakeru-text-secondary)] uppercase font-semibold">
                    <tr>
                      <th className="p-4">Companion</th>
                      <th className="p-4">Total Paid Out</th>
                      <th className="p-4">Total Fair Share</th>
                      <th className="p-4 text-right">Net Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-wakeru-border)]">
                    {safeBalances.map(b => (
                      <tr key={b.userId} className="hover:bg-[var(--color-wakeru-surface-muted)]/50">
                        <td className="p-4 font-bold text-[var(--color-wakeru-text-primary)] flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-wakeru-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                            {getInitials(b.userName)}
                          </div>
                          <span>{b.userName}</span>
                        </td>
                        <td className="p-4 font-mono font-medium text-[var(--color-wakeru-text-primary)]">
                          {formatCurrency(b.totalPaid, trip.currency)}
                        </td>
                        <td className="p-4 font-mono font-medium text-[var(--color-wakeru-text-primary)]">
                          {formatCurrency(b.totalShare, trip.currency)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold">
                          <span
                            className={
                              b.netBalance > 0
                                ? 'text-emerald-600'
                                : b.netBalance < 0
                                ? 'text-red-500'
                                : 'text-[var(--color-wakeru-text-secondary)]'
                            }
                          >
                            {b.netBalance > 0
                              ? `+${formatCurrency(b.netBalance, trip.currency)} (Owed)`
                              : b.netBalance < 0
                              ? `-${formatCurrency(Math.abs(b.netBalance), trip.currency)} (Owes)`
                              : '₹0.00 (Settled)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ITINERARY & PACKING */}
        {/* ========================================================================= */}
        {activeTab === 'itinerary' && travelPlan && (
          <div className="space-y-10">
            {/* AI Assistant Banner */}
            {travelPlan.aiAssistantNotes && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <AppIcon name="sparkles" size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Wakeru AI Concierge Note</span>
                  <p>{travelPlan.aiAssistantNotes}</p>
                </div>
              </div>
            )}

            {/* Day-by-Day Schedule Timeline */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--color-wakeru-text-primary)]">
                    Day-by-Day Schedule
                  </h2>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                    Morning, afternoon, and sunset plans for each day of the expedition.
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={() => setAddDayModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <AppIcon name="plus" size={14} />
                  <span>Add Itinerary Day</span>
                </Button>
              </div>

              <div className="space-y-6">
                {travelPlan.itinerary.map(day => (
                  <div
                    key={day.dayNumber}
                    className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--color-wakeru-border)] gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[var(--color-wakeru-primary)] text-white text-sm font-black flex items-center justify-center shadow-xs">
                          D{day.dayNumber}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
                            {day.theme}
                          </h3>
                          {day.date && (
                            <span className="text-xs text-[var(--color-wakeru-text-secondary)]">
                              {day.date}
                            </span>
                          )}
                        </div>
                      </div>

                      {day.accommodation && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface-muted)] px-3 py-1 rounded-full self-start sm:self-auto">
                          <span>🏨</span>
                          <span className="font-semibold">{day.accommodation}</span>
                        </div>
                      )}
                    </div>

                    {/* Timeline Slots */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Morning */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1.5">
                          <AppIcon name="sun" size={15} />
                          <span>Morning</span>
                        </div>
                        <p className="text-xs text-[var(--color-wakeru-text-primary)] leading-relaxed">
                          {day.morning || 'Open time for morning rest or breakfast.'}
                        </p>
                      </div>

                      {/* Afternoon */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1.5">
                          <AppIcon name="compass" size={15} />
                          <span>Afternoon</span>
                        </div>
                        <p className="text-xs text-[var(--color-wakeru-text-primary)] leading-relaxed">
                          {day.afternoon || 'Local discovery and exploration.'}
                        </p>
                      </div>

                      {/* Sunset / Evening */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-1.5">
                          <AppIcon name="moon" size={15} />
                          <span>Sunset &amp; Dinner</span>
                        </div>
                        <p className="text-xs text-[var(--color-wakeru-text-primary)] leading-relaxed">
                          {day.sunset || 'Group dinner and beach chill.'}
                        </p>
                      </div>
                    </div>

                    {day.notes && (
                      <div className="text-xs text-[var(--color-wakeru-text-secondary)] bg-blue-500/5 p-2.5 rounded-lg border border-blue-500/10">
                        💡 <strong>Note:</strong> {day.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Packing Checklist */}
            <div className="pt-6 border-t border-[var(--color-wakeru-border)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-[var(--color-wakeru-text-primary)]">
                    Group Packing Checklist
                  </h2>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                    Coordinate shared gear, documents, cameras, and first aid kits.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddPackingModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <AppIcon name="plus" size={14} />
                  <span>Add Item</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {travelPlan.packingList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleTogglePackingItem(item.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      item.checked
                        ? 'bg-[var(--color-wakeru-surface-muted)] border-[var(--color-wakeru-border)] opacity-60'
                        : 'bg-[var(--color-wakeru-surface)] border-[var(--color-wakeru-border)] shadow-xs hover:border-[var(--color-wakeru-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs border ${
                          item.checked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-[var(--color-wakeru-border-strong)]'
                        }`}
                      >
                        {item.checked && <AppIcon name="check" size={14} />}
                      </div>
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            item.checked ? 'line-through text-[var(--color-wakeru-text-secondary)]' : 'text-[var(--color-wakeru-text-primary)]'
                          }`}
                        >
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[var(--color-wakeru-text-tertiary)] uppercase tracking-wider">
                          {item.category} • Assigned: {item.assignedToName || 'Everyone'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency & Host Contacts Card */}
            {travelPlan.emergencyContacts && travelPlan.emergencyContacts.length > 0 && (
              <div className="pt-6 border-t border-[var(--color-wakeru-border)]">
                <h2 className="text-xl font-black text-[var(--color-wakeru-text-primary)] mb-4">
                  Emergency &amp; Host Directory
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {travelPlan.emergencyContacts.map(con => (
                    <div
                      key={con.id}
                      className="p-4 rounded-xl bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs"
                    >
                      <div className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                        {con.name}
                      </div>
                      <div className="text-[11px] text-[var(--color-wakeru-text-secondary)] mb-2">
                        {con.role}
                      </div>
                      <a
                        href={`tel:${con.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--color-wakeru-primary)] hover:underline"
                      >
                        <AppIcon name="phone" size={13} />
                        <span>{con.phone}</span>
                      </a>
                      {con.notes && (
                        <div className="text-[10px] text-[var(--color-wakeru-text-tertiary)] mt-1.5">
                          {con.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MEMBERS & INVITES */}
        {/* ========================================================================= */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--color-wakeru-text-primary)]">
                  Trip Companions ({(trip.members || []).length})
                </h2>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                  Anyone in this list can log expenses, participate in splits, and settle balances.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-2 shadow-xs"
              >
                <AppIcon name="share-2" size={16} />
                <span>Invite New Companion</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(trip.members || []).map(member => {
                const bal = safeBalances.find(b => b.userId === member.userId || b.userId === member.id);
                const isOwner = member.role === 'owner';

                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-wakeru-primary)] text-white text-sm font-bold flex items-center justify-center ring-2 ring-[var(--color-wakeru-surface)] shadow-xs">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                            {member.name}
                          </h3>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              isOwner
                                ? 'bg-[var(--color-wakeru-primary)]/15 text-[var(--color-wakeru-primary)]'
                                : 'bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)]'
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5 font-mono">
                          {member.upiId || member.email || 'No UPI saved'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-[var(--color-wakeru-text-tertiary)]">
                        Net Balance
                      </div>
                      <div
                        className={`text-sm font-mono font-bold ${
                          (bal?.netBalance || 0) > 0
                            ? 'text-emerald-600'
                            : (bal?.netBalance || 0) < 0
                            ? 'text-red-500'
                            : 'text-[var(--color-wakeru-text-primary)]'
                        }`}
                      >
                        {formatCurrency(bal?.netBalance || 0, trip.currency)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EXPENSE DETAILS MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        title={selectedExpense?.title}
        description={`Recorded on ${selectedExpense?.date ? formatDateShort(selectedExpense.date) : ''} by ${selectedExpense?.paidByName || 'Member'}`}
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => selectedExpense && handleDeleteExpense(selectedExpense._id || selectedExpense.id || '')}
              className="flex items-center gap-1.5"
            >
              <AppIcon name="trash" size={14} />
              <span>Delete Expense</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedExpense(null)}>
              Close
            </Button>
          </>
        }
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--color-wakeru-text-secondary)] block">
                  Total Bill Amount
                </span>
                <span className="text-2xl font-black font-mono text-[var(--color-wakeru-text-primary)]">
                  {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--color-wakeru-text-secondary)] block">
                  Split Mode
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[var(--color-wakeru-primary)]/10 text-[var(--color-wakeru-primary)]">
                  {selectedExpense.splitType}
                </span>
              </div>
            </div>

            {/* Line items if ITEMIZED */}
            {selectedExpense.lineItems && selectedExpense.lineItems.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                  Itemized Bill Breakdown
                </h4>
                <div className="border border-[var(--color-wakeru-border)] rounded-xl divide-y divide-[var(--color-wakeru-border)] overflow-hidden text-xs">
                  {selectedExpense.lineItems.map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[var(--color-wakeru-text-primary)]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[var(--color-wakeru-text-secondary)]">
                          Shared by {item.assignedUserIds.length} person(s)
                        </div>
                      </div>
                      <div className="font-mono font-bold">
                        {formatCurrency(item.amount, selectedExpense.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Splits */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Participant Shares
              </h4>
              <div className="space-y-2">
                {selectedExpense.splits.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--color-wakeru-surface-muted)] flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-[var(--color-wakeru-text-primary)]">
                      {s.userName || s.userId}
                    </span>
                    <span className="font-mono font-bold text-[var(--color-wakeru-text-primary)]">
                      {formatCurrency(s.amount, selectedExpense.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedExpense.notes && (
              <div className="text-xs text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface-muted)] p-3 rounded-xl">
                📝 <strong>Notes:</strong> {selectedExpense.notes}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: QR / UPI SETTLEMENT MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(settleModalTx)}
        onClose={() => setSettleModalTx(null)}
        title="Settle with Instant UPI"
        description="Scan with any UPI app (GPay, PhonePe, Paytm) or tap to open UPI link."
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSettleModalTx(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => settleModalTx && handleConfirmSettlementPayment(settleModalTx.id)}
            >
              Mark as Paid
            </Button>
          </>
        }
      >
        {settleModalTx && (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
              <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-1">
                Paying to {settleModalTx.toUserName}
              </div>
              <div className="text-3xl font-black font-mono text-[var(--color-wakeru-primary)]">
                {formatCurrency(settleModalTx.amount, settleModalTx.currency)}
              </div>
              {settleModalTx.toUserUpi && (
                <div className="text-xs font-mono text-[var(--color-wakeru-text-secondary)] mt-1">
                  UPI ID: {settleModalTx.toUserUpi}
                </div>
              )}
            </div>

            {/* Simulated UPI QR Code Frame */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-md flex flex-col items-center justify-center">
              <AppIcon name="qr-code" size={130} className="text-slate-900" />
              <div className="text-[10px] font-bold tracking-wider text-slate-800 uppercase mt-1">
                Scan &amp; Pay via UPI
              </div>
            </div>

            {settleModalTx.toUserUpi && (
              <a
                href={`upi://pay?pa=${encodeURIComponent(settleModalTx.toUserUpi)}&pn=${encodeURIComponent(
                  settleModalTx.toUserName,
                )}&am=${settleModalTx.amount}&cu=${settleModalTx.currency}&tn=TripSplitSettlement`}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <span>Open in UPI App (Mobile)</span>
                <AppIcon name="external-link" size={14} />
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: INVITE COMPANION & QR CODE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Trip Companions"
        description="Share this code or link with friends so they can join and view real-time splits."
        maxWidth="sm"
        footer={
          <Button variant="primary" onClick={() => setInviteModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-6 text-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
              6-Character Invite Code
            </div>
            <div className="text-3xl font-mono font-black tracking-widest text-[var(--color-wakeru-primary)] py-3 px-6 rounded-2xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] inline-block">
              {trip.inviteCode}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyInviteCode}
              className="flex-1 text-xs flex items-center justify-center gap-1.5"
            >
              <AppIcon name="copy" size={14} />
              <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyInviteLink}
              className="flex-1 text-xs flex items-center justify-center gap-1.5"
            >
              <AppIcon name="share-2" size={14} />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
            Companions can join by tapping the link or navigating to <strong>/trips</strong> and entering the code.
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: ADD ITINERARY DAY MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={addDayModalOpen}
        onClose={() => setAddDayModalOpen(false)}
        title="Add Day to Itinerary"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddDayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddItineraryDay}>
              Save Day
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddItineraryDay} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Day Theme / Headline
            </label>
            <input
              type="text"
              placeholder="e.g. South Goa Secret Waterfalls & Beach Bonfire"
              value={newDayTheme}
              onChange={e => setNewDayTheme(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Morning Plan
            </label>
            <input
              type="text"
              placeholder="e.g. Scooter ride through coconut groves to Dudhsagar waterfall"
              value={newDayMorning}
              onChange={e => setNewDayMorning(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Afternoon Plan
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch at spice plantation and swimming in the freshwater pool"
              value={newDayAfternoon}
              onChange={e => setNewDayAfternoon(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Sunset / Evening Plan
            </label>
            <input
              type="text"
              placeholder="e.g. Beachside dinner and acoustic music around bonfire"
              value={newDaySunset}
              onChange={e => setNewDaySunset(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Accommodation / Hotel
            </label>
            <input
              type="text"
              placeholder="e.g. Palolem Beach Shack"
              value={newDayStay}
              onChange={e => setNewDayStay(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: ADD PACKING ITEM MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={addPackingModalOpen}
        onClose={() => setAddPackingModalOpen(false)}
        title="Add Packing Checklist Item"
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddPackingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddPackingItem}>
              Add to Checklist
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddPackingItem} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Item Name
            </label>
            <input
              type="text"
              placeholder="e.g. Portable Powerbank 20000mAh"
              value={newPackName}
              onChange={e => setNewPackName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Category
            </label>
            <select
              value={newPackCategory}
              onChange={e => setNewPackCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
            >
              <option value="clothing">Clothing</option>
              <option value="documents">Official Documents</option>
              <option value="electronics">Electronics &amp; Gear</option>
              <option value="toiletries">Toiletries</option>
              <option value="medical">Medical &amp; First Aid</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
              Assigned Companion
            </label>
            <select
              value={newPackAssigned}
              onChange={e => setNewPackAssigned(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
            >
              <option value="Everyone">Everyone</option>
              {(trip.members || []).map(m => (
                <option key={m.userId || m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: SHARE SETTLEMENT LEDGER MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={shareLedgerModalOpen}
        onClose={() => setShareLedgerModalOpen(false)}
        title="Share Settlement Ledger"
        description="Formatted summary of all debts and balances ready for your trip's WhatsApp group."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShareLedgerModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleCopyWhatsAppSummary}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <AppIcon name="copy" size={14} />
              <span>{copiedWhatsApp ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] font-mono text-xs whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed select-all">
            {trip && settlement ? generateWhatsAppSettlementSummary(trip, settlement, safeBalances) : ''}
          </div>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
            💡 Tap &quot;Copy Summary&quot; and paste directly into your group chat.
          </p>
        </div>
      </Modal>
    </div>
  );
}
