import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { Reservation } from '@/types/api';

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

  booking.status = 'ACCEPTED';

  // Generate confirmed reservation with digital smart key pass
  const newReservation: Reservation = {
    id: `res_${booking.id}`,
    bookingRequestId: booking.id,
    bookingReference: booking.bookingReference,
    businessId: booking.businessId,
    businessName: booking.businessName,
    serviceName: booking.serviceName,
    bookingDate: booking.bookingDate,
    status: 'CONFIRMED',
    priceMinor: booking.priceSnapshotMinor,
    currency: booking.currency,
    vendorConfirmedAt: new Date().toISOString(),
    digitalKey: {
      code: `PASS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      doorName: 'Main Entrance Smart Gate',
      wifiSsid: 'Wakeru_Guest_5G',
      wifiPassword: 'SunshineGoa2026!',
      validUntil: `${booking.bookingDate}T23:59:59Z`,
    },
  };

  db.reservations.unshift(newReservation);

  // Audit log
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'BOOKING_ACCEPT',
    actorId: auth.user.id,
    actorRole: auth.user.role,
    targetId: booking.id,
    details: `Vendor accepted booking #${booking.id} and issued smart key pass ${newReservation.digitalKey?.code}`,
    createdAt: new Date().toISOString(),
  });

  return jsonSuccess({
    booking,
    reservation: newReservation,
  });
}
