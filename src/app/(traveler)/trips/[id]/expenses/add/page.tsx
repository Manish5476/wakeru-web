'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ITrip } from '@/types/trip.types';
import {
  SplitType,
  ExpenseCategory,
  ISplit,
  IPayer,
  IExpenseLineItem,
} from '@/types/expense.types';
import { tripsApi } from '@/api/trips';
import { expensesApi } from '@/api/expenses';
import {
  calculateEqualSplits,
  calculateExactSplits,
  calculatePercentageSplits,
  calculateSharesSplits,
  calculateItemizedSplits,
} from '@/lib/splitCalculator';
import { formatCurrency, getCategoryMeta, getInitials } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';

const CATEGORIES: ExpenseCategory[] = [
  'stay',
  'food',
  'transport',
  'activity',
  'shopping',
  'entertainment',
  'groceries',
  'other',
];

export default function AddExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;
  const router = useRouter();

  const [trip, setTrip] = useState<ITrip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');

  // Multi-payer vs Single Payer
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  const [primaryPayerId, setPrimaryPayerId] = useState('usr_me');
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>({});

  // Equal / Member selection
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Exact split amounts
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  // Percentage split
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  // Shares split
  const [shares, setShares] = useState<Record<string, string>>({});

  // Itemized line items
  const [lineItems, setLineItems] = useState<
    Array<{ id: string; name: string; amount: string; assignedUserIds: string[] }>
  >([
    { id: 'item_1', name: 'Appetizers & Salad', amount: '1200', assignedUserIds: [] },
    { id: 'item_2', name: 'Main Course Entrees', amount: '2400', assignedUserIds: [] },
  ]);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const res = await tripsApi.getTrip(tripId);
      const resTrip = (res as any)?.data?.trip || (res as any)?.trip;
      setTrip(resTrip);

      // Default all members selected
      const memberIds = (resTrip?.members || []).map((m: any) => m.userId);
      setSelectedMemberIds(memberIds);

      // Default payers
      setPrimaryPayerId(memberIds[0] || 'usr_me');

      // Initialize exact & percentage & shares
      const initialExact: Record<string, string> = {};
      const initialPct: Record<string, string> = {};
      const initialShares: Record<string, string> = {};
      memberIds.forEach((id: string) => {
        initialExact[id] = '';
        initialPct[id] = (100 / memberIds.length).toFixed(1);
        initialShares[id] = '1';
      });
      setPercentages(initialPct);
      setShares(initialShares);

      // Assign all members to initial line items
      setLineItems([
        { id: 'item_1', name: 'Entrees & Drinks', amount: '1500', assignedUserIds: memberIds },
        { id: 'item_2', name: 'Shared Starters', amount: '800', assignedUserIds: memberIds },
      ]);
    } catch (err) {
      console.error('Failed to load trip for add expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMemberSelect = (userId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId],
    );
  };

  const handleAddLineItem = () => {
    if (!trip) return;
    setLineItems(prev => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        name: '',
        amount: '',
        assignedUserIds: trip.members.map(m => m.userId),
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleLineItemUser = (index: number, userId: string) => {
    setLineItems(prev => {
      const next = [...prev];
      const currentAssigned = next[index].assignedUserIds;
      if (currentAssigned.includes(userId)) {
        next[index].assignedUserIds = currentAssigned.filter(id => id !== userId);
      } else {
        next[index].assignedUserIds = [...currentAssigned, userId];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    const totalAmount = parseFloat(amount);
    if (!totalAmount || totalAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    if (!title.trim()) {
      alert('Please provide an expense title.');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate splits based on splitType
      let splits: ISplit[] = [];

      if (splitType === 'EQUAL') {
        if (selectedMemberIds.length === 0) {
          alert('Please select at least one person to split with.');
          setSubmitting(false);
          return;
        }
        splits = calculateEqualSplits(totalAmount, selectedMemberIds, trip.members);
      } else if (splitType === 'EXACT') {
        const exactMap: Record<string, number> = {};
        trip.members.forEach(m => {
          exactMap[m.userId] = parseFloat(exactAmounts[m.userId] || '0') || 0;
        });
        splits = calculateExactSplits(totalAmount, exactMap, trip.members);
      } else if (splitType === 'PERCENTAGE') {
        const pctMap: Record<string, number> = {};
        trip.members.forEach(m => {
          pctMap[m.userId] = parseFloat(percentages[m.userId] || '0') || 0;
        });
        splits = calculatePercentageSplits(totalAmount, pctMap, trip.members);
      } else if (splitType === 'SHARES') {
        const shareMap: Record<string, number> = {};
        trip.members.forEach(m => {
          shareMap[m.userId] = parseFloat(shares[m.userId] || '1') || 1;
        });
        splits = calculateSharesSplits(totalAmount, shareMap, trip.members);
      } else if (splitType === 'ITEMIZED') {
        const parsedItems: IExpenseLineItem[] = lineItems.map(item => ({
          id: item.id,
          name: item.name || 'Unnamed item',
          amount: parseFloat(item.amount) || 0,
          assignedUserIds: item.assignedUserIds,
        }));
        splits = calculateItemizedSplits(parsedItems, trip.members);
      }

      // Handle Payers
      let payers: IPayer[] | undefined = undefined;
      const primaryMember = trip.members.find(m => m.userId === primaryPayerId);

      if (isMultiPayer) {
        payers = trip.members
          .map(m => ({
            userId: m.userId,
            userName: m.name,
            amount: parseFloat(payerAmounts[m.userId] || '0') || 0,
          }))
          .filter(p => p.amount > 0);

        const payersTotal = payers.reduce((acc, p) => acc + p.amount, 0);
        if (Math.abs(payersTotal - totalAmount) > 1) {
          alert(`The sum of payer amounts (${payersTotal}) must equal total expense (${totalAmount}).`);
          setSubmitting(false);
          return;
        }
      }

      await expensesApi.create({
        tripId,
        title,
        amount: totalAmount,
        currency: trip.currency || 'INR',
        category,
        date,
        paidBy: primaryPayerId,
        paidByName: primaryMember?.name || 'Group Member',
        payers,
        splitType,
        splits,
        lineItems:
          splitType === 'ITEMIZED'
            ? lineItems.map(l => ({
                id: l.id,
                name: l.name,
                amount: parseFloat(l.amount) || 0,
                assignedUserIds: l.assignedUserIds,
              }))
            : undefined,
        notes,
      });

      // Update trip spentBase
      const updatedSpent = (trip.spentBase || 0) + totalAmount;
      await tripsApi.updateTrip(tripId, { spentBase: updatedSpent });

      router.push(`/trips/${tripId}?tab=expenses`);
    } catch (err: any) {
      console.error('Failed to create expense:', err);
      alert(err.message || 'Failed to save expense. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[var(--color-wakeru-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--color-wakeru-text-secondary)]">Loading trip details...</p>
      </div>
    );
  }

  const categoryMeta = getCategoryMeta(category);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-primary)] transition-colors"
        >
          <AppIcon name="arrow-left" size={14} />
          <span>Back to {trip.title}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
          <span>{trip.emoji} {trip.destination}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Record Group Expense
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Add an item, bill, or activity and choose how it is distributed among companions.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] p-6 shadow-xs space-y-6">
          {/* Amount & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Amount ({trip.currency}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-sm font-bold text-[var(--color-wakeru-text-secondary)]">
                  {trip.currency === 'INR' ? '₹' : trip.currency}
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-lg font-bold text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="sm:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                What was this for? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner & Cocktails at Beachfront Shack"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-sm font-semibold text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                required
              />
            </div>
          </div>

          {/* Category Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
              Expense Category
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CATEGORIES.map(cat => {
                const meta = getCategoryMeta(cat);
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/10 font-bold shadow-xs'
                        : 'border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] hover:bg-[var(--color-wakeru-surface)]'
                    }`}
                  >
                    <span className="text-lg mb-1">{meta.emoji}</span>
                    <span className="text-[10px] capitalize truncate w-full text-[var(--color-wakeru-text-primary)]">
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Primary Payer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Date of Expense
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Paid By
                </label>
                <button
                  type="button"
                  onClick={() => setIsMultiPayer(!isMultiPayer)}
                  className="text-xs text-[var(--color-wakeru-primary)] font-semibold hover:underline"
                >
                  {isMultiPayer ? 'Single Payer' : 'Multiple Payers?'}
                </button>
              </div>

              {!isMultiPayer ? (
                <select
                  value={primaryPayerId}
                  onChange={e => setPrimaryPayerId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                >
                  {trip.members.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.userId === 'usr_me' ? 'You' : m.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
                  <div className="text-[11px] text-[var(--color-wakeru-text-secondary)]">
                    Specify how much each companion contributed to paying this bill:
                  </div>
                  {trip.members.map(m => (
                    <div key={m.userId} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium truncate">{m.name}</span>
                      <div className="relative w-28">
                        <input
                          type="number"
                          placeholder="0"
                          value={payerAmounts[m.userId] || ''}
                          onChange={e =>
                            setPayerAmounts({ ...payerAmounts, [m.userId]: e.target.value })
                          }
                          className="w-full px-2 py-1 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-right text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Split Mode Selector Card */}
        <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] p-6 shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-3">
            Choose Split Mode
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            {(
              [
                { type: 'EQUAL', label: 'Equally', icon: 'users' },
                { type: 'EXACT', label: 'Exact ₹', icon: 'dollar-sign' },
                { type: 'PERCENTAGE', label: 'Percentage %', icon: 'pie-chart' },
                { type: 'SHARES', label: 'Ratio Shares', icon: 'tag' },
                { type: 'ITEMIZED', label: 'Receipt Items', icon: 'receipt' },
              ] as const
            ).map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => setSplitType(item.type)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  splitType === item.type
                    ? 'border-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/10 font-bold text-[var(--color-wakeru-primary)] shadow-xs'
                    : 'border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)]'
                }`}
              >
                <AppIcon name={item.icon as any} size={18} className="mb-1" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mode 1: EQUAL Split */}
          {splitType === 'EQUAL' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--color-wakeru-text-secondary)] mb-2">
                <span>Select companions participating in this expense:</span>
                <span>
                  {selectedMemberIds.length} of {trip.members.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trip.members.map(member => {
                  const isChecked = selectedMemberIds.includes(member.userId);
                  const perPerson =
                    selectedMemberIds.length > 0
                      ? (parseFloat(amount) || 0) / selectedMemberIds.length
                      : 0;

                  return (
                    <div
                      key={member.userId}
                      onClick={() => handleToggleMemberSelect(member.userId)}
                      className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/5'
                          : 'border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs border ${
                            isChecked
                              ? 'bg-[var(--color-wakeru-primary)] border-[var(--color-wakeru-primary)] text-white'
                              : 'border-[var(--color-wakeru-border-strong)]'
                          }`}
                        >
                          {isChecked && <AppIcon name="check" size={14} />}
                        </div>
                        <span className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                          {member.name}
                        </span>
                      </div>
                      {isChecked && (
                        <span className="text-xs font-mono font-bold text-[var(--color-wakeru-primary)]">
                          {formatCurrency(perPerson, trip.currency)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: EXACT Split */}
          {splitType === 'EXACT' && (
            <div className="space-y-3">
              <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-2">
                Enter the exact monetary amount each companion owes:
              </div>
              {trip.members.map(member => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]"
                >
                  <span className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                    {member.name}
                  </span>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-2 text-xs font-bold text-[var(--color-wakeru-text-secondary)]">
                      {trip.currency}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={exactAmounts[member.userId] || ''}
                      onChange={e =>
                        setExactAmounts({ ...exactAmounts, [member.userId]: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mode 3: PERCENTAGE Split */}
          {splitType === 'PERCENTAGE' && (
            <div className="space-y-3">
              <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-2">
                Allocate percentage % shares. Total must add up to 100%:
              </div>
              {trip.members.map(member => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]"
                >
                  <span className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                    {member.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={percentages[member.userId] || ''}
                      onChange={e =>
                        setPercentages({ ...percentages, [member.userId]: e.target.value })
                      }
                      className="w-20 px-2 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-mono font-bold text-right"
                    />
                    <span className="text-xs font-bold text-[var(--color-wakeru-text-secondary)]">%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mode 4: SHARES Split */}
          {splitType === 'SHARES' && (
            <div className="space-y-3">
              <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-2">
                Assign weighting / ratio units (e.g. 1 share for child, 2 shares for couple):
              </div>
              {trip.members.map(member => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]"
                >
                  <span className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                    {member.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1"
                      value={shares[member.userId] || '1'}
                      onChange={e => setShares({ ...shares, [member.userId]: e.target.value })}
                      className="w-20 px-2 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-mono font-bold text-right"
                    />
                    <span className="text-xs text-[var(--color-wakeru-text-secondary)]">share(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mode 5: ITEMIZED RECEIPT BILL SPLITTER */}
          {splitType === 'ITEMIZED' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-wakeru-text-secondary)]">
                  Bill Line Items (Receipt Splitter)
                </span>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs font-bold text-[var(--color-wakeru-primary)] hover:underline flex items-center gap-1"
                >
                  <AppIcon name="plus" size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Seafood Risotto)"
                      value={item.name}
                      onChange={e => {
                        const next = [...lineItems];
                        next[idx].name = e.target.value;
                        setLineItems(next);
                      }}
                      className="flex-1 px-3 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-semibold"
                    />
                    <div className="relative w-28">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={e => {
                          const next = [...lineItems];
                          next[idx].amount = e.target.value;
                          setLineItems(next);
                        }}
                        className="w-full px-2 py-1.5 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-mono font-bold text-right"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <AppIcon name="trash" size={15} />
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-[var(--color-wakeru-text-secondary)] block mb-1.5">
                      Who ordered or shared this item?
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.members.map(m => {
                        const isAssigned = item.assignedUserIds.includes(m.userId);
                        return (
                          <button
                            key={m.userId}
                            type="button"
                            onClick={() => handleToggleLineItemUser(idx, m.userId)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                              isAssigned
                                ? 'bg-[var(--color-wakeru-primary)] border-[var(--color-wakeru-primary)] text-white shadow-xs'
                                : 'bg-[var(--color-wakeru-surface)] border-[var(--color-wakeru-border)] text-[var(--color-wakeru-text-secondary)] hover:border-[var(--color-wakeru-text-primary)]'
                            }`}
                          >
                            {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes & Comments */}
        <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] p-6 shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
            Notes &amp; Reference (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add payment method, booking reference #, or details..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            isLoading={submitting}
            className="flex items-center gap-2 px-6"
          >
            <AppIcon name="check" size={16} />
            <span>Save &amp; Split Expense</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
