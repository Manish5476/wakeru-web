import { fetchClient } from './client';
import { ISettlement, ISettlementTransaction, MemberBalance } from '@/types/settlement.types';
import { tripsApi } from './trips';
import { expensesApi } from './expenses';
import { calculateMemberBalances, simplifyDebts } from '@/lib/debtSimplifier';

const SETTLEMENT_STORAGE_PREFIX = 'tripsplit_web_settlement_';

function getStoredSettlement(tripId: string): ISettlement | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${SETTLEMENT_STORAGE_PREFIX}${tripId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveStoredSettlement(tripId: string, settlement: ISettlement): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${SETTLEMENT_STORAGE_PREFIX}${tripId}`, JSON.stringify(settlement));
  } catch {}
}

export const settlementsApi = {
  getSettlement: async (
    tripId: string,
  ): Promise<{ settlement: ISettlement; balances: MemberBalance[] }> => {
    try {
      const res = await fetchClient<{ settlement: ISettlement; balances: MemberBalance[] }>(
        `/trips/${tripId}/settlements`,
      );
      if (res?.settlement) return res;
    } catch {}

    return settlementsApi.calculateSettlement(tripId);
  },

  calculateSettlement: async (
    tripId: string,
  ): Promise<{ settlement: ISettlement; balances: MemberBalance[] }> => {
    const { trip } = await tripsApi.getTrip(tripId);
    const { expenses } = await expensesApi.getTripExpenses(tripId);

    const balances = calculateMemberBalances(trip.members, expenses);
    const simplifiedTransactions = simplifyDebts(balances, trip.currency || 'INR');

    const existing = getStoredSettlement(tripId);
    // Merge existing manual confirmations/initiated statuses
    const mergedTransactions: ISettlementTransaction[] = simplifiedTransactions.map(tx => {
      const prev = existing?.transactions.find(
        p => p.fromUserId === tx.fromUserId && p.toUserId === tx.toUserId,
      );
      if (prev) {
        return {
          ...tx,
          status: prev.status,
          paymentMethod: prev.paymentMethod,
          transactionRef: prev.transactionRef,
          initiatedAt: prev.initiatedAt,
          confirmedAt: prev.confirmedAt,
          notes: prev.notes,
        };
      }
      return tx;
    });

    const totalVolume = mergedTransactions.reduce((acc, t) => acc + t.amount, 0);
    const isFullySettled =
      mergedTransactions.length > 0 &&
      mergedTransactions.every(t => t.status === 'CONFIRMED');

    const settlement: ISettlement = {
      _id: existing?._id || `settle_${tripId}`,
      id: existing?.id || `settle_${tripId}`,
      tripId,
      currency: trip.currency || 'INR',
      transactions: mergedTransactions,
      totalSettlementVolume: totalVolume,
      isFullySettled,
      updatedAt: new Date().toISOString(),
    };

    saveStoredSettlement(tripId, settlement);

    return {
      settlement,
      balances,
    };
  },

  recordPayment: async (
    tripId: string,
    transactionId: string,
    paymentData: Partial<ISettlementTransaction>,
  ): Promise<{ settlement: ISettlement }> => {
    try {
      const res = await fetchClient<{ settlement: ISettlement }>(
        `/trips/${tripId}/settlements/pay`,
        {
          method: 'POST',
          body: JSON.stringify({ transactionId, ...paymentData }),
        },
      );
      if (res?.settlement) return res;
    } catch {}

    const { settlement } = await settlementsApi.getSettlement(tripId);
    settlement.transactions = settlement.transactions.map(tx => {
      if (tx.id === transactionId) {
        return {
          ...tx,
          ...paymentData,
          status: 'INITIATED',
          initiatedAt: new Date().toISOString(),
        };
      }
      return tx;
    });

    settlement.updatedAt = new Date().toISOString();
    settlement.isFullySettled = settlement.transactions.every(t => t.status === 'CONFIRMED');
    saveStoredSettlement(tripId, settlement);

    return { settlement };
  },

  confirmTransaction: async (
    tripId: string,
    transactionId: string,
  ): Promise<{ settlement: ISettlement }> => {
    try {
      const res = await fetchClient<{ settlement: ISettlement }>(
        `/trips/${tripId}/settlements/confirm`,
        {
          method: 'POST',
          body: JSON.stringify({ transactionId }),
        },
      );
      if (res?.settlement) return res;
    } catch {}

    const { settlement } = await settlementsApi.getSettlement(tripId);
    settlement.transactions = settlement.transactions.map(tx => {
      if (tx.id === transactionId) {
        return {
          ...tx,
          status: 'CONFIRMED',
          confirmedAt: new Date().toISOString(),
        };
      }
      return tx;
    });

    settlement.updatedAt = new Date().toISOString();
    settlement.isFullySettled = settlement.transactions.every(t => t.status === 'CONFIRMED');
    saveStoredSettlement(tripId, settlement);

    return { settlement };
  },

  settleDirect: async (
    tripId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    paymentMethod: 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD' = 'UPI',
    notes?: string,
  ): Promise<{ settlement: ISettlement; transaction: ISettlementTransaction }> => {
    const { trip } = await tripsApi.getTrip(tripId);
    const fromMember = trip.members.find(m => m.userId === fromUserId);
    const toMember = trip.members.find(m => m.userId === toUserId);

    const newTx: ISettlementTransaction = {
      id: `tx_${Date.now()}`,
      fromUserId,
      fromUserName: fromMember?.name || fromUserId,
      toUserId,
      toUserName: toMember?.name || toUserId,
      toUserUpi: toMember?.upiId,
      amount,
      currency: trip.currency || 'INR',
      status: 'CONFIRMED',
      paymentMethod,
      transactionRef: `SETTLE-${Date.now().toString().slice(-6)}`,
      confirmedAt: new Date().toISOString(),
      notes,
    };

    const { settlement } = await settlementsApi.getSettlement(tripId);
    settlement.transactions = [newTx, ...settlement.transactions];
    settlement.totalSettlementVolume += amount;
    settlement.updatedAt = new Date().toISOString();
    saveStoredSettlement(tripId, settlement);

    return { settlement, transaction: newTx };
  },
};
