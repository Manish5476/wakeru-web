import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { Reservation } from '@/types/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  let reservation = db.reservations.find(r => r.id === id || r.bookingRequestId === id);

  // If not directly in reservations array, construct one from confirmed booking
  if (!reservation) {
    const booking = db.bookings.find(b => b.id === id && b.status === 'ACCEPTED');
    if (booking) {
      const generated: Reservation = {
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
          code: `PASS-${booking.id.toUpperCase()}`,
          pin: '749102',
          doorName: 'Main Entrance Smart Lock',
          wifiSsid: 'Wakeru_Guest_HighSpeed',
          wifiPassword: 'Welcome2026!',
          validUntil: `${booking.bookingDate}T23:59:59Z`,
        },
      };
      db.reservations.push(generated);
      reservation = generated;
    }
  }

  if (!reservation) {
    return jsonError('NOT_FOUND', `Reservation with ID "${id}" was not found`, 404);
  }

  return jsonSuccess({ reservation });
}
