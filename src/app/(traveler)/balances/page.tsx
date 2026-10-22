'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ledgerApi, AuthoritativeBalances, CounterpartyBalance, BalanceBreakdown } from '@/api/ledger';
import { settlementsApi } from '@/api/settlements';
import { formatCurrency, getInitials } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { GlassCard } from '@/design-system/components/GlassCard';
import { StatCard } from '@/design-system/components/StatCard';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';

export default function BalancesMasterPage() {
  const [balances, setBalances] = useState<AuthoritativeBalances | null>(null);
  const [breakdown, setBreakdown] = useState<BalanceBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Settle Modal State
  const [settleTarget, setSettleTarget] = useState<CounterpartyBalance | null>(null);
  const [upiCopied, setUpiCopied] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [balRes, brkRes] = await Promise.allSettled([
        ledgerApi.getBalances(),
        ledgerApi.getBreakdown(),
      ]);

      if (balRes.status === 'fulfilled' && balRes.value?.data) {
        setBalances(balRes.value.data);
      }
      if (brkRes.status === 'fulfilled' && brkRes.value?.data) {
        setBreakdown(brkRes.value.data);
      }
    } catch (err: any) {
      console.error('Failed to load ledger balances:', err);
      setError('Could not connect to ledger service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const netAmount = balances?.netBalance ?? 0;
  const isCredit = netAmount >= 0;
  const youOweList = (balances?.counterparties || []).filter(c => c.direction === 'you_owe');
  const owesYouList = (balances?.counterparties || []).filter(c => c.direction === 'owes_you');
  const settledList = (balances?.counterparties || []).filter(c => c.direction === 'settled');

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-[var(--color-wakeru-surface-muted)] rounded-md w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-[var(--color-wakeru-surface-muted)] rounded-xl"></div>
          ))}
        </div>
        <div className="h-72 bg-[var(--color-wakeru-surface-muted)] rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
            <span>⚖️ Multi-Party Cross-Trip Clearinghouse</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            Authoritative Balances
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Real-time net positions across all trips, joint expenses, and settled payments.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="self-start md:self-auto">
          ↻ Refresh Ledger
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-[var(--radius-card)] text-xs text-amber-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Top Level Position Summary (StatCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Net Standing"
          amount={netAmount}
          currency={balances?.baseCurrency || 'INR'}
          variant={isCredit ? 'success' : 'danger'}
          subtitle={isCredit ? 'Net positive credit across trips' : 'Outstanding net debt'}
          icon={<AppIcon name="wallet" size={18} />}
        />

        <StatCard
          title="Gross You Owe"
          amount={balances?.grossYouOwe || 0}
          currency={balances?.baseCurrency || 'INR'}
          variant="danger"
          subtitle={`Payable to ${youOweList.length} companions`}
          icon={<AppIcon name="arrow-right" size={18} />}
        />

        <StatCard
          title="Gross Owed To You"
          amount={balances?.grossOwedToYou || 0}
          currency={balances?.baseCurrency || 'INR'}
          variant="success"
          subtitle={`Receivable from ${owesYouList.length} companions`}
          icon={<AppIcon name="arrow-left" size={18} />}
        />
      </div>

      {/* Counterparties Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* You Owe Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-wakeru-text-primary)] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>People You Owe</span>
            </h2>
            <span className="text-xs font-bold text-rose-600">
              {formatCurrency(balances?.grossYouOwe || 0, balances?.baseCurrency || 'INR')}
            </span>
          </div>

          {youOweList.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--color-wakeru-text-secondary)] border-dashed border-[var(--color-wakeru-border-strong)]">
              🎉 You don't owe money to anyone!
            </Card>
          ) : (
            <div className="space-y-3">
              {youOweList.map(cp => (
                <Card key={cp.counterpartyId} className="border-[var(--color-wakeru-border)] shadow-xs">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center uppercase">
                        {getInitials(cp.counterpartyName)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                          {cp.counterpartyName}
                        </p>
                        <p className="text-[10px] text-[var(--color-wakeru-text-tertiary)]">
                          Across {cp.tripIds.length} trip{cp.tripIds.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-rose-600">
                        {formatCurrency(Math.abs(cp.netAmount), balances?.baseCurrency || 'INR')}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSettleTarget(cp)}
                        className="text-xs"
                      >
                        Settle Up
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Owes You Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-wakeru-text-primary)] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>People Who Owe You</span>
            </h2>
            <span className="text-xs font-bold text-emerald-600">
              {formatCurrency(balances?.grossOwedToYou || 0, balances?.baseCurrency || 'INR')}
            </span>
          </div>

          {owesYouList.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--color-wakeru-text-secondary)] border-dashed border-[var(--color-wakeru-border-strong)]">
              No one owes you money right now.
            </Card>
          ) : (
            <div className="space-y-3">
              {owesYouList.map(cp => (
                <Card key={cp.counterpartyId} className="border-[var(--color-wakeru-border)] shadow-xs">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center uppercase">
                        {getInitials(cp.counterpartyName)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
                          {cp.counterpartyName}
                        </p>
                        <p className="text-[10px] text-[var(--color-wakeru-text-tertiary)]">
                          Across {cp.tripIds.length} trip{cp.tripIds.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-emerald-600">
                        {formatCurrency(Math.abs(cp.netAmount), balances?.baseCurrency || 'INR')}
                      </span>
                      <Badge variant="verified" size="sm">
                        Pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settle Up UPI Modal */}
      {settleTarget && (
        <Modal
          isOpen={Boolean(settleTarget)}
          onClose={() => setSettleTarget(null)}
          title={`Settle Debt with ${settleTarget.counterpartyName}`}
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[var(--color-wakeru-surface-muted)] rounded-lg text-center space-y-1">
              <span className="text-[11px] text-[var(--color-wakeru-text-secondary)]">Amount to Pay</span>
              <p className="text-2xl font-black text-rose-600">
                {formatCurrency(Math.abs(settleTarget.netAmount), balances?.baseCurrency || 'INR')}
              </p>
            </div>

            {/* Simulated UPI details */}
            <div className="space-y-2">
              <label className="font-semibold block text-[var(--color-wakeru-text-secondary)]">
                Recipient UPI ID / VPA
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-surface-elevated)] font-mono text-xs">
                <span className="flex-1 truncate">
                  {settleTarget.counterpartyEmail
                    ? `${settleTarget.counterpartyEmail.split('@')[0]}@okhdfcbank`
                    : `${settleTarget.counterpartyName.toLowerCase().replace(/\s+/g, '')}@okaxis`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const upiId = settleTarget.counterpartyEmail
                      ? `${settleTarget.counterpartyEmail.split('@')[0]}@okhdfcbank`
                      : `${settleTarget.counterpartyName.toLowerCase().replace(/\s+/g, '')}@okaxis`;
                    navigator.clipboard.writeText(upiId);
                    setUpiCopied(true);
                    setTimeout(() => setUpiCopied(false), 2000);
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold"
                >
                  {upiCopied ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-[var(--color-wakeru-text-secondary)]">
              Scan with Google Pay, PhonePe, or Paytm to complete transfer.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-wakeru-border)]">
              <Button variant="outline" size="sm" onClick={() => setSettleTarget(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
