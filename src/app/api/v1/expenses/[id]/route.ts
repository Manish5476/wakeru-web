import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['TRAVELER', 'VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const idx = db.expenses.findIndex(e => e.id === id || e._id === id);

  if (idx === -1) {
    return jsonError('NOT_FOUND', `Expense with ID "${id}" was not found`, 404);
  }

  const removed = db.expenses.splice(idx, 1)[0];

  // Adjust trip's spentBase
  const trip = db.trips.find(t => t.id === removed.tripId || t._id === removed.tripId);
  if (trip) {
    trip.spentBase = Math.max(0, (trip.spentBase || 0) - removed.amount);
  }

  return jsonSuccess({ deleted: true, expenseId: id });
}
