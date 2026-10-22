import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  let booking = db.bookings.find(b => b.id === id);
  let reservation = db.reservations.find(r => r.id === id || r.bookingRequestId === id);

  if (!booking && !reservation) {
    return jsonError('NOT_FOUND', `Booking or reservation "${id}" was not found`, 404);
  }

  if (booking) {
    booking.status = 'COMPLETED';
  }
  if (reservation) {
    reservation.status = 'COMPLETED';
  }

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'BOOKING_COMPLETED',
    performedBy: auth.user.name,
    target: `Booking / Reservation: ${id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    severity: 'INFO',
  });

  return jsonSuccess({
    message: 'Stay successfully completed and marked as fulfilled',
    booking,
    reservation,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(req, context);
}
