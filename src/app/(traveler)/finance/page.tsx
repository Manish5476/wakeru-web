'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { financeApi } from '@/api/finance';
import { Transaction, Budget, Bill, Goal, LendingRecord, FinanceOverviewData } from '@/types/finance.types';
import { formatCurrency } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { GlassCard } from '@/design-system/components/GlassCard';
import { StatCard } from '@/design-system/components/StatCard';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';

type FinanceTab = 'overview' | 'transactions' | 'budgets' | 'lending' | 'bills';

export default function PersonalFinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<FinanceOverviewData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [lending, setLending] = useState<LendingRecord[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Modals
  const [addTxModalOpen, setAddTxModalOpen] = useState<boolean>(false);
  const [setBudgetModalOpen, setSetBudgetModalOpen] = useState<boolean>(false);
  const [addLendingModalOpen, setAddLendingModalOpen] = useState<boolean>(false);
  const [repayModalOpen, setRepayModalOpen] = useState<boolean>(false);
  const [selectedLending, setSelectedLending] = useState<LendingRecord | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>('');

  // Transaction form state
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer' | 'lent' | 'borrowed'>('expense');
  const [txCategory, setTxCategory] = useState('General');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Wallet' | 'Other'>('UPI');
  const [txNotes, setTxNotes] = useState('');
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Budget form state
  const [budgetTotal, setBudgetTotal] = useState<string>('50000');
  const [categoryBudgetsInput, setCategoryBudgetsInput] = useState<Array<{ category: string; amount: string }>>([
    { category: 'Dining', amount: '12000' },
    { category: 'Transport', amount: '8000' },
    { category: 'Shopping', amount: '10000' },
    { category: 'Groceries', amount: '10000' },
    { category: 'Entertainment', amount: '5000' },
  ]);

  // Lending form state
  const [lendType, setLendType] = useState<'lent' | 'borrowed'>('lent');
  const [lendPersonName, setLendPersonName] = useState('');
  const [lendAmount, setLendAmount] = useState('');
  const [lendNotes, setLendNotes] = useState('');

  // Transactions Filter
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [txSearch, setTxSearch] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, txRes, bgRes, lenRes, bilRes, glRes] = await Promise.allSettled([
        financeApi.getOverview(),
        financeApi.getTransactions({ limit: 50 }),
        financeApi.getBudget(),
        financeApi.getLendingList(),
        financeApi.getBills(),
        financeApi.getGoals(),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value?.data) {
        setOverview(ovRes.value.data);
      }
      if (txRes.status === 'fulfilled') {
        const data = (txRes.value as any)?.data || txRes.value;
        const list = data?.transactions || data?.items || [];
        setTransactions(list);
      }
      if (bgRes.status === 'fulfilled') {
        const data = (bgRes.value as any)?.data || bgRes.value;
        setBudget(data?.budget || data);
      }
      if (lenRes.status === 'fulfilled') {
        const data = (lenRes.value as any)?.data || lenRes.value;
        setLending(data?.lending || data?.items || []);
      }
      if (bilRes.status === 'fulfilled') {
        const data = (bilRes.value as any)?.data || bilRes.value;
        setBills(data?.bills || []);
      }
      if (glRes.status === 'fulfilled') {
        const data = (glRes.value as any)?.data || glRes.value;
        setGoals(data?.goals || []);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(txAmount);
    if (!txTitle.trim() || isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter a valid title and amount.');
      return;
    }

    try {
      setTxSubmitting(true);
      const newTx: Partial<Transaction> = {
        title: txTitle.trim(),
        amount: amountVal,
        type: txType,
        category: txCategory,
        paymentMethod: txPaymentMethod,
        date: new Date().toISOString(),
        currency: 'INR',
        notes: txNotes,
      };

      const res = await financeApi.createTransaction(newTx);
      const created = (res as any)?.data?.transaction || (res as any)?.transaction || {
        ...newTx,
        _id: `tx_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [created as Transaction, ...prev]);
      setAddTxModalOpen(false);
      // Reset form
      setTxTitle('');
      setTxAmount('');
      setTxNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to record transaction.');
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const catBudgets = categoryBudgetsInput.map(cb => ({
        category: cb.category,
        amount: parseFloat(cb.amount) || 0,
      }));

      const res = await financeApi.setBudget({
        month: currentMonth,
        totalBudget: parseFloat(budgetTotal) || 50000,
        categoryBudgets: catBudgets,
      });

      const updated = (res as any)?.data?.budget || (res as any)?.budget;
      if (updated) setBudget(updated);
      setSetBudgetModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update budget.');
    }
  };

  const handleCreateLending = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(lendAmount);
    if (!lendPersonName.trim() || isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter companion name and amount.');
      return;
    }

    try {
      const newRecord: Partial<LendingRecord> = {
        type: lendType,
        personName: lendPersonName.trim(),
        amount: amountVal,
        currency: 'INR',
        date: new Date().toISOString(),
        status: 'pending',
        amountPaid: 0,
        notes: lendNotes,
      };

      const res = await financeApi.createLending(newRecord);
      const created = (res as any)?.data?.record || (res as any)?.record || {
        ...newRecord,
        _id: `lend_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setLending(prev => [created as LendingRecord, ...prev]);
      setAddLendingModalOpen(false);
      setLendPersonName('');
      setLendAmount('');
      setLendNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to record lending.');
    }
  };

  const handleRepay = async () => {
    if (!selectedLending) return;
    const amountVal = parseFloat(repayAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    try {
      const id = selectedLending._id || selectedLending.id || '';
      await financeApi.recordRepayment(id, { amount: amountVal, paymentMethod: 'UPI' });

      setLending(prev =>
        prev.map(item => {
          if ((item._id || item.id) === id) {
            const newPaid = (item.amountPaid || 0) + amountVal;
            return {
              ...item,
              amountPaid: newPaid,
              status: newPaid >= item.amount ? 'settled' : 'partially_paid',
            };
          }
          return item;
        })
      );

      setRepayModalOpen(false);
      setSelectedLending(null);
      setRepayAmount('');
    } catch (err: any) {
      alert('Failed to record repayment.');
    }
  };

  // Derived calculations
  const totalIncome = overview?.income ?? transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = overview?.expenses ?? transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = txFilterType === 'all' || tx.type === txFilterType;
    const matchesSearch =
      tx.title.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.category.toLowerCase().includes(txSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
            <span>💳 Personal Finance &amp; Smart Budgeting</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            Finance Operating System
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Track daily cash flow, category budgets, personal loans, and recurring obligations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSetBudgetModalOpen(true)}
            className="flex items-center gap-1.5 shadow-xs"
          >
            <AppIcon name="edit" size={14} />
            <span>Configure Budget</span>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setAddTxModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <AppIcon name="plus" size={14} />
            <span>Log Transaction</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards (StatCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Inflow"
          amount={totalIncome}
          currency="INR"
          variant="success"
          subtitle="Salary & reimbursements"
          icon={<AppIcon name="arrow-left" size={18} />}
        />

        <StatCard
          title="Monthly Outflow"
          amount={totalExpense}
          currency="INR"
          variant="danger"
          subtitle="Personal & shared spend"
          icon={<AppIcon name="arrow-right" size={18} />}
        />

        <StatCard
          title="Net Cash Flow"
          amount={netSavings}
          currency="INR"
          variant={netSavings >= 0 ? 'success' : 'danger'}
          subtitle={netSavings >= 0 ? 'Surplus cash flow' : 'Deficit / over budget'}
          icon={<AppIcon name="wallet" size={18} />}
        />

        <StatCard
          title="Active Budget Cap"
          amount={budget?.totalBudget || 50000}
          currency="INR"
          variant="default"
          subtitle={`Spent: ₹${totalExpense.toLocaleString()}`}
          icon={<AppIcon name="pie-chart" size={18} />}
        />
      </div>

      {/* Navigation Tabs (Frosted Pills) */}
      <div className="flex border-b border-black/5 dark:border-white/10 gap-2 overflow-x-auto pb-4">
        {[
          { id: 'overview', icon: '📊', label: 'Cash Flow Overview' },
          { id: 'transactions', icon: '🧾', label: `Transactions (${transactions.length})` },
          { id: 'budgets', icon: '🎯', label: 'Category Budgets' },
          { id: 'lending', icon: '🤝', label: `Personal Lending & IOUs (${lending.length})` },
          { id: 'bills', icon: '🗓️', label: 'Bills & Subscriptions' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as FinanceTab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>{tab.icon} {tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[var(--color-wakeru-border)]">
              <CardHeader className="pb-3 border-b border-[var(--color-wakeru-border)]">
                <CardTitle className="text-sm font-bold">Monthly Burn Rate &amp; Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Total Progress Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--color-wakeru-text-secondary)]">Budget Spent</span>
                    <span className="font-bold text-[var(--color-wakeru-text-primary)]">
                      {Math.min(100, Math.round((totalExpense / (budget?.totalBudget || 50000)) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--color-wakeru-surface-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (totalExpense / (budget?.totalBudget || 50000)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Categories progress */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                    Top Spending Categories
                  </h4>
                  {(budget?.categoryBudgets || [
                    { category: 'Dining', amount: 12000, spent: 7800 },
                    { category: 'Transport', amount: 8000, spent: 4200 },
                    { category: 'Groceries', amount: 10000, spent: 6100 },
                    { category: 'Shopping', amount: 10000, spent: 9200 },
                  ]).map((cb, idx) => {
                    const pct = Math.min(100, Math.round(((cb.spent || 0) / cb.amount) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[var(--color-wakeru-text-primary)]">
                            {cb.category}
                          </span>
                          <span className="text-[var(--color-wakeru-text-secondary)]">
                            {formatCurrency(cb.spent || 0, 'INR')} / {formatCurrency(cb.amount, 'INR')}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--color-wakeru-surface-muted)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Stats & Streak */}
          <div className="space-y-6">
            <Card className="border-[var(--color-wakeru-border)] bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>Financial Discipline Streak</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <p className="text-3xl font-extrabold text-emerald-600">14 Days</p>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
                  You logged expenses consecutively without breaking budget targets.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[var(--color-wakeru-border)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Upcoming Obligations</CardTitle>
              </CardHeader>
              <CardContent className="pt-1 space-y-2.5">
                {bills.length > 0 ? (
                  bills.slice(0, 3).map(b => (
                    <div key={b._id || b.id} className="p-2.5 rounded-lg bg-[var(--color-wakeru-surface-muted)] text-xs flex justify-between">
                      <div>
                        <p className="font-bold text-[var(--color-wakeru-text-primary)]">{b.title}</p>
                        <p className="text-[10px] text-[var(--color-wakeru-text-secondary)]">Due: {b.dueDate}</p>
                      </div>
                      <span className="font-black text-rose-600">{formatCurrency(b.amount, b.currency || 'INR')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] py-2">No upcoming bills registered.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search transactions..."
                value={txSearch}
                onChange={e => setTxSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-[var(--radius-control)] border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] w-56 focus:outline-none"
              />
              <select
                value={txFilterType}
                onChange={e => setTxFilterType(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-[var(--radius-control)] border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="income">Income (+)</option>
                <option value="expense">Expense (-)</option>
                <option value="transfer">Transfer</option>
                <option value="lent">Lent</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>

            <Button variant="primary" size="sm" onClick={() => setAddTxModalOpen(true)}>
              + Add Transaction
            </Button>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--color-wakeru-border)] font-semibold">
                <tr>
                  <th className="py-3 px-4">Title &amp; Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-wakeru-border)]">
                {filteredTransactions.map(tx => (
                  <tr key={tx._id || tx.id} className="hover:bg-[var(--color-wakeru-surface-muted)]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[var(--color-wakeru-text-primary)]">
                      <div>
                        <p>{tx.title}</p>
                        <span className="text-[10px] font-normal text-[var(--color-wakeru-text-tertiary)]">
                          {tx.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={tx.type === 'income' ? 'verified' : tx.type === 'expense' ? 'danger' : 'neutral'}
                        size="sm"
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-wakeru-text-secondary)]">{tx.paymentMethod}</td>
                    <td className="py-3 px-4 text-[var(--color-wakeru-text-tertiary)]">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black text-sm ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, tx.currency || 'INR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Budgets */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Active Monthly Limits
            </h3>
            <Button variant="primary" size="sm" onClick={() => setSetBudgetModalOpen(true)}>
              Edit Budget Limits
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(budget?.categoryBudgets || categoryBudgetsInput.map(cb => ({ category: cb.category, amount: parseFloat(cb.amount), spent: 0 }))).map(
              (cb, i) => (
                <Card key={i} className="border-[var(--color-wakeru-border)]">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-bold">{cb.category}</CardTitle>
                      <Badge variant="neutral" size="sm">
                        Cap: {formatCurrency(cb.amount, 'INR')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-wakeru-text-secondary)]">Spent</span>
                      <span className="font-bold">{formatCurrency((cb as any).spent || 0, 'INR')}</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-wakeru-surface-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (((cb as any).spent || 0) / cb.amount) * 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Lending */}
      {activeTab === 'lending' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Personal Debts &amp; IOUs
            </h3>
            <Button variant="primary" size="sm" onClick={() => setAddLendingModalOpen(true)}>
              + Record Loan / Borrow
            </Button>
          </div>

          {lending.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--color-wakeru-text-secondary)]">
              No personal lending or borrowing records logged yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lending.map(item => {
                const isLent = item.type === 'lent';
                const remaining = item.amount - (item.amountPaid || 0);

                return (
                  <Card key={item._id || item.id} className="border-[var(--color-wakeru-border)]">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm font-bold">{item.personName}</CardTitle>
                          <p className="text-[10px] text-[var(--color-wakeru-text-tertiary)]">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={isLent ? 'verified' : 'danger'} size="sm">
                          {isLent ? 'You Lent' : 'You Borrowed'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--color-wakeru-text-secondary)]">Outstanding:</span>
                        <span className="font-extrabold text-base">
                          {formatCurrency(remaining, item.currency || 'INR')}
                        </span>
                      </div>
                      {item.status !== 'settled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setSelectedLending(item);
                            setRepayAmount(String(remaining));
                            setRepayModalOpen(true);
                          }}
                        >
                          Record Repayment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Bills & Subscriptions */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Scheduled Bills &amp; Subscriptions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(bills.length > 0 ? bills : [
              { _id: 'b1', title: 'Spotify Premium', amount: 199, currency: 'INR', dueDate: '1st of month', frequency: 'monthly' as const, category: 'Entertainment', isActive: true },
              { _id: 'b2', title: 'Fiber Internet', amount: 999, currency: 'INR', dueDate: '15th of month', frequency: 'monthly' as const, category: 'Utilities', isActive: true },
              { _id: 'b3', title: 'Gym Membership', amount: 2500, currency: 'INR', dueDate: '28th of month', frequency: 'monthly' as const, category: 'Health', isActive: true },
            ]).map(b => (
              <Card key={b._id} className="border-[var(--color-wakeru-border)]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold">{b.title}</CardTitle>
                    <Badge variant="neutral" size="sm">
                      {b.frequency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-[var(--color-wakeru-text-secondary)]">Due: {b.dueDate}</span>
                  <span className="font-black text-rose-600">
                    {formatCurrency(b.amount, b.currency || 'INR')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Log Transaction */}
      {addTxModalOpen && (
        <Modal
          isOpen={addTxModalOpen}
          onClose={() => setAddTxModalOpen(false)}
          title="Log Transaction"
          size="md"
        >
          <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Transaction Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['expense', 'income', 'transfer'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxType(t)}
                    className={`py-1.5 px-3 rounded-md font-bold uppercase tracking-wider text-[10px] border transition-colors ${
                      txType === t
                        ? 'bg-[var(--color-wakeru-primary)] text-white border-[var(--color-wakeru-primary)]'
                        : 'border-[var(--color-wakeru-border-strong)] text-[var(--color-wakeru-text-secondary)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Title / Description</label>
              <input
                type="text"
                required
                value={txTitle}
                onChange={e => setTxTitle(e.target.value)}
                placeholder="e.g. Dinner with clients"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Payment Method</label>
                <select
                  value={txPaymentMethod}
                  onChange={e => setTxPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Category</label>
              <input
                type="text"
                value={txCategory}
                onChange={e => setTxCategory(e.target.value)}
                placeholder="e.g. Dining, Travel, Utilities"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Notes (Optional)</label>
              <textarea
                value={txNotes}
                onChange={e => setTxNotes(e.target.value)}
                rows={2}
                placeholder="Additional details..."
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-wakeru-border)]">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddTxModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={txSubmitting}>
                Save Transaction
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Configure Budget */}
      {setBudgetModalOpen && (
        <Modal
          isOpen={setBudgetModalOpen}
          onClose={() => setSetBudgetModalOpen(false)}
          title="Configure Monthly Budget"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Total Monthly Budget Cap (₹)</label>
              <input
                type="number"
                value={budgetTotal}
                onChange={e => setBudgetTotal(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Category Allocations</label>
              <div className="space-y-2">
                {categoryBudgetsInput.map((cb, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={cb.category}
                      onChange={e => {
                        const copy = [...categoryBudgetsInput];
                        copy[idx].category = e.target.value;
                        setCategoryBudgetsInput(copy);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)]"
                    />
                    <input
                      type="number"
                      value={cb.amount}
                      onChange={e => {
                        const copy = [...categoryBudgetsInput];
                        copy[idx].amount = e.target.value;
                        setCategoryBudgetsInput(copy);
                      }}
                      className="w-28 px-2.5 py-1.5 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] font-bold text-right"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-wakeru-border)]">
              <Button variant="outline" size="sm" onClick={() => setSetBudgetModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveBudget}>
                Save Budget
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Add Lending */}
      {addLendingModalOpen && (
        <Modal
          isOpen={addLendingModalOpen}
          onClose={() => setAddLendingModalOpen(false)}
          title="Record Loan / Borrowing"
          size="md"
        >
          <form onSubmit={handleCreateLending} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLendType('lent')}
                className={`py-2 rounded-md font-bold text-xs border ${
                  lendType === 'lent'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-[var(--color-wakeru-border-strong)] text-[var(--color-wakeru-text-secondary)]'
                }`}
              >
                I Lent Money (+)
              </button>
              <button
                type="button"
                onClick={() => setLendType('borrowed')}
                className={`py-2 rounded-md font-bold text-xs border ${
                  lendType === 'borrowed'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-[var(--color-wakeru-border-strong)] text-[var(--color-wakeru-text-secondary)]'
                }`}
              >
                I Borrowed Money (-)
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Companion / Friend Name</label>
              <input
                type="text"
                required
                value={lendPersonName}
                onChange={e => setLendPersonName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={lendAmount}
                onChange={e => setLendAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-wakeru-border)]">
              <Button variant="outline" size="sm" type="button" onClick={() => setAddLendingModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Record Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Record Repayment */}
      {repayModalOpen && selectedLending && (
        <Modal
          isOpen={repayModalOpen}
          onClose={() => setRepayModalOpen(false)}
          title="Record Repayment"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[var(--color-wakeru-text-secondary)]">
              Settling debt with <span className="font-bold text-[var(--color-wakeru-text-primary)]">{selectedLending.personName}</span>
            </p>
            <div>
              <label className="font-semibold block mb-1">Repayment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-wakeru-border)]">
              <Button variant="outline" size="sm" onClick={() => setRepayModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleRepay}>
                Confirm Repayment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
