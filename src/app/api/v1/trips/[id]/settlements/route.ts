import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { calculateMemberBalances, simplifyDebts } from '@/lib/debtSimplifier';
import { ISettlement } from '@/types/settlement.types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  const { id: tripId } = await params;
  const trip = db.trips.find(t => t.id === tripId || t._id === tripId);

  if (!trip) {
    return jsonError('NOT_FOUND', `Trip with ID "${tripId}" was not found`, 404);
  }

  const tripExpenses = db.expenses.filter(e => e.tripId === tripId);
  const balances = calculateMemberBalances(trip.members, tripExpenses);
  const simplifiedTransactions = simplifyDebts(balances, trip.currency || 'INR');

  const totalSettlementVolume = simplifiedTransactions.reduce((acc, t) => acc + t.amount, 0);

  const settlement: ISettlement = {
    _id: `settle_${tripId}`,
    id: `settle_${tripId}`,
    tripId,
    currency: trip.currency || 'INR',
    transactions: simplifiedTransactions,
    isFullySettled: simplifiedTransactions.length === 0,
    totalSettlementVolume,
    updatedAt: new Date().toISOString(),
  };

  return jsonSuccess({ settlement, balances });
}
