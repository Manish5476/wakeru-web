import { ITrip } from '@/types/trip.types';
import { IExpense } from '@/types/expense.types';
import { ISettlement, MemberBalance } from '@/types/settlement.types';
import { formatCurrency, formatDateShort } from './formatters';

/**
 * Generates and triggers a browser download of an RFC-4180 compliant CSV spreadsheet
 * containing all trip expenses, line items, and split allocations.
 */
export function exportExpensesToCsv(trip: ITrip, expenses: IExpense[]): void {
  if (typeof window === 'undefined') return;

  const headers = [
    'Expense ID',
    'Date',
    'Title',
    'Category',
    'Amount',
    'Currency',
    'Paid By',
    'Split Type',
    'Participants Count',
    'Notes',
  ];

  const rows = expenses.map(e => [
    `"${e._id || e.id || ''}"`,
    `"${e.date || ''}"`,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${e.category || 'other'}"`,
    e.amount.toFixed(2),
    `"${e.currency || trip.currency || 'INR'}"`,
    `"${(e.paidByName || e.paidBy || '').replace(/"/g, '""')}"`,
    `"${e.splitType || 'EQUAL'}"`,
    e.splits.length,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const sanitizedTitle = (trip.title || 'trip').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedTitle}_expenses_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates formatted text summary ready for 1-click clipboard copy or WhatsApp group sharing.
 */
export function generateWhatsAppSettlementSummary(
  trip: ITrip,
  settlement: ISettlement,
  balances: MemberBalance[],
): string {
  const currency = trip.currency || 'INR';
  const totalSpend = trip.spentBase || 0;
  const safeBalances = Array.isArray(balances) ? balances : [];
  const memberCount = Array.isArray(trip.members) ? trip.members.length : 0;

  const lines: string[] = [
    `✈️ *${trip.title || 'Trip'} — Expense & Settlement Ledger*`,
    `📍 Destination: ${trip.destination}`,
    `💰 Total Group Spend: ${formatCurrency(totalSpend, currency)}`,
    `👥 Group Size: ${memberCount} companions`,
    '',
    `📊 *Member Balances:*`,
  ];

  safeBalances.forEach(b => {
    const net = b.netBalance;
    const sign = net > 0 ? '+ (Owed)' : net < 0 ? '- (Owes)' : '(Settled)';
    lines.push(`• ${b.userName}: Paid ${formatCurrency(b.totalPaid, currency)} | Net: ${formatCurrency(Math.abs(net), currency)} ${sign}`);
  });

  lines.push('');
  lines.push(`⚡ *Optimized Settlements (Min-Cash-Flow):*`);

  if (!settlement?.transactions || settlement.transactions.length === 0) {
    lines.push('🎉 All debts are completely settled up!');
  } else {
    settlement.transactions.forEach((tx, idx) => {
      const statusIcon = tx.status === 'CONFIRMED' ? '✅' : '⏳';
      const upiText = tx.toUserUpi ? ` (UPI: ${tx.toUserUpi})` : '';
      lines.push(`${idx + 1}. ${tx.fromUserName} ➔ ${tx.toUserName}: ${formatCurrency(tx.amount, tx.currency)}${upiText} [${statusIcon} ${tx.status}]`);
    });
  }

  lines.push('');
  lines.push(`Shared via TripSplit 🌴 View live hub at: https://tripsplit.app/trips/${trip._id || trip.id}`);

  return lines.join('\n');
}
