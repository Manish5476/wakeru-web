'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { expensesApi } from '@/api/expenses';
import { tripsApi } from '@/api/trips';
import { IExpense, ExpenseCategory } from '@/types/expense.types';
import { ITrip } from '@/types/trip.types';
import { formatCurrency, getCategoryMeta } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { GlassCard } from '@/design-system/components/GlassCard';
import { ExpenseCard } from '@/design-system/components/ExpenseCard';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';

export default function ExpensesMasterPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrip, setSelectedTrip] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Modal Detail View
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [expRes, tripsRes] = await Promise.allSettled([
        expensesApi.getMyExpenses({ limit: 100 }),
        tripsApi.getMyTrips(),
      ]);

      if (expRes.status === 'fulfilled' && expRes.value?.data) {
        const data = expRes.value.data;
        if ('expenses' in data && Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
        } else if ('items' in data && Array.isArray(data.items)) {
          setExpenses(data.items as IExpense[]);
        }
      }

      if (tripsRes.status === 'fulfilled' && tripsRes.value?.data?.trips) {
        setTrips(tripsRes.value.data.trips);
      }
    } catch (err: unknown) {
      console.error('Failed to load master expenses:', err);
      setError('Unable to load expenses. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteExpense = async (id: string) => {
    try {
      setDeleting(true);
      await expensesApi.archiveExpense(id);
      setExpenses(prev => prev.filter(e => (e._id || e.id) !== id));
      setDeleteConfirmId(null);
      if (selectedExpense && (selectedExpense._id === id || selectedExpense.id === id)) {
        setSelectedExpense(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedExpense) return;
    const expId = selectedExpense._id || selectedExpense.id || '';
    try {
      await expensesApi.addComment(expId, commentText.trim());
      setCommentText('');
      const refreshed = await expensesApi.getExpense(expId);
      if (refreshed.data?.expense) {
        setSelectedExpense(refreshed.data.expense);
      }
    } catch {
      alert('Failed to post comment.');
    }
  };

  // Filter & Sort Logic
  const filteredExpenses = expenses
    .filter(exp => {
      const title = exp.description || (exp as any).title || '';
      const notes = exp.notes || '';
      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        notes.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;
      const matchesTrip = selectedTrip === 'all' || exp.tripId === selectedTrip;

      return matchesSearch && matchesCat && matchesTrip;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>🧾 Unified Ledger &amp; Transactions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            Master Expenses
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Audit itemized bills, manage multi-party splits, and track shared expense history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/expenses/receipt-scanner">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5 shadow-xs">
              <AppIcon name="camera" size={16} />
              <span>Scan Receipt (OCR)</span>
            </Button>
          </Link>
          <Link href="/trips">
            <Button variant="gold" size="sm" className="flex items-center gap-1.5 shadow-sm">
              <AppIcon name="plus" size={16} />
              <span>Add to Trip</span>
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

      {/* Filter and Control Bar (GlassCard) */}
      <GlassCard variant="medium" padding="md" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search descriptions, notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-[var(--color-wakeru-text-primary)]"
            />
            <div className="absolute left-3 top-2.5 text-[var(--color-wakeru-text-tertiary)] pointer-events-none">
              <AppIcon name="search" size={14} />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-[var(--color-wakeru-text-primary)]"
            >
              <option value="all">All Categories</option>
              <option value="stay">🏨 Accommodation &amp; Stay</option>
              <option value="food">🍽️ Food &amp; Dining</option>
              <option value="transport">🚕 Transport &amp; Flights</option>
              <option value="activity">🎟️ Activities &amp; Tours</option>
              <option value="shopping">🛍️ Shopping</option>
              <option value="entertainment">🎉 Entertainment</option>
              <option value="groceries">🛒 Groceries</option>
              <option value="other">📦 Other</option>
            </select>
          </div>

          {/* Trip Filter */}
          <div>
            <select
              value={selectedTrip}
              onChange={e => setSelectedTrip(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-[var(--color-wakeru-text-primary)]"
            >
              <option value="all">All Trips</option>
              {trips.map(t => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-[var(--color-wakeru-text-primary)]"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Highest Amount First</option>
              <option value="amount-asc">Lowest Amount First</option>
            </select>
          </div>
        </div>

        {/* View Mode Switcher & Stats Ribbon */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[var(--color-wakeru-text-secondary)] pt-3 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-zinc-900 dark:text-white font-bold">{filteredExpenses.length}</strong> expenses
            </span>
            <span>•</span>
            <span>
              Filtered Total:{' '}
              <strong className="text-amber-600 dark:text-amber-400 font-bold">
                {formatCurrency(totalFilteredAmount, 'INR')}
              </strong>
            </span>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Expenses Display */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <GlassCard variant="soft" padding="xl" className="text-center py-16">
          <div className="text-4xl mb-3">🧾</div>
          <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
            No expenses found
          </h3>
          <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== 'all' || selectedTrip !== 'all'
              ? 'Try adjusting your filters or search term to see recorded expenses.'
              : 'Add your first shared vacation expense or upload a receipt to begin tracking.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {(search || selectedCategory !== 'all' || selectedTrip !== 'all') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setSelectedTrip('all');
                }}
              >
                Clear Filters
              </Button>
            )}
            <Link href="/trips">
              <Button variant="gold" size="sm">
                Go to Trips
              </Button>
            </Link>
          </div>
        </GlassCard>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExpenses.map(expense => {
            const expId = expense._id || expense.id || '';
            const matchingTrip = trips.find(t => (t._id || t.id) === expense.tripId);
            return (
              <ExpenseCard
                key={expId}
                onClick={() => setSelectedExpense(expense)}
                expense={{
                  id: expId,
                  title: expense.description || (expense as any).title,
                  amount: expense.amount,
                  currency: expense.currency || 'INR',
                  category: expense.category,
                  date: expense.date,
                  paidByName: expense.paidBy === user?._id ? 'You' : 'Member',
                  tripName: matchingTrip?.name,
                  isSettled: expense.isSettled,
                }}
              />
            );
          })}
        </div>
      ) : (
        <GlassCard variant="medium" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 text-[var(--color-wakeru-text-secondary)] uppercase text-[10px] tracking-wider border-b border-black/5 dark:border-white/10 font-bold">
                <tr>
                  <th className="py-3 px-4">Expense &amp; Category</th>
                  <th className="py-3 px-4">Trip</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4">Split Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredExpenses.map(expense => {
                  const expId = expense._id || expense.id || '';
                  const title = expense.description || (expense as any).title || 'Expense';
                  const catMeta = getCategoryMeta(expense.category as ExpenseCategory);
                  const matchingTrip = trips.find(t => (t._id || t.id) === expense.tripId);

                  return (
                    <tr
                      key={expId}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                            style={{ backgroundColor: `${catMeta.color}15`, color: catMeta.color }}
                          >
                            <span>{catMeta.emoji}</span>
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-wakeru-text-primary)] line-clamp-1">
                              {title}
                            </p>
                            <span className="text-[10px] text-[var(--color-wakeru-text-tertiary)] capitalize">
                              {catMeta.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--color-wakeru-text-secondary)]">
                        {matchingTrip?.name || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--color-wakeru-text-secondary)]">
                        {expense.paidBy === user?._id ? (
                          <Badge variant="success" size="sm">You</Badge>
                        ) : (
                          'Companion'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--color-wakeru-text-muted)] capitalize">
                        {expense.splitType || 'Equal'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--color-wakeru-text-muted)]">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[var(--color-wakeru-text-primary)]">
                        {formatCurrency(expense.amount, expense.currency || 'INR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <Modal
          isOpen={Boolean(selectedExpense)}
          onClose={() => setSelectedExpense(null)}
          title={selectedExpense.description || (selectedExpense as any).title || 'Expense Details'}
        >
          <div className="space-y-4 text-xs">
            {/* Header Amount */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
                  {formatCurrency(selectedExpense.amount, selectedExpense.currency || 'INR')}
                </span>
              </div>
              <Badge variant={selectedExpense.isSettled ? 'success' : 'warning'}>
                {selectedExpense.isSettled ? 'Settled' : 'Unsettled'}
              </Badge>
            </div>

            {/* Split Information */}
            <div>
              <h4 className="font-bold text-[var(--color-wakeru-text-primary)] mb-2">Split Breakdown</h4>
              <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                {selectedExpense.splits && selectedExpense.splits.length > 0 ? (
                  selectedExpense.splits.map((s, idx) => (
                    <div key={s.userId || idx} className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                      <span className="font-medium text-[var(--color-wakeru-text-secondary)]">
                        {s.userId === user?._id ? 'You' : `User (${s.userId.substring(0, 6)})`}
                      </span>
                      <span className="font-bold text-[var(--color-wakeru-text-primary)]">
                        {formatCurrency(s.amount, selectedExpense.currency || 'INR')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-wakeru-text-muted)]">Evenly distributed among trip participants.</p>
                )}
              </div>
            </div>

            {/* Comments Thread */}
            <div>
              <h4 className="font-bold text-[var(--color-wakeru-text-primary)] mb-2">Activity &amp; Comments</h4>
              <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                {selectedExpense.comments && selectedExpense.comments.length > 0 ? (
                  selectedExpense.comments.map(c => (
                    <div key={c._id} className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 text-[11px]">
                      <div className="flex justify-between text-zinc-500 mb-1">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{c.userName || 'Member'}</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-zinc-400">No comments on this expense yet.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a remark..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Button variant="secondary" size="sm" type="submit">
                  Post
                </Button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/10">
              {deleteConfirmId ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-500 font-bold">Confirm delete?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleting}
                    onClick={() => handleDeleteExpense(selectedExpense._id || selectedExpense.id || '')}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  onClick={() => setDeleteConfirmId(selectedExpense._id || selectedExpense.id || '')}
                >
                  Delete Expense
                </Button>
              )}

              <Button variant="secondary" size="sm" onClick={() => setSelectedExpense(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
