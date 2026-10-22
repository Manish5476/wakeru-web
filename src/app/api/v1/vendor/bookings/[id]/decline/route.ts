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
  const booking = db.bookings.find(b => b.id === id);

  if (!booking) {
    return jsonError('NOT_FOUND', `Booking request "${id}" was not found`, 404);
  }

  try {
    const body = await req.json();
    const reason = body.reason || 'Dates unavailable';

    booking.status = 'DECLINED';
    booking.rejectionReason = reason;

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'BOOKING_DECLINE',
      actorId: auth.user.id,
      actorRole: auth.user.role,
      targetId: booking.id,
      details: `Vendor declined booking #${booking.id}. Reason: "${reason}"`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess({ booking });
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to decline booking', 400);
  }
}
