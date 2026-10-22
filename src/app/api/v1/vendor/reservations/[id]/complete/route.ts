import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  let reservation = db.reservations.find(r => r.id === id || r.bookingRequestId === id);
  let booking = db.bookings.find(b => b.id === id || (reservation && b.id === reservation.bookingRequestId));

  if (!reservation && !booking) {
    return jsonError('NOT_FOUND', `Reservation "${id}" was not found`, 404);
  }

  if (reservation) {
    reservation.status = 'COMPLETED';
  }
  if (booking) {
    booking.status = 'COMPLETED';
  }

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'RESERVATION_COMPLETED',
    performedBy: auth.user.name,
    target: `Reservation: ${id}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    severity: 'INFO',
  });

  return jsonSuccess({
    message: 'Stay successfully completed and marked as fulfilled',
    reservation,
    booking,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}
