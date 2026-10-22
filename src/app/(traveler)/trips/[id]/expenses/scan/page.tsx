'use client';

import React, { useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ITrip } from '@/types/trip.types';
import { IExpenseLineItem } from '@/types/expense.types';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { tripsApi } from '@/api/trips';
import { expensesApi } from '@/api/expenses';
import { calculateItemizedSplits } from '@/lib/splitCalculator';
import { formatCurrency, getInitials } from '@/lib/formatters';

interface ParsedLineItem {
  id: string;
  name: string;
  amount: number;
  assignedUserIds: string[];
  isEditing?: boolean;
}

export default function ReceiptScannerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trip, setTrip] = useState<ITrip | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStage, setScanStage] = useState<string>('');
  const [lineItems, setLineItems] = useState<ParsedLineItem[]>([]);
  const [taxAmount, setTaxAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [title, setTitle] = useState('Scanned Restaurant Bill');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidById, setPaidById] = useState('usr_me');
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    tripsApi.getTrip(tripId).then(res => {
      setTrip(res.trip);
      setPaidById(res.trip.members[0]?.userId || 'usr_me');
      setLoadingTrip(false);
    }).catch(() => setLoadingTrip(false));
  }, [tripId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    simulateOCRScan(file);
  };

  const simulateOCRScan = async (_file: File) => {
    if (!trip) return;
    setScanning(true);
    setLineItems([]);

    // Simulate progressive OCR stages
    const stages = [
      'Detecting receipt boundaries...',
      'Correcting perspective & enhancing contrast...',
      'Running OCR character recognition...',
      'Parsing line items & prices...',
      'Mapping tax & service charge...',
      'Done! Review and assign items to companions.',
    ];

    for (const stage of stages) {
      setScanStage(stage);
      await new Promise(r => setTimeout(r, 600));
    }

    // Mock OCR-parsed output based on realistic receipt
    const memberIds = trip.members.map(m => m.userId);
    const mockItems: ParsedLineItem[] = [
      { id: `li_${Date.now()}_1`, name: 'Prawn Masala (Main)', amount: 480, assignedUserIds: memberIds.slice(0, 2) },
      { id: `li_${Date.now()}_2`, name: 'Tandoori Chicken Half', amount: 320, assignedUserIds: memberIds.slice(0, 1) },
      { id: `li_${Date.now()}_3`, name: 'Dal Makhani', amount: 220, assignedUserIds: memberIds },
      { id: `li_${Date.now()}_4`, name: 'Garlic Naan ×4', amount: 160, assignedUserIds: memberIds },
      { id: `li_${Date.now()}_5`, name: 'Butter Rice (2)', amount: 180, assignedUserIds: memberIds },
      { id: `li_${Date.now()}_6`, name: 'Mango Lassi ×3', amount: 240, assignedUserIds: memberIds },
      { id: `li_${Date.now()}_7`, name: 'Fresh Lime Soda ×2', amount: 120, assignedUserIds: memberIds },
      { id: `li_${Date.now()}_8`, name: 'Gulab Jamun Dessert', amount: 160, assignedUserIds: memberIds },
    ];

    setLineItems(mockItems);
    setTaxAmount('168');
    setTipAmount('0');
    setTitle('Restaurant Bill — Scanned Receipt');
    setScanning(false);
    setScanStage('');
  };

  const handleToggleAssignee = (itemIndex: number, userId: string) => {
    setLineItems(prev => {
      const next = [...prev];
      const item = { ...next[itemIndex] };
      if (item.assignedUserIds.includes(userId)) {
        item.assignedUserIds = item.assignedUserIds.filter(id => id !== userId);
      } else {
        item.assignedUserIds = [...item.assignedUserIds, userId];
      }
      next[itemIndex] = item;
      return next;
    });
  };

  const handleUpdateItemName = (index: number, name: string) => {
    setLineItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], name };
      return next;
    });
  };

  const handleUpdateItemAmount = (index: number, amount: string) => {
    setLineItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], amount: parseFloat(amount) || 0 };
      return next;
    });
  };

  const handleAddItem = () => {
    if (!trip) return;
    setLineItems(prev => [...prev, {
      id: `li_manual_${Date.now()}`,
      name: '',
      amount: 0,
      assignedUserIds: trip.members.map(m => m.userId),
    }]);
  };

  const handleDeleteItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
  const tax = parseFloat(taxAmount) || 0;
  const tip = parseFloat(tipAmount) || 0;
  const grandTotal = subtotal + tax + tip;

  const handleSubmit = async () => {
    if (!trip) return;
    if (lineItems.length === 0) {
      alert('Please add at least one line item before saving.');
      return;
    }

    try {
      setSubmitting(true);
      const members = trip.members;

      const parsedItems: IExpenseLineItem[] = lineItems.map(item => ({
        id: item.id,
        name: item.name || 'Unnamed item',
        amount: item.amount,
        assignedUserIds: item.assignedUserIds,
      }));

      const splits = calculateItemizedSplits(parsedItems, members, tax, tip);

      const paidByMember = trip.members.find(m => m.userId === paidById);

      await expensesApi.create({
        tripId,
        title,
        amount: grandTotal,
        currency: trip.currency || 'INR',
        category: 'food',
        date,
        paidBy: paidById,
        paidByName: paidByMember?.name || 'You',
        splitType: 'ITEMIZED',
        splits,
        lineItems: parsedItems,
        notes: notes || 'Scanned from receipt photo via TripSplit OCR',
      });

      // Update trip spent
      await tripsApi.updateTrip(tripId, {
        spentBase: (trip.spentBase || 0) + grandTotal,
      });

      router.push(`/trips/${tripId}?tab=expenses`);
    } catch (err) {
      console.error('Failed to save receipt expense:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTrip || !trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[var(--color-wakeru-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--color-wakeru-text-secondary)]">Loading trip details…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
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
          <AppIcon name="camera" size={14} />
          <span>Receipt OCR · Itemized Bill Splitter</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Scan &amp; Split a Restaurant Bill
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Upload a photo of your bill receipt. TripSplit will parse the line items so you can assign each dish to the right person.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Image upload + preview */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface)] hover:border-[var(--color-wakeru-primary)] hover:bg-[var(--color-wakeru-primary)]/3 transition-all overflow-hidden"
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full object-cover max-h-96"
                />
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-sm">
                    Click to replace
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-wakeru-primary)]/10 text-[var(--color-wakeru-primary)] flex items-center justify-center mb-4">
                  <AppIcon name="camera" size={32} />
                </div>
                <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                  Upload Receipt Photo
                </h3>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)] mb-4">
                  Take a clear photo of the itemized bill. Works best with good lighting.
                </p>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-wakeru-primary)] text-white">
                  Choose Photo
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Demo button */}
          <Button
            variant="outline"
            onClick={() => simulateOCRScan(new File([], 'demo.jpg'))}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            <AppIcon name="sparkles" size={15} />
            <span>Demo: Use Sample Restaurant Bill</span>
          </Button>

          {/* Scanning Progress */}
          {scanning && (
            <div className="p-4 rounded-xl bg-[var(--color-wakeru-primary)]/5 border border-[var(--color-wakeru-primary)]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 border-2 border-[var(--color-wakeru-primary)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-[var(--color-wakeru-primary)]">
                  AI OCR Processing
                </span>
              </div>
              <p className="text-xs text-[var(--color-wakeru-text-secondary)]">{scanStage}</p>
              <div className="mt-2 h-1.5 bg-[var(--color-wakeru-surface-muted)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-wakeru-primary)] animate-pulse rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {/* Grand Total Summary */}
          {lineItems.length > 0 && (
            <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                Bill Summary
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[var(--color-wakeru-text-secondary)]">
                  <span>Subtotal ({lineItems.length} items)</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal, trip.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--color-wakeru-text-secondary)]">
                  <span>Tax / GST</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--color-wakeru-text-tertiary)]">{trip.currency}</span>
                    <input
                      type="number"
                      value={taxAmount}
                      onChange={e => setTaxAmount(e.target.value)}
                      className="w-20 text-right px-1 py-0.5 font-mono font-semibold bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[var(--color-wakeru-text-secondary)]">
                  <span>Service / Tip</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--color-wakeru-text-tertiary)]">{trip.currency}</span>
                    <input
                      type="number"
                      value={tipAmount}
                      onChange={e => setTipAmount(e.target.value)}
                      className="w-20 text-right px-1 py-0.5 font-mono font-semibold bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-wakeru-border)] font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                  <span>Grand Total</span>
                  <span className="font-mono text-[var(--color-wakeru-primary)]">
                    {formatCurrency(grandTotal, trip.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Parsed line items + assignment */}
        <div className="lg:col-span-3 space-y-5">
          {lineItems.length > 0 && (
            <>
              {/* Expense Meta */}
              <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Expense Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                    Expense Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                      Paid By
                    </label>
                    <select
                      value={paidById}
                      onChange={e => setPaidById(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                    >
                      {trip.members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-wakeru-border)]">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                      Parsed Line Items ({lineItems.length})
                    </h3>
                    <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                      Tap a companion avatar to assign or unassign each item.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs"
                  >
                    <AppIcon name="plus" size={14} />
                    <span>Add Item</span>
                  </Button>
                </div>

                <div className="divide-y divide-[var(--color-wakeru-border)]">
                  {lineItems.map((item, idx) => (
                    <div key={item.id} className="p-4 hover:bg-[var(--color-wakeru-surface-muted)]/40 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateItemName(idx, e.target.value)}
                          placeholder="Item name..."
                          className="flex-1 px-2.5 py-1.5 bg-[var(--color-wakeru-surface-muted)] border border-transparent hover:border-[var(--color-wakeru-border)] focus:border-[var(--color-wakeru-primary)] rounded text-xs font-semibold focus:outline-none transition-colors"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs text-[var(--color-wakeru-text-tertiary)] font-mono">{trip.currency}</span>
                          <input
                            type="number"
                            value={item.amount || ''}
                            onChange={e => handleUpdateItemAmount(idx, e.target.value)}
                            className="w-20 px-2 py-1.5 bg-[var(--color-wakeru-surface-muted)] border border-transparent hover:border-[var(--color-wakeru-border)] focus:border-[var(--color-wakeru-primary)] rounded text-xs font-mono font-bold text-right focus:outline-none transition-colors"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteItem(idx)}
                          className="text-[var(--color-wakeru-text-tertiary)] hover:text-red-500 p-1 rounded transition-colors"
                          title="Remove item"
                        >
                          <AppIcon name="trash" size={15} />
                        </button>
                      </div>

                      {/* Companion assignment chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {trip.members.map(m => {
                          const isAssigned = item.assignedUserIds.includes(m.userId);
                          return (
                            <button
                              key={m.userId}
                              onClick={() => handleToggleAssignee(idx, m.userId)}
                              title={`${isAssigned ? 'Remove' : 'Assign'} ${m.name}`}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                                isAssigned
                                  ? 'bg-[var(--color-wakeru-primary)] border-[var(--color-wakeru-primary)] text-white shadow-xs scale-105'
                                  : 'bg-[var(--color-wakeru-surface)] border-[var(--color-wakeru-border)] text-[var(--color-wakeru-text-secondary)] hover:border-[var(--color-wakeru-text-primary)]'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${isAssigned ? 'bg-white/25' : 'bg-[var(--color-wakeru-surface-muted)]'}`}>
                                {getInitials(m.name)}
                              </span>
                              <span>{m.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Per-person cost hint */}
                      {item.assignedUserIds.length > 0 && item.amount > 0 && (
                        <div className="text-[10px] text-[var(--color-wakeru-text-tertiary)] mt-1.5 font-mono">
                          = {formatCurrency(item.amount / item.assignedUserIds.length, trip.currency)} / person
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
                <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid via SBI credit card. Reference #INV-2892"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3">
                <Link href={`/trips/${tripId}`}>
                  <Button variant="ghost">Cancel</Button>
                </Link>
                <Button
                  variant="primary"
                  isLoading={submitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 shadow-md"
                >
                  <AppIcon name="check" size={16} />
                  <span>Save Itemized Bill Split</span>
                </Button>
              </div>
            </>
          )}

          {!scanning && lineItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-wakeru-primary)]/10 text-[var(--color-wakeru-primary)] flex items-center justify-center mb-4 text-3xl">
                🧾
              </div>
              <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                Upload a receipt photo to begin
              </h3>
              <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-xs">
                Once uploaded, TripSplit will automatically extract line items and amounts from the bill.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
